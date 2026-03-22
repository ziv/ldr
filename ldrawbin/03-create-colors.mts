import {readFileSync} from "node:fs";

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
    };

    for (let i = 0; i < parts.length; i++) {
        const c = parts[i];
        const n = parts[i + 1];

        if (c === 'CODE' && typeof n === 'string') {
            color.code = parseInt(n, 10);
        }

        if (c === 'VALUE' && typeof n === 'string' && i < 6) {
            color.color = n;
        }

        if (c === 'EDGE' && typeof n === 'string') {
            color.edge = n;
        }

        if (c === 'ALPHA' && typeof n === 'string') {
            color.alpha = parseInt(n, 10);
        }

        if (c === 'LUMINANCE' && typeof n === 'string') {
            color.luminance = parseInt(n, 10);
        }
    }

    colors.push(color);
}
console.log(JSON.stringify(colors, null, 2));