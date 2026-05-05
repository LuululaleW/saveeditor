import type { ParseOutcome } from './types';

export interface ParserStrategy {
    id: string;
    extensions: string[];
    heuristics?: (header: string, bytes: Uint8Array) => boolean;
    parse: (file: File) => Promise<ParseOutcome<any>>;
    build: (file: File, data: any, format: string) => Promise<Blob>;
}

export const parserRegistry: ParserStrategy[] = [
    {
        id: 'rpgmaker',
        extensions: ['rpgsave', 'rvdata2', 'rmmzsave'],
        parse: async (f) => (await import('./rpgmaker')).parseRPGMakerMV(f),
        build: async (f, d) => (await import('./rpgmaker')).buildRPGMakerMV(f, d),
    },
    {
        id: 'unity',
        extensions: ['xml', 'plist', 'prefs'],
        heuristics: (h) => h.includes('<?xml') && (h.includes('<unity') || h.includes('<map')),
        parse: async (f) => (await import('./unity')).parseUnity(f),
        build: async (f, d) => (await import('./unity')).buildUnity(f, d),
    },
    {
        id: 'unreal',
        extensions: ['sav'],
        heuristics: (h) => h.startsWith('GVAS'),
        parse: async (f) => (await import('./unreal')).parseUnreal(f),
        build: async (f, d) => (await import('./unreal')).buildUnreal(f, d),
    },
    {
        id: 'palworld',
        extensions: [], // Usually specific entry point
        parse: async (f) => (await import('./palworld')).parsePalworld(f),
        build: async (f, d) => (await import('./palworld')).buildPalworld(f, d),
    },
    {
        id: 'godot',
        extensions: ['tres', 'res', 'tscn', 'godot'],
        heuristics: (h) => h.startsWith('[gd_resource') || h.startsWith('[gd_scene'),
        parse: async (f) => (await import('./godot')).parseGodot(f),
        build: async (f, d, fmt) => (await import('./godot')).buildGodot(f, d, fmt),
    },
    {
        id: 'renpy',
        extensions: ['save'],
        heuristics: (_, b) => b[0] === 0x80 && (b[1] === 0x02 || b[1] === 0x03),
        parse: async (f) => (await import('./renpy')).parseRenpy(f),
        build: async (f, d) => (await import('./renpy')).buildRenpy(f, d),
    },
    {
        id: 'naninovel',
        extensions: ['nson'],
        parse: async (f) => (await import('./naninovel')).parseNaniNovel(f),
        build: async (f, d, fmt) => (await import('./naninovel')).buildNaniNovel(f, d, fmt as any),
    },
    {
        id: 'gamemaker',
        extensions: ['ini', 'json'],
        parse: async (f) => (await import('./gamemaker')).parseGamemaker(f),
        build: async (f, d, fmt) => (await import('./gamemaker')).buildGamemaker(f, { type: fmt, data: d }),
    },
];

export async function getParserForFile(file: File, editorSlug?: string) {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    // Forced slug (from URL) takes precedence
    if (editorSlug) {
        const strat = parserRegistry.find(s => s.id === editorSlug);
        if (strat) return strat;
    }

    // Heuristics Check
    const buffer = await file.slice(0, 1024).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const header = new TextDecoder().decode(bytes);

    const heuristicMatch = parserRegistry.find(s => s.heuristics?.(header, bytes));
    if (heuristicMatch) return heuristicMatch;

    // Extension Fallback
    const extMatch = parserRegistry.find(s => s.extensions.includes(ext));
    if (extMatch) return extMatch;

    // Default to Gamemaker/Generic
    return parserRegistry.find(s => s.id === 'gamemaker')!;
}
