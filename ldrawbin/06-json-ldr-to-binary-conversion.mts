// import {promises as fs} from "node:fs";
// import * as process from "node:process";
//
// const args = process.argv.splice(2);
// const src = args.shift() as string;
// const dest = args.shift() as string;
//
// if (!src || !dest) {
//     console.error("Missing required arguments");
//     process.exit(1);
// }
//
// async function readJson(jsonPath: string) {
//     const raw = await fs.readFile(jsonPath, "utf-8");
//     return JSON.parse(raw) as number[][];
// }
//
// async function processFile(src: string) {
//     const jsonArray = await readJson(src);
//
//     // collect all files
//     for (const row of jsonArray) {
//         if (row[0] === 1) {
//             // collect the relevant file recursively
//             const fileCode = row[14] as number;
//             const prcessed = await processFile(fileCode.toString());
//         }
//     }
//
//     return {};
// }
//
// // create buffer for each file
// // and calculate TOC

import colors from "../ldrawdb/colors.json" with {type: "json"};

type RGB = [number, number, number];
type Color = { rgb: number[], code: number };
type Colors = Record<number, RGB>;


const map = (colors as Color[]).reduce((acc, color) => {
    acc[color.code] = color.rgb as RGB;
    return acc;
}, {} as Colors);

console.log(map);