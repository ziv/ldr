/**
 * Image pixels map
 */
export type ImageData = {
    width: number;
    height: number;
    data: Uint8Array;
};

export class Vector2 {
    constructor(public x: number, public y: number) {
    }

    get theta() {
        return this.x;
    }

    get phi() {
        return this.y;
    }

    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}

export class Vector3 {
    constructor(public x: number, public y: number, public z: number) {
    }

    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * Since the cube size is 20x24x20 we need to add the fix to the Y axis
     */
    cubesNorm() {
        return Math.sqrt(this.x * this.x + this.y * this.y * 4 / 3 + this.z * this.z);
    }

    multiply(scalar: number) {
        return Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    add(vector: Vector3) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
    }
}

export class LdrawPart {
    /**
     * default transform (identity matrix)
     */
    transform: [Vector3, Vector3, Vector3] = [Vec3(1, 0, 0), Vec3(0, 1, 0), Vec3(0, 0, 1)];

    constructor(public pos: Vector3,
                public color: number | string,
                public part: string) {
    }

    toString() {
        const color = this.color;
        const part = this.part;
        const matrix = this.transform;
        const {x, y, z} = this.pos;
        const [a, b, c, d, e, f, g, h, i] = [
            matrix[0].x, matrix[0].y, matrix[0].z,
            matrix[1].x, matrix[1].y, matrix[1].z,
            matrix[2].x, matrix[2].y, matrix[2].z,
        ]
        return `1 ${color} ${x * 20} ${y * 24} ${z * 20} ${a} ${b} ${c} ${d} ${e} ${f} ${g} ${h} ${i} ${part}`;
    }
}


// factory functions

export function Vec3(x = 0, y = 0, z = 0): Vector3 {
    return new Vector3(x, y, z);
}

export function Vec2(x = 0, y = 0): Vector2 {
    return new Vector2(x, y);
}

export function Part(pos: Vector3, color = 1, part = "3005.dat") {
    return new LdrawPart(pos, color, part);
}