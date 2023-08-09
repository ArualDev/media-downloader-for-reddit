import { getVersionFromBackground } from "./utils";

export default async function log(msg) {
    const options = await browser.storage.sync.get('options')
    if (!options || !options.options.enableLogging)
        return;

    console.log(`Media Downloader for Reddit v${await getVersionFromBackground()} - ${msg}`);
}