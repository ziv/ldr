#!/usr/bin/env tsx
import * as fs from "node:fs";
import * as process from "node:process";
import {walk} from "./shared/walk.mjs";

const USAGE = 'Usage: build-database.mts <source_dir> <destination_dir>';

const BFC_CCW = 0;
const BFC_CW = 1;
const BFC_INVERTNEXT = 2;

const args = process.argv.splice(2);

if (2 !== args.length) {
    console.error(USAGE);
    process.exit(1);
}

const src = args.shift() as string;
const dst = args.shift() as string;

if (!src || !dst) {
    console.error("Missing required arguments");
    console.error(USAGE);
    process.exit(2);
}

try {
    const srcStat = fs.statSync(src);
    const dstStart = fs.statSync(dst);

    if (!srcStat.isDirectory() || !dstStart.isDirectory()) {
        console.error("Both source and destination must be directories");
        process.exit(3);
    }
} catch (e) {
    console.error("Error accessing source or destination:", e);
    process.exit(4);
}

// iterate all .dat files and convert them to JSON

let i = 0;

for await (const file of walk(src)) {

    if (!file.endsWith('.dat')) continue;

    const raw = fs.readFileSync(file, 'utf-8');
    const lines = raw
        .replace(/\r\n/g, '\n')            // align new lines characters
        .split('\n')                       // split to lines
        .map(line => line.trim())   // trim spaces
        .filter(Boolean);                  // remove empty lines

    const output: (number | string)[][] = [];

    for (const l of lines) {
        const type = l.substring(0, 1);
        const line = l.substring(1).trim();


        // todo complete handling 0 line (colors, etc.)
        if ('0' === type) {
            if ('BFC CERTIFY CCW' === line)
                output.push([0, BFC_CCW]);

            else if ('BFC CERTIFY CW' === line)
                output.push([0, BFC_CW]);

            else if ('BFC INVERTNEXT' === line)
                output.push([0, BFC_INVERTNEXT]);

            continue;
        }

        const parts = line.split(/\s+/);
        const color = parseInt(parts[0] as string, 10);

        if ('1' === type) {
            output.push([
                1,
                color,
                ...parts.slice(1, 13).map(parseFloat),  // 12 floats
                parts[13] as string,                    // file name (as string)
            ]);
        } else if ('2' === type) {
            output.push([
                2,
                color,
                ...parts.slice(1, 7).map(parseFloat),   // 6 floats
            ]);
        } else if ('3' === type) {
            output.push([
                3,
                color,
                ...parts.slice(1, 10).map(parseFloat),  // 9 floats
            ]);
        } else if ('4' === type) {
            output.push([
                4,
                color,
                ...parts.slice(1, 13).map(parseFloat),  // 12 floats
            ]);
        } else if ('5' === type) {
            output.push([
                color,
                ...parts.slice(1, 13).map(parseFloat),  // 12 floats
            ]);
        }
    }

    const jsonPath = file.replace(src, dst).replace('.dat', '.json');
    // fs.mkdirSync(jsonPath.substring(0, jsonPath.lastIndexOf('/')), {recursive: true});
    fs.writeFileSync(jsonPath, JSON.stringify(output));

    if (++i % 100 === 0) process.stderr.write('.');
}

console.log('done');


