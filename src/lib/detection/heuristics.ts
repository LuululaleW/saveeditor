import { Buffer } from 'buffer';

export interface FileHeuristics {
    engine: string | null;
    format: string | null;
    confidence: 'high' | 'medium' | 'low';
}

export async function detectEngine(file: File): Promise<FileHeuristics> {
    const buffer = await file.slice(0, 1024).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const headerString = Buffer.from(bytes).toString('utf-8');

    // 1. Unreal Engine (GVAS)
    if (headerString.startsWith('GVAS')) {
        return { engine: 'unreal', format: 'sav', confidence: 'high' };
    }

    // 2. Ren'Py (Python Pickle)
    // Ren'Py saves usually start with a pickle version or header
    // Some versions start with \x80\x02 or \x80\x03 (Pickle protocol)
    if (bytes[0] === 0x80 && (bytes[1] === 0x02 || bytes[1] === 0x03 || bytes[1] === 0x04)) {
        return { engine: 'renpy', format: 'save', confidence: 'medium' };
    }

    // 3. Unity XML (PlayerPrefs)
    if (headerString.includes('<?xml') && (headerString.includes('<unity') || headerString.includes('<map'))) {
        return { engine: 'unity', format: 'xml', confidence: 'high' };
    }

    // 4. RPG Maker MV/MZ (often JSON, but let's check for specific keys)
    if (headerString.trim().startsWith('{') || headerString.trim().startsWith('[')) {
        try {
            // Only try to parse a small part if it's huge
            const partialText = headerString.slice(0, 1000);
            if (partialText.includes('"gold"') || partialText.includes('"actors"') || partialText.includes('"switches"')) {
                return { engine: 'rpgmaker', format: 'json', confidence: 'medium' };
            }
        } catch {
            // Ignored
        }
    }

    // 5. Godot (ConfigResource or TextResource)
    if (headerString.startsWith('[gd_resource') || headerString.startsWith('[gd_scene')) {
        return { engine: 'godot', format: 'tres', confidence: 'high' };
    }

    if (headerString.includes('[section]') || (headerString.includes('[') && headerString.includes('='))) {
        if (headerString.includes('config_version=')) {
            return { engine: 'godot', format: 'godot-config', confidence: 'high' };
        }
    }

    return { engine: null, format: null, confidence: 'low' };
}
