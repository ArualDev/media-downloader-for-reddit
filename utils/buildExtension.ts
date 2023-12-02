import { build } from "vite";
import { svelte } from '@sveltejs/vite-plugin-svelte'
import fs from 'fs/promises';
import generateManifest from "../src/generateManifest";
import { emojiStyle, failEmoji, getEmojiFromSet, successEmoji } from "./emojiSets";
import { BrowserTarget, ManifestVersion } from "../constants";
import { FGColor, consoleColor } from "./console-colors";

export default async function buildExtension(target: BrowserTarget, manifestVersion: ManifestVersion, devMode = false) {

    const entries = ['./src/content.ts', './src/background.ts', './src/options.ts'];
    const distPath = `./dist-${target}`;
    const tempDistPath = `${distPath}`;

    const targetInfoMsg = `target: ${target} - manifest v${manifestVersion} - ${devMode ? 'development' : 'production'}`

    async function buildEntry(entryPath: string, isFirstEntry: boolean) {
        const res = await build({
            configFile: false,
            logLevel: 'silent',
            plugins: [
                svelte({
                    emitCss: false
                })
            ],
            build: {
                outDir: tempDistPath,
                rollupOptions: {
                    input: entryPath,
                    output: {
                        entryFileNames: () => '[name].js',
                        assetFileNames: () => '[name][extname]'
                    },
                },
                // Only the first entry clears the dist dir. Not perfect, but should do
                emptyOutDir: isFirstEntry,
                // Only the first entry needs to copy the public dir
                copyPublicDir: isFirstEntry,
                minify: false,
                sourcemap: devMode ? "inline" : false
            }
        })
        return res;
    }

    // Building a bundle form every entry separately to avoid Vite's code splitting.
    // Not a fan of this, but Vite's forced my hand...
    try {
        for (const [index, path] of entries.entries()) {
            await buildEntry(path, index === 0)
        }
    } catch (error) {
        console.error(
            error,
            consoleColor(`build failed ${getEmojiFromSet(failEmoji, emojiStyle.Regular)}`, FGColor.Red),
            `${targetInfoMsg}`
        )
        return;
    }

    // Add generated manifest.json to dist
    const manifestStr = generateManifest(target, manifestVersion, devMode);
    await fs.appendFile(`${tempDistPath}/manifest.json`, manifestStr);

    console.log(
        consoleColor(`\nbuilt successfully ${getEmojiFromSet(successEmoji, emojiStyle.Regular)}`, FGColor.Green),
        `\n${consoleColor(targetInfoMsg, FGColor.BrightBlack)}\n`,
    );
}