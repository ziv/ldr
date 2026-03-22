import * as fs from 'fs';
import {getNearestColor} from "../ldraw/colors.mjs";
import {getUV} from "../ldraw/sphere.mjs";

// ==========================================
// 1. Interfaces & Types
// ==========================================

export type ImageData = {
    width: number;
    height: number;
    data: Uint8Array;
};


export interface Voxel {
    x: number;
    y: number;
    z: number;
    color: number; // מספר צבע לפי LDraw (0-15)
}

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
    color: number;
}

function voxelColor(img: ImageData) {
    return function getColor(x: number, y: number, z: number) {
        const [u, v] = getUV(x, y, z);

        // image coordinates
        const ix = Math.floor(u * img.width);
        const iy = Math.floor(v * img.height);

        // pixel position (each pixel contain 4 numbers: r, g, b, a)
        const pos = (iy * img.width + ix) * 4;

        const r = img.data[pos] as number;
        const g = img.data[pos + 1] as number;
        const b = img.data[pos + 2] as number;

        return getNearestColor([r, g, b]).code;
    }
}

// ==========================================
// 2. Constants (Matrices & Bricks)
// ==========================================

// מטריצת יחידה (0 מעלות סיבוב - הלבנה מונחת לאורך ציר ה-X)
const MATRIX_0_DEG = "1 0 0 0 1 0 0 0 1";

// מטריצת סיבוב 90 מעלות סביב ציר Y (הלבנה מונחת לאורך ציר ה-Z)
const MATRIX_90_DEG = "0 0 -1 0 1 0 1 0 0";

// מערך השכבות הזוגיות (עדיפות ללבנים המונחות לאורך X)
// ב-LDraw חלק 3001 הוא 4x2 (4 ב-X, 2 ב-Z).
const X_ALIGNED_BRICKS: BrickType[] = [
    {width: 4, depth: 2, partId: '3001.dat', matrix: MATRIX_0_DEG},
    {width: 4, depth: 1, partId: '3010.dat', matrix: MATRIX_0_DEG},
    {width: 2, depth: 2, partId: '3003.dat', matrix: MATRIX_0_DEG},
    {width: 2, depth: 1, partId: '3004.dat', matrix: MATRIX_0_DEG},
    {width: 1, depth: 1, partId: '3005.dat', matrix: MATRIX_0_DEG}
];

// מערך השכבות האי-זוגיות (עדיפות ללבנים המונחות לאורך Z)
// אנחנו מסובבים את אותם החלקים ב-90 מעלות, ולכן הרוחב והעומק ברשת שלנו מתהפכים.
const Z_ALIGNED_BRICKS: BrickType[] = [
    {width: 2, depth: 4, partId: '3001.dat', matrix: MATRIX_90_DEG},
    {width: 1, depth: 4, partId: '3010.dat', matrix: MATRIX_90_DEG},
    {width: 2, depth: 2, partId: '3003.dat', matrix: MATRIX_0_DEG}, // 2x2 ריבוע, לא דורש סיבוב
    {width: 1, depth: 2, partId: '3004.dat', matrix: MATRIX_90_DEG},
    {width: 1, depth: 1, partId: '3005.dat', matrix: MATRIX_0_DEG}  // 1x1 ריבוע
];

// ==========================================
// 3. Voxelization (יצירת המעטפת הכדורית)
// ==========================================

export function generateHollowSphereSlices(
    outerRadius: number,
    thickness: number,
    skinThickness: number = 1 // עובי הקליפה הצבעונית (בפינים)
): Map<number, Voxel[]> {

    const innerRadius = outerRadius - thickness;
    const slices = new Map<number, Voxel[]>();
    const Y_SCALE = 1.2;

    for (let y = -outerRadius; y <= outerRadius; y++) {
        const currentSlice: Voxel[] = [];
        for (let x = -outerRadius; x <= outerRadius; x++) {
            for (let z = -outerRadius; z <= outerRadius; z++) {

                const distanceSquared = (x * x) + Math.pow(y * Y_SCALE, 2) + (z * z);

                // האם הווקסל בתוך מעטפת הכדור הכללית?
                if (distanceSquared <= Math.pow(outerRadius, 2) && distanceSquared >= Math.pow(innerRadius, 2)) {

                    // האם הווקסל שייך לקליפה החיצונית?
                    const isSkin = distanceSquared > Math.pow(outerRadius - skinThickness, 2);

                    // אם זה קליפה - קח צבע מהתמונה. אם זה שלד - שים לבן (15)
                    const voxelColor = 15; // todo isSkin ? getVoxelColor(x, y, z) : 15;

                    currentSlice.push({x, y, z, color: voxelColor});
                }
            }
        }
        if (currentSlice.length > 0) slices.set(y, currentSlice);
    }
    return slices;
}

