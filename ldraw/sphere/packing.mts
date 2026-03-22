import type {Voxel} from "../math/voxel.mjs";

export interface BrickType {
    width: number;  // גודל בציר X (ברשת שלנו)
    depth: number;  // גודל בציר Z (ברשת שלנו)
    partId: string; // השם ב-LDraw (למשל '3001.dat')
    matrix: string; // מטריצת הסיבוב של LDraw
}

export interface PlacedBrick {
    x: number;
    y: number;
    z: number;
    brickType: BrickType;
    color: number | string;
}

// מטריצת יחידה (0 מעלות סיבוב - הלבנה מונחת לאורך ציר ה-X)
const MATRIX_0_DEG = "1 0 0 0 1 0 0 0 1";

// מטריצת סיבוב 90 מעלות סביב ציר Y (הלבנה מונחת לאורך ציר ה-Z)
const MATRIX_90_DEG = "0 0 -1 0 1 0 1 0 0";

// X-axis aligned bricks (even layers)
const X_ALIGNED_BRICKS: BrickType[] = [
    {width: 4, depth: 2, partId: '3001.dat', matrix: MATRIX_0_DEG},
    {width: 4, depth: 1, partId: '3010.dat', matrix: MATRIX_0_DEG},
    {width: 3, depth: 2, partId: '3003.dat', matrix: MATRIX_0_DEG},
    {width: 3, depth: 1, partId: '3622.dat', matrix: MATRIX_0_DEG},
    {width: 2, depth: 2, partId: '3003.dat', matrix: MATRIX_0_DEG},
    {width: 2, depth: 1, partId: '3004.dat', matrix: MATRIX_0_DEG},
    {width: 1, depth: 1, partId: '3005.dat', matrix: MATRIX_0_DEG}
];

// Z-axis aligned bricks (odd layers)
const Z_ALIGNED_BRICKS: BrickType[] = [
    {width: 2, depth: 4, partId: '3001.dat', matrix: MATRIX_90_DEG},
    {width: 1, depth: 4, partId: '3010.dat', matrix: MATRIX_90_DEG},
    {width: 2, depth: 3, partId: '3003.dat', matrix: MATRIX_90_DEG},
    {width: 1, depth: 3, partId: '3622.dat', matrix: MATRIX_90_DEG},
    {width: 2, depth: 2, partId: '3003.dat', matrix: MATRIX_0_DEG}, // 2x2 ריבוע, לא דורש סיבוב
    {width: 1, depth: 2, partId: '3004.dat', matrix: MATRIX_90_DEG},
    {width: 1, depth: 1, partId: '3005.dat', matrix: MATRIX_0_DEG}  // 1x1 ריבוע
];

function packSlice(yLevel: number, voxels: Voxel[]) {
    const placed: PlacedBrick[] = [];
    if (0 === voxels.length) {
        return placed;
    }

    // boundaries
    const minX = Math.min(...voxels.map(v => v.x));
    const maxX = Math.max(...voxels.map(v => v.x));
    const minZ = Math.min(...voxels.map(v => v.z));
    const maxZ = Math.max(...voxels.map(v => v.z));

    // grid that represent what we already placed
    const grid = new Map<string, Voxel>();
    voxels.forEach(v => grid.set(`${v.x},${v.z}`, v));

    const isEvenLayer = Math.abs(yLevel) % 2 === 0;
    const preferredBricks = isEvenLayer ? X_ALIGNED_BRICKS : Z_ALIGNED_BRICKS;

    function canFit(startX: number, startZ: number, b: BrickType, color: string | number) {
        for (let dx = 0; dx < b.width; ++dx) {
            for (let dz = 0; dz < b.depth; ++dz) {
                const voxel = grid.get(`${startX + dx},${startZ + dz}`);
                // there is no voxel (not exists or taken)
                if (!voxel) {
                    return false;
                }
                // not the same color and not "don't care" color
                if (voxel.color !== color && voxel.color !== -1) {
                    return false;
                }
            }
        }
        return true;
    }

    function placeBrick(startX: number, startZ: number, b: BrickType, color: string | number) {
        // remove voxels from grid
        for (let dx = 0; dx < b.width; ++dx) {
            for (let dz = 0; dz < b.depth; ++dz) {
                grid.delete(`${startX + dx},${startZ + dz}`);
            }
        }
        // add the brick to the list
        placed.push({x: startX, y: yLevel, z: startZ, brickType: b, color: color});
    }


    // iterate over all voxels in the range
    for (let x = minX; x <= maxX; x++) {
        for (let z = minZ; z <= maxZ; z++) {
            const currentVoxel = grid.get(`${x},${z}`);
            if (!currentVoxel) {
                continue;
            }
            for (const brick of preferredBricks) {
                if (canFit(x, z, brick, currentVoxel.color)) {
                    placeBrick(x, z, brick, currentVoxel.color);
                    break;
                }
            }
        }
    }


    return placed;
}

export function packing(voxels: Voxel[]) {
    // create a key value pairs of voxels by y as key
    const slices = voxels.reduce((acc, v) => {
        const slice = (acc.has(v.y) ? acc.get(v.y) : []) as Voxel[];
        slice.push(v);
        acc.set(v.y, slice);
        return acc;
    }, new Map<number, Voxel[]>());

    const packed: PlacedBrick[] = [];
    for (const [y, vs] of slices.entries()) {
        packed.push(...packSlice(y, vs));
    }
    return packed;
}