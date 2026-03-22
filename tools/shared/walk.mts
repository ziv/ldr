import {promises as fs} from 'node:fs';
import {join} from 'node:path';

export async function* walk(dir: string): AsyncGenerator<string> {
    for await (const d of await fs.opendir(dir)) {
        const entry = join(dir, d.name);
        if (d.isDirectory()) yield* walk(entry);
        else if (d.isFile()) yield entry;
    }
}
