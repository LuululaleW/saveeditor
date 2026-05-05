import type { ParseOutcome } from '../parsers/types';

export async function parseInWorker(file: File, engine?: string, editorSlug?: string, format?: string): Promise<ParseOutcome<any>> {
    return new Promise((resolve, reject) => {
        // In a real Vite environment, this URL would be correct
        const worker = new Worker(new URL('./parse.worker.ts', import.meta.url), { type: 'module' });

        worker.onmessage = (e) => {
            if (e.data.type === 'success') {
                resolve(e.data.outcome);
            } else {
                reject(new Error(e.data.error));
            }
            worker.terminate();
        };

        worker.onerror = (err) => {
            reject(err);
            worker.terminate();
        };

        worker.postMessage({ file, engine, editorSlug, format });
    });
}
