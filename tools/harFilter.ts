import { readFileSync, writeFileSync } from 'fs';

interface HarRequest {
    url: string;
    headers: unknown[];
    cookies?: unknown;
    httpVersion?: string;
    headersSize?: number;
    bodySize?: number;
}

interface HarResponse {
    headers: unknown[];
    cookies?: unknown;
    httpVersion?: string;
    statusText?: string;
    headersSize?: number;
    bodySize?: number;
    redirectURL?: string;
}

interface HarEntry {
    request: HarRequest;
    response: HarResponse;
    cache?: unknown;
    timings?: unknown;
}

interface HarFile {
    log: {
        entries: HarEntry[];
    };
}

const inputFile = process.argv[2] ?? 'networking.har';
const outputFile = process.argv[3] ?? 'filtered-har.json';

const har: HarFile = JSON.parse(readFileSync(inputFile, 'utf8'));

har.log.entries = har.log.entries
    .filter(entry => {
        const url = entry.request.url;
        return url.includes('conduit-api') && !url.toLowerCase().endsWith('.jpeg');
    })
    .map(entry => {
        entry.request.headers = [];
        delete entry.request.cookies;
        delete entry.request.httpVersion;
        delete entry.request.headersSize;
        delete entry.request.bodySize;

        entry.response.headers = [];
        delete entry.response.cookies;
        delete entry.response.httpVersion;
        delete entry.response.statusText;
        delete entry.response.headersSize;
        delete entry.response.bodySize;
        delete entry.response.redirectURL;

        delete entry.cache;
        delete entry.timings;

        return entry;
    });

writeFileSync(outputFile, JSON.stringify(har, null, 2), 'utf8');
console.log(`Filtered HAR saved to: ${outputFile}`);
