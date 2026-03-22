import {promises as fs} from 'node:fs';
import {walk} from "./shared/walk.mjs";

type LdrLine = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

let i = 0;

for await (const file of walk('./ldrawdb')) {
    if (!file.endsWith('.json')) {
        continue;
    }

    const raw = await fs.readFile(file, 'utf-8');
    const jsonArray = JSON.parse(raw) as LdrLine[];

    let totalBytes = 0;
    for (const row of jsonArray) {
        const type = row[0] as number;
        if (type === 1) totalBytes += 57; // 1 + 4 + (12 * 4) + 4
        else if (type === 3) totalBytes += 41; // 1 + 4 + (9 * 4)
        else if (type === 4) totalBytes += 53; // 1 + 4 + (12 * 4)
    }


    const buf = Buffer.alloc(totalBytes);
    let offset = 0;

    for (const row of jsonArray) {
        const type = row[0] as number;

        // writing the type
        buf.writeUInt8(type, offset);
        offset += 1;

        // color
        buf.writeInt32LE(row[1] as number, offset);
        offset += 4;

        if (type === 1) {
            // location + matrix
            for (let i = 2; i < 14; i++) {
                buf.writeFloatLE(row[i] as number, offset);
                offset += 4;
            }
            // file id
            buf.writeUInt32LE(row[14] as number, offset);
            offset += 4;

        } else if (type === 3) {
            for (let i = 2; i < 11; i++) {
                buf.writeFloatLE(row[i] as number, offset);
                offset += 4;
            }

        } else if (type === 4) {
            for (let i = 2; i < 14; i++) {
                buf.writeFloatLE(row[i] as number, offset);
                offset += 4;
            }
        }
    }

    const target = file.replace(".json", ".bin");
    await fs.writeFile(target, buf);

    if (0 === i++ % 100) process.stdout.write('.');
}

console.log('done');