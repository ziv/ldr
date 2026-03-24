import * as THREE from 'three';
import {
    type ColorDef,
    type ColorsMap, FINISH_TYPE_CHROME,
    FINISH_TYPE_DEFAULT, FINISH_TYPE_MATTE_METALLIC, FINISH_TYPE_METAL,
    FINISH_TYPE_PEARLESCENT, FINISH_TYPE_RUBBER,
    type PartDef
} from "./ldraw-primitives.mjs";

export type RGB = [number, number, number];
export type FileContent = (string | number)[][];

// const DB_URL = "https://cdn.jsdelivr.net/gh/ziv/ldr@main/ldrawdb/";
const DB_URL = "https://raw.githubusercontent.com/ziv/ldr/refs/heads/main/ldrawdb/";
const USE_PARENT_COLOR = 0;

// helpers

const fetchPart = async <T>(name: string) => {
    // first get from cache if available
    let data = localStorage.getItem(`cache:${name}`);
    if (data) {
        return JSON.parse(data);
    }

    const r = await fetch(DB_URL + name);
    if (!r.ok) {
        throw new Error(`Failed to fetch "${name}"`);
    }

    data = await r.json();
    localStorage.setItem(`HTTP_CACHE:${name}`, JSON.stringify(data));
    return data as T;
}


export class LdrawJsLoader {
    static colorsLoaded = false;
    static colorsMap: ColorsMap = {};

    readonly fetchCache = new Map<string, Promise<PartDef>>();
    readonly materialsCache = new Map<string, THREE.MeshStandardMaterial>();


    readonly loading = {
        loaded: 0,
        total: 0,
    };

    constructor(readonly colors: Record<number, RGB>) {
    }

    // todo rebuild colors database and add edges
    color(id: number): RGB {
        // if (id === 16 || id === 24) {
        //     return this.colors[parent] as RGB;
        // }
        if (id in this.colors) {
            return this.colors[id] as RGB;
        }
        return [255, 0, 255];
    }

    material(code: string) {
        // cache first
        if (this.materialsCache.has(code)) {
            return this.materialsCache.get(code)!.clone();
        }

        const def = LdrawJsLoader.colorsMap[code] as ColorDef;
        const material = new THREE.MeshStandardMaterial(def.materialArgs);

        material.color.setStyle(def.fillColor, THREE.SRGBColorSpace);
        material.transparent = def.alpha < 1;
        material.opacity = def.alpha;
        material.depthWrite = !material.transparent;
        material.polygonOffset = true;
        material.polygonOffsetFactor = 1;
    }

    async load(partName: string, parentColor = USE_PARENT_COLOR): Promise<THREE.Group> {
        // make sure colors is loaded, happened once
        if (!LdrawJsLoader.colorsLoaded) {
            LdrawJsLoader.colorsMap = await fetchPart<ColorsMap>("colors.json");
        }

        // we keep the promises to ensure we don't fetch the same part multiple times in parallel
        // the promise is enough since it marked the data as fetched even if it's not ready yet
        let partPromise = this.fetchCache.get(partName);
        if (!partPromise) {
            partPromise = fetchPart<PartDef>(partName);
            this.fetchCache.set(partName, partPromise);
        }

        const data = await partPromise;

        // map missing data (browser items)


        const group = new THREE.Group();

        const facesPositions: number[] = [];
        const facesColors: number[] = [];

        const linePositions: number[] = [];
        const lineColors: number[] = [];

        const optionalsPositions: number[] = [];
        const optionalsControls: number[] = [];
        const optionalColors: number[] = [];

        const subPartsPromises: Promise<void>[] = [];

        for (const line of data) {
            const type = line[0] as number;
            const partColor = line[1] as number;
            const color = partColor === 16 || partColor === 24 ? parentColor : partColor;
            if (0 === type) {
                // todo handle BFC
                continue;
            }
            if (1 === type) {
                const x = line[2] as number;
                const y = line[3] as number;
                const z = line[4] as number;
                const a = line[5] as number;
                const b = line[6] as number;
                const c = line[7] as number;
                const d = line[8] as number;
                const e = line[9] as number;
                const f = line[10] as number;
                const g = line[11] as number;
                const h = line[12] as number;
                const i = line[13] as number;

                const file = line[14] as string;

                const matrix = new THREE.Matrix4().set(
                    a, b, c, x,
                    d, e, f, y,
                    g, h, i, z,
                    0, 0, 0, 1
                );

                subPartsPromises.push(this.load(file, color).then(subPart => {
                    // todo apply colors?!
                    subPart.applyMatrix4(matrix);
                    group.add(subPart);
                }));
            } else if (2 === type) {
                // 2 points
                linePositions.push(...(line.slice(2, 8) as number[]));
                lineColors.push(color, color);
            } else if (3 === type) {
                // 3 points -> 1 * triangle (3 vectors)
                facesPositions.push(...(line.slice(2, 11) as number[]));
                facesColors.push(color, color, color);
            } else if (4 === type) {
                // 4 points -> 2 * triangles (4 vectors)
                const v1 = line.slice(2, 5) as number[];
                const v2 = line.slice(5, 8) as number[];
                const v3 = line.slice(8, 11) as number[];
                const v4 = line.slice(11, 14) as number[];

                facesPositions.push(...v1, ...v2, ...v3);
                facesPositions.push(...v1, ...v3, ...v4);

                facesColors.push(color, color, color);
                facesColors.push(color, color, color);
            } else if (5 === type) {
                const v1 = line.slice(2, 5) as number[];
                const v2 = line.slice(5, 8) as number[];
                const c1 = line.slice(8, 11) as number[];
                const c2 = line.slice(11, 14) as number[];

                optionalsPositions.push(...v1, ...v2);
                optionalsControls.push(...c1, ...c2);
                optionalColors.push(color, color);
            }
        }

        // wait for the subparts to processed
        await Promise.all(subPartsPromises);

        if (facesPositions.length > 0) {
            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(facesPositions), 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(facesColors.map(c => this.color(c)).flat()), 3));

            geometry.computeVertexNormals();

            const material = new THREE.MeshStandardMaterial({
                vertexColors: true,
                side: THREE.DoubleSide,
                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1,
            });
            group.add(new THREE.Mesh(geometry, material));
        }

        if (linePositions.length > 0) {
            const lineGeometry = new THREE.BufferGeometry();

            // todo colors should come from edges
            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(linePositions), 3));
            lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(lineColors.map(c => [0, 0, 0]).flat()), 3));

            const lineMaterial = new THREE.LineBasicMaterial({
                vertexColors: true,
                linewidth: 1
            });

            const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
            group.add(lineSegments);
        }

        if (optionalsPositions.length > 0) {
            const optionalGeometry = new THREE.BufferGeometry();

            // todo colors should come from edges
            optionalGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(optionalsPositions), 3));
            optionalGeometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(optionalColors.map(() => [0, 255, 0]).flat()), 3));
            optionalGeometry.setAttribute('control', new THREE.Float32BufferAttribute(new Float32Array(optionalsControls), 3));

            const lineMaterial = new THREE.LineBasicMaterial({
                vertexColors: true,
                side: THREE.DoubleSide,
                linewidth: 1
            });

            const lineSegments = new THREE.LineSegments(optionalGeometry, lineMaterial);
            group.add(lineSegments);
        }

        this.loading.loaded++;
        return group;
    }
}
