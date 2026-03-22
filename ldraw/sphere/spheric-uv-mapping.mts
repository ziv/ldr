import {Vector2, type Vector3} from "../math/vector.mjs";

export function sphericUvMapping(vec: Vector3): Vector2 {
    const n = vec.normalize();

    // polar coordinates
    const theta = Math.atan2(n.z, n.x);
    const phi = Math.asin(n.y);

    // // UV mapping
    let u = (theta + Math.PI) / (2 * Math.PI);
    let v = ((phi + Math.PI / 2) / Math.PI);

    // protect against out of bound
    u = Math.max(0, Math.min(0.999999, u));
    v = Math.max(0, Math.min(0.999999, v));

    return new Vector2(u, v);
}