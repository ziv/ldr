#!/usr/bin/env tsx
import * as fs from "node:fs";
import * as process from "node:process";
import * as path from "node:path";

async function* walk(dir: string): AsyncGenerator<string> {
    for await (const d of await fs.promises.opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory()) yield* walk(entry);
        else if (d.isFile()) yield entry;
    }
}

const BFC_CCW = 0;
const BFC_CW = 1;
const BFC_INVERTNEXT = 2;

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
                5,
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