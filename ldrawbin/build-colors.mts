import {readFileSync} from "node:fs";
import {LineParser} from "./utils/line-parser.mjs";

const IDENTIFIER = "0 !COLOUR";
const FINISH_TYPE_DEFAULT = 0;
const FINISH_TYPE_CHROME = 1;
const FINISH_TYPE_PEARLESCENT = 2;
const FINISH_TYPE_RUBBER = 3;
const FINISH_TYPE_MATTE_METALLIC = 4;
const FINISH_TYPE_METAL = 5;

const colorsLines = readFileSync("./db/LDCfgalt.ldr", "utf-8")
    .split("\n")
    .filter(l => l.startsWith(IDENTIFIER))
    .map(l => l.replace(IDENTIFIER, "").trim());

const map: Record<string, any> = {};

for (const l of colorsLines) {
    const parser = new LineParser(l);

    let code: string = '';

    let fillColor = '#FF00FF';
    let edgeColor = '#FF00FF';
    let alpha = 1;
    let isTransparent = false;
    let luminance = 0;
    let finishType = FINISH_TYPE_DEFAULT;

    const name = parser.next();

    for (const token of parser.it()) {
        // material is not supported
        if ("MATERIAL" === token) break;

        switch (token) {
            case "CODE":
                code = parser.next();
                break;
            case "VALUE":
                fillColor = parser.next();
                break;
            case "EDGE":
                edgeColor = parser.next();
                break;
            case "ALPHA":
                alpha = Math.max(0, Math.min(1, parser.int() / 255));
                isTransparent = alpha < 1;
                break;
            case "LUMINANCE":
                luminance = Math.max(0, Math.min(1, parser.int() / 255));
                break;
            case "CHROME":
                finishType = FINISH_TYPE_CHROME;
                break;
            case 'PEARLESCENT':
                finishType = FINISH_TYPE_PEARLESCENT;
                break;
            case 'RUBBER':
                finishType = FINISH_TYPE_RUBBER;
                break;
            case 'MATTE_METALLIC':
                finishType = FINISH_TYPE_MATTE_METALLIC;
                break;
            case 'METAL':
                finishType = FINISH_TYPE_METAL;
                break;
        }
    }

    if ("" === code) {
        // somthing bad happen
        throw new Error(`Color code is missing for color ${name}`);
    }

    map[code] = {
        fillColor,
        edgeColor,
        alpha,
        isTransparent,
        luminance,
        finishType,
    };
}

console.log(JSON.stringify(map, null, 2));