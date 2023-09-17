import { BrowserTarget, ManifestVersion } from "../constants";
import fs from "fs/promises";
import generateManifest from "../src/generateManifest";


function getSuccessEmoji() {
    const successEmoji = ['😊','👌','🤩','🥳','😺','😽','😎','😁','😀','😌', ':3'];
    return successEmoji[Math.floor(Math.random() * successEmoji.length)];
}

export default async function buildExtension(target: BrowserTarget, manifestVersion: ManifestVersion, devMode = false) {

    const distPath = Bun.env.DIST_PATH ? `${Bun.env.DIST_PATH}/${target}-mv${manifestVersion}` : `./dist-${target}`;
    const tempDistPath = `${distPath}-temp`;
    const publicPath = './public';

    const entrypoints = ['./src/content.ts', `./src/background-${target}.ts`]
    if (devMode) {
        entrypoints.push('./src/dev/reload-content.ts')
    }

    const buildResult = await Bun.build({
        entrypoints: entrypoints,
        outdir: tempDistPath,
        sourcemap: devMode ? 'external' : 'none'
    });


    for (const log of buildResult.logs) {
        console.log(log);
    }

    if (!buildResult.success){
        console.error(`Build failed! Target: ${target}\n`, new Error('Error while building in Bun.build'));
        return;
    }

    try {
        // Copy files from public folder into dist
        await fs.cp(publicPath, tempDistPath, { recursive: true });

        // Add generated manifest.json to dist
        const manifestStr = generateManifest(BrowserTarget.Chrome, ManifestVersion.V3, devMode);
        fs.appendFile(`${tempDistPath}/manifest.json`, manifestStr);
    } catch (error) {
        // If the build failed, remove the temp directory
        await fs.rm(tempDistPath, { recursive: true })
        console.error(`Build failed! Target: ${target}\n`, error);
        return;
    }

    // If build was successful, clear the build directory and swap it with the temp directory
    await fs.rm(distPath, { recursive: true });
    await fs.rename(tempDistPath, distPath);

    console.log(`Build successful ${getSuccessEmoji()}`, `\nTarget: ${target} - manifest V${manifestVersion}`);
}