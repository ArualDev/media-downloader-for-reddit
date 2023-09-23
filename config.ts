import { BrowserTarget, ManifestVersion } from "./constants";
import { emojiStyle } from "./utils/emojiSets";

interface Target {
    browser: BrowserTarget
    manifest: ManifestVersion
}

interface Config {
    build: {
        entries: (devMode: boolean) => string[],
        distPath: (target: BrowserTarget) => string,
        tempDistPath: (target: BrowserTarget) => string,
        emojiStyle: emojiStyle | false,
        buildTargets: Target[]
    }
}

const config: Config = {
    build: {
        entries: (devMode: boolean) => [
            devMode ? './src/content.ts' : './src/content.ts',
            './src/background.ts',
            './src/options.ts'
        ],
        distPath: (target: BrowserTarget) => `./dist-${target}`,
        tempDistPath: (target: BrowserTarget) => `./dist-${target}`,
        emojiStyle: emojiStyle.Regular,
        buildTargets: [
            { browser: BrowserTarget.Chrome, manifest: 3 },
            { browser: BrowserTarget.Firefox, manifest: 3 }
        ]
    }
}




export default config;