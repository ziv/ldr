#!/usr/bin/env tsx
import * as fs from "node:fs";
import * as process from "node:process";
import {LineParser} from "./utils/line-parser.mjs";
import {normalizeFilename} from "./utils/normalize-filename.mjs";
import {walk} from "./utils/walk.mjs";

type LineSegment = {
    colorCode: string;
    vertices: number[][];
};

type ConditionalLineSegment = LineSegment & {
    controlPoints: number[][];
}

type FaceSegment = LineSegment & {
}

type SubObject = LineSegment & {
    fileName: string;
    inverted: boolean;
}


// those directories should exist before running the script, and the script will create missing subdirectories as needed.
const src = "db"
const dst = "ldrawdb"

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
    const activeLines = raw
        .replace(/\r\n/g, '\n')            // align new lines characters
        .split('\n')                       // split to lines
        .map(line => line.trim())   // trim spaces
        .filter(Boolean);                  // remove empty lines

    let type = 'Model';
    let bfcCCW = true;
    let bfcInverted = false;
    let totalFaces = 0;

    const faces: FaceSegment[] = [];
    const lines: LineSegment[] = [];
    const conditionalLines: ConditionalLineSegment[] = [];
    const subObjects: SubObject[] = [];



    for (const l of activeLines) {
        const parser = new LineParser(l);
        const lineType = parser.next()

        let colorCode: string;
        let vertices: number[][];

        switch (lineType) {
            case "0":
                const meta = parser.next();
                switch (meta) {
                    case "!LDRAW_ORG":
                        type = parser.next();
                        break;

                    case "BFC":
                        for (const token of parser.it()) {
                            switch (token) {
                                case "CW":
                                case "CCW":
                                    bfcCCW = token === "CCW";
                                    break;

                                case "INVERTNEXT":
                                    bfcInverted = true;
                                    break;
                            }
                        }
                }
                break;
            case "1":
                colorCode = parser.next();
                vertices = parser.vectors(4);
                const fileName = normalizeFilename(parser.next());

                subObjects.push({
                    colorCode,
                    vertices,
                    fileName,
                    inverted: bfcInverted,
                });

                // reset BFC behavior
                bfcInverted = false;
                break;
            case "2":
                colorCode = parser.next();
                vertices = parser.vectors(2);

                lines.push({
                    colorCode,
                    vertices
                });
                break;
            case "3":
                colorCode = parser.next();
                vertices = parser.vectors(3);

                if (!bfcCCW) {
                    vertices.reverse();
                }

                faces.push({
                    colorCode,
                    vertices,
                    // todo do we need those the DB?!
                    // faceNormal: null,
                    // normals: [null, null, null],
                });
                totalFaces += 1;

                // todo handle double side (add another face in reverse order)

                break;
            case "4":
                colorCode = parser.next();
                vertices = parser.vectors(4);

                if (!bfcCCW) {
                    vertices.reverse();
                }

                faces.push({
                    colorCode,
                    vertices,
                    // todo do we need those the DB?!
                    // faceNormal: null,
                    // normals: [null, null, null, null],
                });
                totalFaces += 2;
                // todo handle double side (add another face in reverse order)
                break;
            case "5":
                colorCode = parser.next();
                vertices = parser.vectors(2);
                const controlPoints = parser.vectors(2);

                conditionalLines.push({
                    colorCode,
                    vertices,
                    controlPoints,
                });
                break;
        }
    }

    const data = {
        type,
        faces,
        lines,
        conditionalLines,
        subObjects,
        totalFaces,
    };

    const jsonPath = file.replace(src, dst).replace('.dat', '.json');
    fs.mkdirSync(jsonPath.substring(0, jsonPath.lastIndexOf('/')), {recursive: true});
    fs.writeFileSync(jsonPath, JSON.stringify(data));

    if (++i % 100 === 0) process.stderr.write('.');
}

console.log('done');