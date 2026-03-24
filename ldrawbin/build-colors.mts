import {readFileSync} from "node:fs";
import {LineParser} from "./utils/line-parser.mjs";
import {
    FINISH_TYPE_CHROME,
    FINISH_TYPE_DEFAULT,
    FINISH_TYPE_MATTE_METALLIC,
    FINISH_TYPE_METAL,
    FINISH_TYPE_PEARLESCENT,
    FINISH_TYPE_RUBBER
} from "../ldrawloader/ldraw-primitives.mjs";

const IDENTIFIER = "0 !COLOUR";

const colorsLines = readFileSync("./db/LDCfgalt.ldr", "utf-8")
    .split("\n")
    .filter(l => l.startsWith(IDENTIFIER))
    .map(l => l.replace(IDENTIFIER, "").trim());

const map: Record<string, any> = {};

const materialMap: Record<number, any> = {
    [FINISH_TYPE_DEFAULT]: {roughness: 0.3, metalness: 0.25},
    [FINISH_TYPE_PEARLESCENT]: {roughness: 0.3, metalness: 0.25},
    [FINISH_TYPE_CHROME]: {roughness: 0, metalness: 1},
    [FINISH_TYPE_RUBBER]: {roughness: 0.9, metalness: 0},
    [FINISH_TYPE_MATTE_METALLIC]: {roughness: 0.8, metalness: 0.4},
    [FINISH_TYPE_METAL]: {roughness: 0.2, metalness: 0.85},
};

for (const l of colorsLines) {
    const parser = new LineParser(l);

    let code: string = '';

    let fillColor = '#FF00FF';
    let edgeColor = '#FF00FF';
    let alpha = 1;
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
        luminance,
        finishType,
        materialArgs: materialMap[finishType],
    };
}

console.log(JSON.stringify(map, null, 2));