import * as THREE from 'three';

export type RGB = [number, number, number];
export type FileContent = (string | number)[][];

// const DB_URL = "https://cdn.jsdelivr.net/gh/ziv/ldr@main/ldrawdb/";
const DB_URL = "https://raw.githubusercontent.com/ziv/ldr/refs/heads/main/ldrawdb/";
const USE_PARENT_COLOR = 16;


/**
 * Fetch part from remote server or persistent cache
 * @param name
 */
async function fetchPart(name: string): Promise<FileContent> {
    name = name.replace(".dat", ".json");

    const data = localStorage.getItem(`HTTP_CACHE:${name}`);
    if (data) {
        return JSON.parse(data);
    }

    const candidates = [
        name,
        `parts/${name}`,
        `parts/s/${name}`,
        `p/${name}`,
        `p/8/${name}`,
        `p/48/${name}`,
    ]
    for (const candidate of candidates) {
        const res = await fetch(DB_URL + candidate);
        if (!res.ok || res.status !== 200) {
            continue;
        }
        const text = await res.text();
        localStorage.setItem(`HTTP_CACHE:${name}`, text);
        return JSON.parse(text);
    }
    throw new Error('Part not found, aborting.');
}

export class LdrawJsLoader {
    readonly fetchCache = new Map<string, Promise<FileContent>>();

    constructor(readonly colors: Record<number, RGB>) {
    }

    color(id: number): RGB {
        if (id in this.colors) {
            console.log(id);
            return this.colors[id] as RGB;
        }
        return [255, 0, 255];
    }

    async load(partName: string, parentColor = USE_PARENT_COLOR): Promise<THREE.Group> {
        // we keep the promises to ensure we don't fetch the same part multiple times in parallel
        // the promise is enough since it marked the data as fetched even if it's not ready yet
        let partPromise = this.fetchCache.get(partName);
        if (!partPromise) {
            partPromise = fetchPart(partName);
            this.fetchCache.set(partName, partPromise);
        }

        const data = await partPromise;
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
            const color = line[1] as number;
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
            lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(lineColors.map(c => [255, 0, 255]).flat()), 3));

            const lineMaterial = new THREE.LineBasicMaterial({
                vertexColors: true,
                linewidth: 1
            });

            const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
            group.add(lineSegments);
        }
        return group;
    }
}
