/**
 * a b c
 * d e f
 * g h i
 *
 * a d g
 * b e h
 * c f i
 */
export class Matrix3x3 extends Float32Array {

    static identity() {
        return new Matrix3x3(
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        );
    }

    constructor(
        a: number,
        b: number,
        c: number,
        d: number,
        e: number,
        f: number,
        g: number,
        h: number,
        i: number,
    ) {
        super([a, b, c, d, e, f, g, h, i]);
    }
}