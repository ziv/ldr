// export type Arr<T, L extends number> = T[] & { length: L };
// export type Vec3 = Arr<number, 3>;

export class LineParser {
    line: string;
    parts: string[];
    cursor: number;

    constructor(line: string, parts?: string[]) {
        this.line = line;
        this.parts = parts ?? line.split(/\s+/);
        this.cursor = -1;
    }

    next(): string {
        this.cursor++;
        if (this.cursor === this.parts.length) {
            return ''; // todo return EOF?
        }
        return this.parts[this.cursor] as string;
    }

    * it() {
        while (true) {
            const token = this.next();
            if (token) {
                yield token;
            } else {
                break;
            }
        }
    }


    vector() {
        return [
            parseFloat(this.next()),
            parseFloat(this.next()),
            parseFloat(this.next()),
        ];
    }

    vectors(n: number) {
        return Array.from({length: n}, () => this.vector());
    }
}