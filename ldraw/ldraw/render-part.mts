import type {Voxel} from "../math/voxel.mjs";
import {Vector3} from "../primitives.mjs";

const defaultTransform: [Vector3, Vector3, Vector3] = [
    new Vector3(1, 0, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 0, 1),
]

export function renderPart(voxel: Voxel, part = "3005.dat") {
    const color = voxel.color;
    const matrix = defaultTransform;
    const {x, y, z} = voxel;
    const [a, b, c, d, e, f, g, h, i] = [
        matrix[0].x, matrix[0].y, matrix[0].z,
        matrix[1].x, matrix[1].y, matrix[1].z,
        matrix[2].x, matrix[2].y, matrix[2].z,
    ]
    return `1 ${color} ${x * 20} ${y * 24} ${z * 20} ${a} ${b} ${c} ${d} ${e} ${f} ${g} ${h} ${i} ${part}`;
}