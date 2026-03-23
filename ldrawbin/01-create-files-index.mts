/**
 * Generate an index of files to number
 * Allow us to use numbers only in our JSONs data
 *
 * tsx tools/01-create-files-index.mts > db/index.json
 */
import {walk} from "./shared/walk.mjs";


let id = 0;
// const map: Record<string, number> = {};
const list: string[] = [];
for await (const file of walk("./db")) {
    if (!file.endsWith(".dat")) continue;
    const key = file.replace("db/", "").replaceAll("/", "\\");
    // map[key] = id++;
    list.push(key);
}

list.sort();
const map = list.reduce((acc, key, i) => {
    acc[key] = i;
    return acc;
}, {} as Record<string, number>);
// for (const i of list) console.log(i);
console.log(map);
// console.log(JSON.stringify(map, null, 2));