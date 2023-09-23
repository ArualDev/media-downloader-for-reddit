import { BrowserTarget, ManifestVersion } from "../constants";
const packageVersion = require('../package.json').version as string;

const commonAll = {
    name: "Media Downloader for Reddit",
    description: "",
    version: packageVersion.split('-')[0],
    version_name: packageVersion,
    content_scripts: [
        {
            matches: ["https://*.reddit.com/*"],
            // css: ["content.css"],
            js: ["content.js"]
        }
    ]
}

const commonV2 = {
    manifest_version: 2,
    permissions: [
        "storage",
        "downloads",
        "<all_urls>"
    ],
}

const commonV3 = {
    manifest_version: 3,
    permissions: [
        "storage",
        "downloads",
    ],
    host_permissions: [
        "<all_urls>",
    ],
    // options_ui: {
    //     page: "options.html",
    //     open_in_tab: false
    // },
    options_page: 'options.html'
}

const chromeV2 = {
    background: {
        scripts: ["background.js"],
        persistent: false
    },
}

const firefoxV2 = {
    background: {
        scripts: ["background.js"],
        persistent: false
    },
}

const chromeV3 = {
    action: {
        default_title: "Media Downloader for Reddit"
    },
    background: {
        "service_worker": "background.js"
    },
}

const firefoxV3 = {
    background: {
        scripts: ["background.js"]
    },
}

export default function generateManifest(target: BrowserTarget, manifestVersion: ManifestVersion, devMode = false) {
    const common = {
        ...commonAll,
        ...(manifestVersion === ManifestVersion.V2 ? commonV2 : commonV3)
    }

    const browserSpecific = manifestVersion === ManifestVersion.V2
        ? target === BrowserTarget.Chrome ? chromeV2 : firefoxV2    // Manifest V2
        : target === BrowserTarget.Chrome ? chromeV3 : firefoxV3;   // Manifest V3

    const output = { ...common, ...browserSpecific }

    // if (devMode) {
    //     output.content_scripts.push(
    //         {
    //             matches: ["https://*.reddit.com/*"],
    //             css: ["content.css"],
    //             js: ["reload-content.js"]
    //         }
    //     );
    // }

    return JSON.stringify(output, null, 2);
}

