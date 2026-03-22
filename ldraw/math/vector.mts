export class Vector2 extends Float32Array {
    constructor(x: number, y: number) {
        super([x, y]);
    }

    get x() {
        return this[0] as number;
    }

    set x(x: number) {
        this[0] = x;
    }

    get y() {
        return this[1] as number;
    }

    set y(y: number) {
        this[1] = y;
    }

    // accessors for algebraic notation

    get a() {
        return this.x;
    }

    get b() {
        return this.y;
    }

    // accessors for polar coordinates

    get theta() {
        return this.x;
    }

    get phi() {
        return this.y;
    }
}

//
// export class Vector2 {
//     raw: Int16Array = new Int16Array(2);
//
//     constructor(public x: number, public y: number) {
//         this.raw[0] = x;
//         this.raw[1] = y;
//     }
//
//     // accessors for algebraic notation
//
//     get a() {
//         return this.x;
//     }
//
//     get b() {
//         return this.y;
//     }
//
//     // accessors for polar coordinates
//
//     get theta() {
//         return this.x;
//     }
//
//     get phi() {
//         return this.y;
//     }
//
//     squaredNorm() {
//         return this.x * this.x + this.y * this.y;
//     }
//
//     norm() {
//         return Math.sqrt(this.squaredNorm());
//     }
// }

export class Vector3 extends Float32Array {
    constructor(x: number, y: number, z: number) {
        super([x, y, z]);
    }

    get x() {
        return this[0] as number;
    }

    set x(x: number) {
        this[0] = x;
    }

    get y() {
        return this[1] as number;
    }

    set y(y: number) {
        this[1] = y;
    }

    get z() {
        return this[2] as number;
    }

    set z(z: number) {
        this[2] = z;
    }

    squaredNorm() {
        const x = this[0] as number;
        const y = this[1] as number;
        const z = this[2] as number;
        return x * x + y * y + z * z;
    }

    norm() {
        return Math.sqrt(this.squaredNorm());
    }

    normalize() {
        const n = this.norm();
        if (0 === n) {
            // we can not divide by zero, so we return the zero vector
            return new Vector3(0, 0, 0);
        }
        return this.divide(n);
    }

    divide(scalar: number) {
        if (0 === scalar) {
            throw new Error("Cannot divide by zero");
        }
        return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
    }

    multiply(scalar: number) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    // unit() {
    //     const norma = 1 / this.norm();
    //     return new Vector3(this.x * norma, this.y * norma, this.z * norma);
    // }
    //
    // multiply(scalar: number) {
    //     return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    // }
    //
    // add(vector: Vector3) {
    //     return new Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
    // }
}