//
//
//
// import fs from 'fs';
//
// function convertLDrawToBinary(datContent: string) {
//     // 1. מערכים לאיסוף הנתונים (Grouping)
//     const instances = []; // Type 1
//     const triangles = []; // Type 3
//     const quads = [];     // Type 4
//     const stringBuffers = [];
//
//     let stringTableSize = 0;
//
//     // 2. קריאת הטקסט וחלוקה לקבוצות
//     const lines = datContent.split('\n');
//
//     for (const line of lines) {
//         // מתעלמים משורות ריקות ורווחים כפולים
//         const parts = line.trim().split(/\s+/);
//         const type = parts[0] as string;
//
//         if (type === '1') {
//             // מבנה: 1 <color> x y z a b c d e f g h i <file>
//             const color = parseInt(parts[1] as string, 10);
//             const matrixAndPos = parts.slice(2, 14).map(parseFloat); // 12 מספרי Float
//
//             // טיפול בשם הקובץ (שיכול להכיל רווחים)
//             const filename = parts.slice(14).join(' ');
//             const strBuf = Buffer.from(filename, 'utf8');
//             stringBuffers.push(strBuf);
//
//             instances.push({ color, floats: matrixAndPos, strLength: strBuf.length });
//             stringTableSize += strBuf.length;
//
//         } else if (type === '3') {
//             // מבנה משולש: 3 <color> x1 y1 z1 x2 y2 z2 x3 y3 z3
//             triangles.push({
//                 color: parseInt(parts[1] as string, 10),
//                 floats: parts.slice(2, 11).map(parseFloat) // 9 מספרי Float
//             });
//
//         } else if (type === '4') {
//             // מבנה מרובע: 4 <color> x1...z4
//             quads.push({
//                 color: parseInt(parts[1] as string, 10),
//                 floats: parts.slice(2, 14).map(parseFloat) // 12 מספרי Float
//             });
//         }
//         // מתעלמים מ-0 (הערות/מטא), 2 (קווים) ו-5 (קווי עזר) לשם הפשטות ב-Viewer סטטי
//     }
//
//     // 3. חישובי גדלים (Offsets)
//     // הכותרת שלנו תכיל: MagicNumber(4) + (Offset+Count) לכל סוג(8*3) + StringOffset(4) = 32 בתים
//     const HEADER_SIZE = 32;
//
//     // Type 1: Color(4) + 12 Floats(48) + StrOffset(4) + StrLength(4) = 60 bytes per row
//     const BLOCK_1_SIZE = instances.length * 60;
//
//     // Type 3: Color(4) + 9 Floats(36) = 40 bytes per row
//     const BLOCK_3_SIZE = triangles.length * 40;
//
//     // Type 4: Color(4) + 12 Floats(48) = 52 bytes per row
//     const BLOCK_4_SIZE = quads.length * 52;
//
//     const totalFileSize = HEADER_SIZE + BLOCK_1_SIZE + BLOCK_3_SIZE + BLOCK_4_SIZE + stringTableSize;
//     const buf = Buffer.alloc(totalFileSize);
//
//     // 4. כתיבת הכותרת (Header)
//     let offset = 0;
//     buf.write("LDRB", offset, 4, "ascii"); // Magic Number
//     offset += 4;
//
//     buf.writeUInt32LE(HEADER_SIZE, offset); // Type 1 Offset
//     buf.writeUInt32LE(instances.length, offset + 4); // Type 1 Count
//     offset += 8;
//
//     buf.writeUInt32LE(HEADER_SIZE + BLOCK_1_SIZE, offset); // Type 3 Offset
//     buf.writeUInt32LE(triangles.length, offset + 4); // Type 3 Count
//     offset += 8;
//
//     buf.writeUInt32LE(HEADER_SIZE + BLOCK_1_SIZE + BLOCK_3_SIZE, offset); // Type 4 Offset
//     buf.writeUInt32LE(quads.length, offset + 4); // Type 4 Count
//     offset += 8;
//
//     const STRING_TABLE_OFFSET = HEADER_SIZE + BLOCK_1_SIZE + BLOCK_3_SIZE + BLOCK_4_SIZE;
//     buf.writeUInt32LE(STRING_TABLE_OFFSET, offset); // מאיפה מתחילות המחרוזות
//     offset += 4;
//
//     // 5. כתיבת הבלוקים (Data Chunks)
//
//     // כתיבת Type 1
//     let currentStringOffset = 0; // יחסי לטבלת המחרוזות
//     for (const inst of instances) {
//         buf.writeInt32LE(inst.color, offset); offset += 4;
//         for (const f of inst.floats) { buf.writeFloatLE(f, offset); offset += 4; }
//
//         buf.writeUInt32LE(currentStringOffset, offset); offset += 4;
//         buf.writeUInt32LE(inst.strLength, offset); offset += 4;
//
//         currentStringOffset += inst.strLength;
//     }
//
//     // כתיבת Type 3 (משולשים טהורים)
//     for (const tri of triangles) {
//         buf.writeInt32LE(tri.color, offset); offset += 4;
//         for (const f of tri.floats) { buf.writeFloatLE(f, offset); offset += 4; }
//     }
//
//     // כתיבת Type 4 (מרובעים)
//     for (const quad of quads) {
//         buf.writeInt32LE(quad.color, offset); offset += 4;
//         for (const f of quad.floats) { buf.writeFloatLE(f, offset); offset += 4; }
//     }
//
//     // 6. כתיבת טבלת המחרוזות בסוף הקובץ
//     const stringTableBuf = Buffer.concat(stringBuffers);
//     stringTableBuf.copy(buf, STRING_TABLE_OFFSET);
//
//     return buf;
// }
//
// // דוגמה לשימוש:
// const rawLDrawText = fs.readFileSync('./db/parts/3001.dat', 'utf8');
// const binaryBuffer = convertLDrawToBinary(rawLDrawText);
// fs.writeFileSync('./3001.bin', binaryBuffer);
// console.log(`Converted! Binary size: ${binaryBuffer.length} bytes.`);