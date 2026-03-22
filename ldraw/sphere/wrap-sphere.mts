import type {Voxel} from "../math/voxel.mjs";
import type {ImageData} from "../image/get-image-data.mjs";
import {sphericUvMapping} from "./spheric-uv-mapping.mjs";
import {getNearestColor} from "../colors.mjs";

export function wrapSphere(voxels: Voxel[], img: ImageData) {

    /// build voxels map for simplify the lookups
    const voxelsMap = new Map<string, Voxel>();
    voxels.forEach(v => voxelsMap.set(`${v.x},${v.y},${v.z}`, v));

    /**
     * In a sphere, visibility is only for the outside elements and not those that face the center.
     *
     * @param v
     */
    function isVoxelVisible(v: Voxel): boolean {
        if (v.x > 0 && !voxelsMap.has(`${v.x + 1},${v.y},${v.z}`)) {
            return true;
        }
        if (v.x < 0 && !voxelsMap.has(`${v.x - 1},${v.y},${v.z}`)) {
            return true;
        }
        if (v.y > 0 && !voxelsMap.has(`${v.x},${v.y + 1},${v.z}`)) {
            return true;
        }
        if (v.y < 0 && !voxelsMap.has(`${v.x},${v.y - 1},${v.z}`)) {
            return true;
        }
        if (v.z > 0 && !voxelsMap.has(`${v.x},${v.y},${v.z + 1}`)) {
            return true;
        }
        if (v.z < 0 && !voxelsMap.has(`${v.x},${v.y},${v.z - 1}`)) {
            return true;
        }
        return false;
    }

    for (const v of voxels) {
        if (!isVoxelVisible(v)) {
            continue;
        }

        // sphere to 2d projection
        const uv = sphericUvMapping(v);
        const x = Math.floor(uv.x * img.width);
        const y = Math.floor(uv.y * img.height);
        // pixel position (each pixel contain 4 numbers: r, g, b, a)
        const pos = (y * img.width + x) * 4;

        // RGB values
        const r = img.data[pos] as number;
        const g = img.data[pos + 1] as number;
        const b = img.data[pos + 2] as number;

        // find the closest LEGO color
        // console.error([r, g, b]);
        v.color = getNearestColor([r, g, b]).code;
    }
    return voxels;
}