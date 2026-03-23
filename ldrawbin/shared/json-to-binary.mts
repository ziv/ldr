export type LdrLine = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

export function jsonToBinary(jsonArray: LdrLine[]) {
    // counting data
    let totalBytes = 0;
    for (const row of jsonArray) {
        const type = row[0] as number;
        if (type === 1) totalBytes += 57; // 1 + 4 + (12 * 4) + 4
        else if (type === 2) totalBytes += 29; // 1 + 4 + (6 * 4)
        else if (type === 3) totalBytes += 41; // 1 + 4 + (9 * 4)
        else if (type === 4) totalBytes += 53; // 1 + 4 + (12 * 4)
    }

    // allocating memory
    const buf = Buffer.alloc(totalBytes);
    let offset = 0;

    for (const row of jsonArray) {
        const type = row[0] as number;

        // writing the type
        buf.writeUInt8(type, offset);
        offset += 1;

        // color todo this is too long
        buf.writeInt32LE(row[1] as number, offset);
        offset += 4;

        if (type === 1) {
            // location + matrix
            for (let i = 2; i < 14; i++) {
                buf.writeFloatLE(row[i] as number, offset);
                offset += 4;
            }
            // file id todo replace with unit 16
            buf.writeUInt32LE(row[14] as number, offset);
            // buf.writeUInt16LE()
            offset += 4;
        } else if (type === 2) {
            for (let i = 2; i < 8; i++) {
                buf.writeFloatLE(row[i] as number, offset);
                offset += 4;
            }
        } else if (type === 3) {
            for (let i = 2; i < 11; i++) {
                buf.writeFloatLE(row[i] as number, offset);
                offset += 4;
            }
        } else if (type === 4) {
            for (let i = 2; i < 14; i++) {
                buf.writeFloatLE(row[i] as number, offset);
                offset += 4;
            }
        }
    }
    return buf;
}