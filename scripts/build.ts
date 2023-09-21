import { BrowserTarget, ManifestVersion } from "../constants";
import buildExtension from "../utils/buildExtension";
import watchChanges from "../utils/watchChanges";
import { parse } from 'ts-command-line-args';

interface buildArguments {
    watch?: boolean,
    manifest?: string
    target?: string
    dev?: boolean
}

const args = parse<buildArguments>({
    watch: {type: Boolean, optional: true},
    manifest: {type: String, optional: true},
    target: {type: String, optional: true},
    dev: {type: Boolean, optional: true, defaultValue: false}
});

// const manifestVersion = (<any>Object).values(ManifestVersion).includes(args.manifest)
//     ? ManifestVersion[args.manifest as 'V2' | 'V3']
//     : null;

// const target = (<any>Object).values(BrowserTarget).includes(args.target)
//     ? BrowserTarget[args.target as 'Chrome' | 'Firefox']
//     : null;


async function build() {
    await buildExtension(BrowserTarget.Chrome, ManifestVersion.V3, args.dev);
    // await buildExtension(BrowserTarget.Firefox, ManifestVersion.V3)
}

await build();

if(args.watch) {
    await watchChanges(build);
    console.log('\nwatching for changes...')
}    


