import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {dirname} from 'node:path';

const host = '0.0.0.0';
const port = 3000;
const BASE = dirname(import.meta.url).replace('file://', '') + '/';

const rindex = JSON.parse(readFileSync(BASE + 'rindex.json', 'utf-8')) as Record<number, string>;

const server = createServer((req, res) => {
    // always allow...
    res.setHeader('Access-Control-Allow-Origin', '*');

    function done(code: number, type: string, msg: string) {
        console.error(msg);
        res.statusCode = code;
        res.setHeader('Content-Type', type);
        res.end(msg);
    }


    const url = req.url;

    if (url === '/favicon.ico') {
        done(200, 'text/plain', 'ok\n');
        return;
    }

    if (url === '/colors.json') {
        const buf = readFileSync('./ldrawdb/colors.json');
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Length', buf.length);
        res.end(buf);
        return;
    }

    const key = url.substring(1); // remove the "/"
    const n = parseInt(key, 10);

    if (isNaN(n)) {
        done(400, 'text/plain', 'bad request');
        return;
    }

    const file = rindex[n];

    if (!file) {
        done(400, 'text/plain', 'unable to map file');
        return;
    }

    const target = BASE + file.replaceAll('\\', '/').replace('.dat', '.bin');

    try {
        const buf = readFileSync(target);

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Length', buf.length);
        res.end(buf);
    } catch (err) {
        done(404, 'text/plain', 'File not found');
    }
});

server.listen(port, host, () => {
    console.log(`Listening on ${port}`);
});