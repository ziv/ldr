import {Vec2, Vec3, type Vector2, type Vector3} from "./primitives.mjs";

/**
 * Generates a 3D space of the given size, yielding Vec3 coordinates for each point in the space.
 * @param size
 */
export function* xyzSpace(size: number): Generator<Vector3> {
    const s = -1 * size
    const e = size
    for (let y = e; y >= s; y--) {
        for (let x = s; x <= e; x++) {
            for (let z = s; z <= e; z++) {
                yield Vec3(x, y, z);
            }
        }
    }
}

/**
 * Generate a 2D space of the given size, yielding Vec2 coordinates for each point in the space.
 * @param size
 */
export function* xzSpace(size: number): Generator<Vector2> {
    const s = -1 * size
    const e = size
    for (let x = s; x <= e; x++) {
        for (let z = s; z <= e; z++) {
            yield Vec2(x, z);
        }
    }
}