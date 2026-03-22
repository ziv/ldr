export type RGB = [number, number, number];

export type RemoteColor = {
    code: string;
    rgb: RGB;
}

export type ColorsMap = Record<string, RGB>;

export async function fetchColors(): Promise<ColorsMap> {
    const res = await fetch('http://127.0.0.1:3000/colors.json');
    const raw = (await res.json()) as RemoteColor[];
    return raw.reduce((acc, cur) => {
        acc[cur.code] = cur.rgb;
        return acc;
    }, {} as ColorsMap);
}
