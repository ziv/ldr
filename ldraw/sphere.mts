import {xyzSpace, xzSpace} from "./generators.mjs";
import {type ImageData, LdrawPart, Part, Vec2, Vec3, Vector2, Vector3} from "./primitives.mjs";
import {getNearestColor} from "./colors.mjs";


export function getPolar(center: Vector3, pos: Vector3) {
    const dv = Vec3(
        pos.x - center.x,
        pos.y - center.y,
        pos.z - center.z,
    );

    const radius = dv.norm();

    if (0 === radius) {
        // do not divide by zero
        return Vec2();
    }

    // normal vector (size 1)
    const n = dv.multiply(1 / radius);

    // polar
    const theta = Math.atan2(n.z, n.x);
    const phi = Math.asin(n.y);

    return Vec2(theta, phi);
}

function getVoxelPosition(polar: Vector2, imageWidth: number, imageHeight: number): Vector2 {
    // UV mapping
    let u = (polar.theta + Math.PI) / (2 * Math.PI);
    let v = ((polar.phi + Math.PI / 2) / Math.PI);

    // protect against out of bound
    u = Math.max(0, Math.min(0.999999, u));
    v = Math.max(0, Math.min(0.999999, v));

    const pixelX = Math.floor(u * imageWidth);
    const pixelY = Math.floor(v * imageHeight);

    return Vec2(pixelX, pixelY);
    // pixel location (size 4)
    // return (pixelY * imageWidth + pixelX) * 4;
}

/**
 * Create a sphere
 *
 * @param radius
 * @param thickness
 */
export function createSphere(radius: number, thickness = 2): LdrawPart[] {
    const map: LdrawPart[] = [];

    for (const ver of xyzSpace(radius)) {
        const norm = ver.cubesNorm();
        if (radius < norm) {
            continue;
        }
        const diff = Math.abs(radius - norm);
        if (diff >= thickness) {
            continue;
        }
        map.push(Part(ver));
    }
    return map;
}

export function createRings(radius: number, thickness = 2): LdrawPart[] {
    const map: LdrawPart[] = [];

    for (const ver of xzSpace(radius)) {
        const norm = ver.norm();
        if (radius < norm) {
            continue;
        }
        const diff = Math.abs(radius - norm);
        if (diff >= thickness) {
            continue;
        }
        map.push(Part(Vec3(ver.x, 0, ver.y)));
    }
    return map;
}

export function wrapSphere(sphere: LdrawPart[], img: ImageData, threshold = 1) {
    for (const part of sphere) {
        const radius = part.pos.norm();

        // normal vector (size 1)
        const n = part.pos.multiply(1 / radius);

        // polar coordinates
        const theta = Math.atan2(n.z, n.x);
        const phi = Math.asin(n.y);

        // UV mapping
        let u = (theta + Math.PI) / (2 * Math.PI);
        let v = ((phi + Math.PI / 2) / Math.PI);

        // protect against out of bound
        u = Math.max(0, Math.min(0.999999, u));
        v = Math.max(0, Math.min(0.999999, v));

        // image coordinates
        const x = Math.floor(u * img.width);
        const y = Math.floor(v * img.height);

        // pixel position (each pixel contain 4 numbers: r, g, b, a)
        const pos = (y * img.width + x) * 4;

        const r = img.data[pos] as number;
        const g = img.data[pos + 1] as number;
        const b = img.data[pos + 2] as number;

        // find the closest LEGO color
        part.color = getNearestColor([r, g, b]).code;
    }
    return sphere;
}

export function wrapRings(rings: LdrawPart[], img: ImageData, rInner: number, rOuter: number) {
    for (const part of rings) {
        const v2 = Vec2(part.pos.x, part.pos.z);
        const radius = v2.norm();

        const theta = Math.atan2(v2.y, v2.x);
        let u = (theta + Math.PI) / (2 * Math.PI);
        let v = 1 - (radius - rInner) / (rOuter - rInner);

        u = Math.max(0, Math.min(0.999999, u));
        v = Math.max(0, Math.min(0.999999, v));

        const x = Math.floor(u * img.width);
        const y = Math.floor(v * img.height);

        const pos = (y * img.width + x) * 4;

        const r = img.data[pos] as number;
        const g = img.data[pos + 1] as number;
        const b = img.data[pos + 2] as number;

        // find the closest LEGO color
        part.color = getNearestColor([r, g, b]).code;
    }
    return rings;
}