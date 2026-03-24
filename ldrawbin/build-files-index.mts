import {walk} from "./utils/walk.mjs";

const map: Record<string, true> = {};
let name: string;

for await (const file of walk("./db")) {
    name = file.replace("db/", "").replace(/\\/g, "/");
    map[name] = true;
}

console.log(JSON.stringify(map, null, 2));