// ==========================================
// 4. Packing (אלגוריתם שיבוץ הלבנים)
// ==========================================
export function packSlice(yLevel: number, voxels: Voxel[]): PlacedBrick[] {
    const placedBricks: PlacedBrick[] = [];
    if (voxels.length === 0) return placedBricks;

    const minX = Math.min(...voxels.map(v => v.x));
    const maxX = Math.max(...voxels.map(v => v.x));
    const minZ = Math.min(...voxels.map(v => v.z));
    const maxZ = Math.max(...voxels.map(v => v.z));

    // במקום לשמור רק "פנוי/תפוס", נשמור את הווקסל עצמו כדי לשלוף את הצבע שלו
    const grid = new Map<string, Voxel>();
    voxels.forEach(v => grid.set(`${v.x},${v.z}`, v));

    const isEvenLayer = Math.abs(yLevel) % 2 === 0;
    const preferredBricks = isEvenLayer ? X_ALIGNED_BRICKS : Z_ALIGNED_BRICKS;

    // פונקציית העזר עכשיו מקבלת גם את הצבע הנדרש
    const canFitBrick = (startX: number, startZ: number, b: BrickType, targetColor: number): boolean => {
        for (let dx = 0; dx < b.width; dx++) {
            for (let dz = 0; dz < b.depth; dz++) {
                const voxel = grid.get(`${startX + dx},${startZ + dz}`);
                // הלבנה לא נכנסת אם חסר ווקסל (כבר תפוס/ריק) או אם הצבע שלו שונה!
                if (!voxel || voxel.color !== targetColor) {
                    return false;
                }
            }
        }
        return true;
    };

    const placeBrick = (startX: number, startZ: number, b: BrickType, color: number) => {
        for (let dx = 0; dx < b.width; dx++) {
            for (let dz = 0; dz < b.depth; dz++) {
                grid.delete(`${startX + dx},${startZ + dz}`); // מחיקה מסמנת שהמקום תפוס
            }
        }
        placedBricks.push({x: startX, y: yLevel, z: startZ, brickType: b, color: color}); // שומרים את הצבע בלבנה הממוקמת
    };

    for (let x = minX; x <= maxX; x++) {
        for (let z = minZ; z <= maxZ; z++) {
            const currentVoxel = grid.get(`${x},${z}`);
            if (currentVoxel) {
                for (const brick of preferredBricks) {
                    // מנסים להכניס לבנה שמכסה אזור שכולו בצבע של הווקסל ההתחלתי
                    if (canFitBrick(x, z, brick, currentVoxel.color)) {
                        placeBrick(x, z, brick, currentVoxel.color);
                        break;
                    }
                }
            }
        }
    }

    return placedBricks;
}

// ==========================================
// 5. Exporting (ייצוא לפורמט LDraw)
// ==========================================

export function exportToLDraw(allPlacedBricks: PlacedBrick[]): string {
    let ldrawOutput = "0 Name: LegoSphere.ldr\n";
    ldrawOutput += "0 Author: Generated via TypeScript Code\n";
    ldrawOutput += "0 Unofficial Model\n\n";

    for (const pb of allPlacedBricks) {
        const centerX = pb.x + (pb.brickType.width - 1) / 2;
        const centerZ = pb.z + (pb.brickType.depth - 1) / 2;

        const ldrawX = centerX * 20;
        const ldrawZ = centerZ * 20;
        const ldrawY = -pb.y * 24; // ציר Y הפוך ב-LDraw

        const line = `1 ${pb.color} ${ldrawX} ${ldrawY} ${ldrawZ} ${pb.brickType.matrix} ${pb.brickType.partId}`;
        ldrawOutput += line + "\n";
    }

    return ldrawOutput;
}

// ==========================================
// 6. Main Execution
// ==========================================

function main() {
    const RADIUS = 20;        // רדיוס חיצוני (בפינים)
    const THICKNESS = 4;    // עובי המעטפת (כדי לאפשר שילוב לבנים)
    // const COLOR = 71;         // Light Bluish Gray

    console.log(`Generating sphere with radius ${RADIUS} and thickness ${THICKNESS}...`);
    const slices = generateHollowSphereSlices(RADIUS, THICKNESS);

    console.log("Packing bricks for interlocking structure...");
    const allPlacedBricks: PlacedBrick[] = [];

    for (const [yLevel, voxels] of slices.entries()) {
        const packedBricks = packSlice(yLevel, voxels);
        allPlacedBricks.push(...packedBricks);
    }

    console.log(`Successfully placed ${allPlacedBricks.length} bricks.`);

    console.log("Exporting to LDraw file...");
    const ldrawText = exportToLDraw(allPlacedBricks);

    fs.writeFileSync('sphere.ldr', ldrawText);
    console.log("Done! Open 'sphere.ldr' in Studio 2.0, LDraw, or LeoCAD.");
}

// הפעלת התוכנית
main();