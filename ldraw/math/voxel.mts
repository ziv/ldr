import {Vector3} from "./vector.mjs";

/**
 * Since the cube size is 20x24x20 we need to add the fix to the Y axis
 * 24/20 = 6/5 = 1.2
 */
const SCALE_Y = 1.2 * 1.2;

export class Voxel extends Vector3 {

    /**
     * LDraw colors
     * -1 means "don't care" - the voxel is not visible, so we can ignore its color when checking if a brick can fit.
     */
    color: string | number = -1;

    squaredNorm() {
        return this.x * this.x + this.y * this.y * SCALE_Y + this.z * this.z;
    }
}