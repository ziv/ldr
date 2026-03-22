import {promises as fs} from 'node:fs';
import {walk} from "./shared/walk.mjs";
import {jsonToBinary, type LdrLine} from "./shared/json-to-binary.mjs";

let i = 0;

for await (const file of walk('./ldrawdb')) {
    if (!file.endsWith('.json')) {
        continue;
    }
    if (file.endsWith('colors.json') || file.endsWith('index.json') || file.endsWith('rindex.json')) {
        continue;
    }

    const raw = await fs.readFile(file, 'utf-8');
    const jsonArray = JSON.parse(raw) as LdrLine[];

    const target = file.replace(".json", ".bin");
    await fs.writeFile(target, jsonToBinary(jsonArray));

    if (0 === i++ % 100) process.stdout.write('.');
}

console.log('done');