import filesIndex from "./files-index.json" with {type: "json"};

export function normalizeFilename(name: string) {
    name = name.replace(/\\/g, "/");
    const candidates = [
        name,
        `models/${name}`,
        `parts/${name}`,
        `parts/s/${name}`,
        `p/${name}`,
        `p/8/${name}`,
        `p/48/${name}`,
    ];

    for (const candidate of candidates) {
        if (candidate in filesIndex) {
            return candidate.replace(".dat", ".json");
        }
    }
    throw new Error(`File not found: ${name}`);
}