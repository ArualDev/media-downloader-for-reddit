import buildExtension from "../utils/buildExtension";
import watchChanges from "../utils/watchChanges";
import { parse } from 'ts-command-line-args';
import { BrowserTarget, ManifestVersion } from "../constants";

interface buildArguments {
    watch?: boolean,
    manifest?: string
    target?: string
    dev?: boolean
}

const args = parse<buildArguments>({
    watch: { type: Boolean, optional: true },
    manifest: { type: String, optional: true },
    target: { type: String, optional: true },
    dev: { type: Boolean, optional: true, defaultValue: false }
});


let manifestVersion: ManifestVersion | null = null;
if (args.manifest) {
    if (!Object.values(ManifestVersion).includes(args.manifest)) {
        throw new Error(`Manifest version ${args.manifest} is not correct!`);
    }
    manifestVersion = ManifestVersion[args.manifest];
}

async function build() {
    if (manifestVersion)
        await buildExtension(BrowserTarget.Chrome, manifestVersion, args.dev);
    else {
        await buildExtension(BrowserTarget.Chrome, ManifestVersion.V3, args.dev);
        await buildExtension(BrowserTarget.Firefox, ManifestVersion.V3, args.dev)
    }
}

(async () => {

    await build();

    if (args.watch) {
        await watchChanges(build);
        console.log('\nwatching for changes...')
    }

})();
