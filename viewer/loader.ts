import * as THREE from 'three';
import {type ColorsMap, fetchColors} from "./utils.js";

export type RGB = [number, number, number];

export class LdrawjsLoader {
    readonly cache = new Map<number, Promise<ArrayBuffer>>();

    constructor(readonly colorsMap: ColorsMap) {
    }

    async load(id: number, parentColor?: RGB): Promise<THREE.Group> {
        let bufferPromise = this.cache.get(id);
        if (!bufferPromise) {
            bufferPromise = fetch(`http://127.0.0.1:3000/${id}`).then(res => res.arrayBuffer());
            this.cache.set(id, bufferPromise);
        }

        const buf = await bufferPromise;
        const view = new DataView(buf);

        const group = new THREE.Group();
        const positions = [];
        const colors = [];
        const linePositions: number[] = [];
        const lineColors: number[] = [];
        const subPartsPromises: Promise<void>[] = [];

        let offset = 0;

        function vector() {
            const x = view.getFloat32(offset, true);
            offset += 4;
            const y = view.getFloat32(offset, true);
            offset += 4;
            const z = view.getFloat32(offset, true);
            offset += 4;
            return {x, y, z};
        }


        while (offset < buf.byteLength) {
            // line type
            const type = view.getUint8(offset);
            offset += 1;

            // line color
            const colorId = view.getInt32(offset, true);
            offset += 4;

            const rgb = colorId === 16 && parentColor
                ? parentColor
                : this.colorsMap[colorId] as RGB;

            if (2 === type) {
                // line is 2 points
                for (let i = 0; i < 6; i++) {
                    linePositions.push(view.getFloat32(offset, true));
                    offset += 4;
                }
                // color for all points
                for (let i = 0; i < 2; i++) {
                    lineColors.push(rgb[0], rgb[1], rgb[2]);
                }
            } else if (3 === type) {
                // triangle is 3 points
                for (let i = 0; i < 9; i++) {
                    positions.push(view.getFloat32(offset, true));
                    offset += 4;
                }
                // color for all points
                for (let i = 0; i < 3; i++) {
                    colors.push(rgb[0], rgb[1], rgb[2]);
                }

            } else if (4 === type) {
                // quad -> 2 triangles
                const v1 = vector();
                const v2 = vector();
                const v3 = vector();
                const v4 = vector();

                positions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z, v3.x, v3.y, v3.z);
                positions.push(v1.x, v1.y, v1.z, v3.x, v3.y, v3.z, v4.x, v4.y, v4.z);

                // color for all points
                for (let i = 0; i < 6; i++) {
                    colors.push(rgb[0], rgb[1], rgb[2]);
                }

            } else if (1 === type) {
                // translation
                const p = vector();
                // rotation/scale
                const u = vector();
                const w = vector();
                const t = vector();

                const fileId = view.getUint32(offset, true);
                offset += 4;

                const matrix = new THREE.Matrix4().set(
                    u.x, u.y, u.z, p.x,
                    w.x, w.y, w.z, p.y,
                    t.x, t.y, t.z, p.z,
                    0, 0, 0, 1
                );

                const loadSubPart = async () => {
                    const subGroup = await this.load(fileId, rgb);
                    subGroup.applyMatrix4(matrix);
                    group.add(subGroup);
                };

                subPartsPromises.push(loadSubPart());
            }
        }

        if (positions.length) {
            const geometry = new THREE.BufferGeometry();

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(positions), 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

            geometry.computeVertexNormals();

            const material = new THREE.MeshStandardMaterial({
                vertexColors: true,
                side: THREE.DoubleSide,
                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1
            });

            const mesh = new THREE.Mesh(geometry, material);
            group.add(mesh);
        }

        if (linePositions.length) {
            const lineGeometry = new THREE.BufferGeometry();
            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
            lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

            const lineMaterial = new THREE.LineBasicMaterial({
                vertexColors: true,
                linewidth: 1
            });

            const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
            group.add(lineSegments);
        }
        await Promise.all(subPartsPromises);
        return group;
    }
}

export async function createLoader() {
    const colorsMap = await fetchColors();
    return new LdrawjsLoader(colorsMap);
}