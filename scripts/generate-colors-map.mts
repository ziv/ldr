import {readFileSync} from "node:fs";

// read the CSV as lines
const lines = readFileSync('./scripts/colors.csv', 'utf8').split('\n');

// remove the header line
lines.shift();

const colors = lines.map(line => {
    const [code, name, rgb] = line.split(',') as [string, string, string];
    const r = parseInt(rgb.substring(0, 2), 16);
    const g = parseInt(rgb.substring(2, 4), 16);
    const b = parseInt(rgb.substring(4, 6), 16);
    return {
        code,
        rgb: [r, g, b],
        hex: rgb,
        name
    };
});

console.log(JSON.stringify(colors));