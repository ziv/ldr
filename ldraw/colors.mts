import colors from './colors.json' with {type: 'json'};

export type RGB = [number, number, number];

export type ColorDesc = {
    code: string;
    rgb: RGB;
    hex: string;
    name: string;
};

export function getColors() {
    return colors as ColorDesc[];
}

export function getNearestColor(color: RGB) {
    const c = getColors();
    let closest = c[0] as ColorDesc;
    let minDistance = Infinity;

    for (const colorDesc of c) {
        const [r, g, b] = colorDesc.rgb;
        const distance = Math.sqrt(
            Math.pow(color[0] - r, 2) +
            Math.pow(color[1] - g, 2) +
            Math.pow(color[2] - b, 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closest = colorDesc;
        }
    }
    return closest;
}