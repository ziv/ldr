/**
 * Generate an index of files to number
 * Allow us to use numbers only in our JSONs data
 *
 * tsx tools/01-create-files-index.mts > db/index.json
 */
import {walk} from "./shared/walk.mjs";


let id = 0;
const map: Record<string, number> = {};

for await (const file of walk("./ldrawdb")) {
    if (!file.endsWith(".ldr") && !file.endsWith(".dat")) {
        continue;
    }
    const key = file.replace("db/", "").replaceAll("/", "\\");
    map[key] = id++;
}

console.log(JSON.stringify(map, null, 2));