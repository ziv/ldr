import {readFileSync} from "node:fs";

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
    const parts = line.split(/\s+/);

    const color = {
        code: -1,
        color: '',
        edge: '',
        alpha: -1,
        luminance: -1,
        rgb: [0, 0, 0],
    };

    for (let i = 0; i < parts.length; i++) {
        const c = parts[i];
        const n = parts[i + 1];

        if (c === 'CODE' && n) {
            color.code = parseInt(n, 10);
        }

        if (c === 'VALUE' && n && i < 6) {
            color.color = n;
            color.rgb = toRGB(n);
        }

        if (c === 'EDGE' && n) {
            color.edge = n;
        }

        if (c === 'ALPHA' && n) {
            color.alpha = parseInt(n, 10);
        }

        if (c === 'LUMINANCE' && n) {
            color.luminance = parseInt(n, 10);
        }
    }

    colors.push(color);
}
console.log(JSON.stringify(colors, null, 2));