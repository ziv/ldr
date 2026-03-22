import {Vector2} from "./vector.mjs";
import {Voxel} from "./voxel.mjs";

/**
 * Generate a 2D space of the given size, yielding Vector2 coordinates for each point in the space.
 * @param size
 */
export function* xzSpace(size: number): Generator<Vector2> {
    const s = -1 * size
    const e = size
    for (let x = s; x <= e; x++) {
        for (let z = s; z <= e; z++) {
            yield new Vector2(x, z);
        }
    }
}

/**
 * Generates a 3D space of the given size, yielding Vec3 coordinates for each point in the space.
 * @param size
 */
export function* xyzSpace(size: number): Generator<Voxel> {
    const from = -1 * size
    const to = size

    for (let x = from; x <= to; x++) {
        for (let y = from; y <= to; y++) {
            for (let z = from; z <= to; z++) {
                yield new Voxel(x, y, z);
            }
        }
    }
}