import {xyzSpace} from "../math/space.mjs";
import type {Voxel} from "../math/voxel.mjs";

/**
 * Generate a list of voxels that represent a sphere.
 * Providing inner radius allow the sphere to be hollow.
 *
 * @param radius
 * @param innerRadius
 */
export function generateSphere(radius: number, innerRadius = 0): Voxel[] {
    const voxels: Voxel[] = [];

    const squaredRadius = radius * radius;
    const squaredInnerRadius = innerRadius * innerRadius;

    for (const pos of xyzSpace(radius)) {
        const norm = pos.squaredNorm();
        if (norm >= squaredRadius) {
            continue;
        }
        if (norm <= squaredInnerRadius) {
            continue;
        }
        voxels.push(pos);
    }
    return voxels;
}