import index from "../../db/index.json" with {type: "json"};

export type LdrLine = [string, string, string, string, string, string, string, string, string, string, string, string, string, string, string];

function fileIndex(path: string): number {
    const i = index as Record<string, number>;
    const search = [
        path,
        `parts\\${path}`,
        `parts\\s\\${path}`,
        `p\\${path}`,
        `p\\8\\${path}`,
        `p\\48\\${path}`,

    ];
    for (const key of search) {
        if (key in i) {
            return i[key] as number;
        }
    }
    return -1;
}


export function datToJson(raw: string) {
    const lines = raw.split('\n').map(line => line.trim()).filter(Boolean);
    const data: number[][] = [];

    for (const line of lines) {
        const p = line.split(' ') as LdrLine;
        const type = p[0];

        if ('1' === type) {
            data.push([
                1,
                parseInt(p[1], 10),
                ...p.slice(2, 14).map(parseFloat),
                fileIndex(p[14]),
            ]);
        } else if ('2' === type) {
            data.push([
                2,
                parseInt(p[1], 10),
                ...p.slice(2, 8).map(parseFloat),
            ])
        } else if ('3' === type) {
            data.push([
                3,
                parseInt(p[1], 10),
                ...p.slice(2, 11).map(parseFloat)
            ]);
        } else if ('4' === type) {
            data.push([
                4,
                parseInt(p[1], 10),
                ...p.slice(2, 14).map(parseFloat)

            ]);
        }
    }
    return data;
}