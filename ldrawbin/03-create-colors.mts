import {readFileSync} from "node:fs";

type LdrLine = [string, string, string, string, string, string, string, string, string, string, string, string, string, string, string];


function toRGB(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
}

const lines = readFileSync("./ldrawdb/LDCfgalt.ldr", "utf8")
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.startsWith("0 !COLOUR"));

const colors = [];

for (const line of lines) {
    const parts = line.split(/\s+/) as LdrLine;

    const color = {
        code: -1,
        color: '',
        edgeColor: '',
        alpha: -1,
        // luminance: -1,
        rgb: [0, 0, 0],
        edgeRgb: [0, 0, 0],
    };

    color.code = parseInt(parts[4], 10);

    color.color = parts[6];
    color.rgb = toRGB(parts[6]);

    color.edgeColor = parts[8];
    color.edgeRgb = toRGB(parts[8]);

    if (parts[9] === 'ALPHA') {
        color.alpha = parseInt(parts[10], 10);
    }

    if (parts[11] === 'LUMINANCE') {
        color.alpha = parseInt(parts[12], 10);
    }
    colors.push(color);
}

// todo create a map code to RGB
// console.log(JSON.stringify(colors, null, 2));
console.log(colors);