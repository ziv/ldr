import {promises as fs} from 'node:fs';
import {walk} from "./shared/walk.mjs";
import {datToJson} from "./shared/dat-to-json.mjs";

let i = 0;
for await (const file of walk('./db')) {
    if (!file.endsWith('.dat')) {
        continue;
    }
    const content = await fs.readFile(file, 'utf-8');
    const data = datToJson(content);
    const target = file.replace('.dat', '.json').replace('db', 'ldrawdb');

    console.log(data);
    process.exit(0);
    // await fs.writeFile(target, JSON.stringify(data), 'utf-8');

    if (++i % 100 === 0) process.stdout.write('.');
}

console.log('done');