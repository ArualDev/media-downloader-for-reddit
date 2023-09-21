import { BrowserTarget } from "./constants";
import { emojiStyle } from "./utils/emojiSets";

interface Config {
    entries: (devMode: boolean) => string[],
    distPath: (target: BrowserTarget) => string,
    tempDistPath: (target: BrowserTarget) => string,
    emojiStyle: emojiStyle | false,
}

const config: Config = {
    entries: (devMode: boolean) => [
        devMode ? './src/content.ts' : './src/content.ts',
        './src/background.ts',
        './src/options.ts'
    ],
    distPath: (target: BrowserTarget) => `./dist-${target}`,
    tempDistPath: (target: BrowserTarget) => `./dist-${target}`,

    emojiStyle: emojiStyle.Regular
}

export default config;