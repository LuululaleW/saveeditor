import { makeOutcome, type ParseOutcome } from './types';

export async function parseGodot(file: File): Promise<ParseOutcome<any>> {
    const text = await file.text();

    // Check for Godot ConfigFile format (looks like INI)
    if (text.includes('[section]') || (text.includes('[') && text.includes('='))) {
         // Godot ConfigFile often uses format like:
         // [section]
         // key=value

         // We can use the Gamemaker INI parser logic or a simple variant
         // For now, let's treat it as a potential Godot config if it has certain traits
         if (text.startsWith('[') || text.includes('config_version=')) {
             const { parseGamemaker } = await import('./gamemaker');
             const outcome = await parseGamemaker(file);
             return {
                 ...outcome,
                 engine: 'godot' as any,
                 format: 'godot-config',
             };
         }
    }

    // Check for Godot JSON save (common)
    try {
        const parsed = JSON.parse(text);
        return makeOutcome({
            engine: 'godot' as any,
            format: 'godot-json',
            mode: 'full',
            reasonCode: 'ok',
            capabilities: {
                canView: true,
                canEdit: true,
                canSave: true,
                roundTripSupport: 'stable',
            },
            data: parsed,
        });
    } catch {
        // Not JSON
    }

    return makeOutcome({
        engine: 'godot' as any,
        format: 'raw',
        mode: 'partial',
        reasonCode: 'raw_fallback',
        capabilities: {
            canView: true,
            canEdit: false,
            canSave: false,
            roundTripSupport: 'none',
        },
        data: text,
    });
}

export async function buildGodot(originalFile: File, data: any, format: string): Promise<Blob> {
    if (format === 'godot-json') {
        return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    }
    if (format === 'godot-config') {
        const { buildGamemaker } = await import('./gamemaker');
        return buildGamemaker(originalFile, { type: 'ini', data });
    }
    return new Blob([data], { type: 'text/plain' });
}
