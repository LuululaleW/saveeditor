// Worker for off-main-thread parsing
import { Buffer } from 'buffer';

self.onmessage = async (e: MessageEvent) => {
    const { file, engine, editorSlug, format } = e.data;

    try {
        let outcome;
        if (engine === 'unreal' || format === 'unreal') {
            const { parseUnreal } = await import('../parsers/unreal');
            outcome = await parseUnreal(file);
        } else if (engine === 'palworld' || editorSlug === 'palworld') {
            const { parsePalworld } = await import('../parsers/palworld');
            outcome = await parsePalworld(file);
        } else if (engine === 'rpgmaker' || format === 'rpgmaker') {
            const { parseRPGMakerMV } = await import('../parsers/rpgmaker');
            outcome = await parseRPGMakerMV(file);
        } else if (engine === 'godot' || format === 'godot') {
            const { parseGodot } = await import('../parsers/godot');
            outcome = await parseGodot(file);
        } else if (engine === 'unity' || format === 'unity') {
            const { parseUnity } = await import('../parsers/unity');
            outcome = await parseUnity(file);
        } else if (engine === 'renpy' || format === 'renpy') {
            const { parseRenpy } = await import('../parsers/renpy');
            outcome = await parseRenpy(file);
        } else {
            const { parseGamemaker } = await import('../parsers/gamemaker');
            outcome = await parseGamemaker(file);
        }

        self.postMessage({ type: 'success', outcome });
    } catch (err: any) {
        self.postMessage({ type: 'error', error: err.message });
    }
};
