import * as chokidar from "chokidar";

export default async function watchChanges(onChangeCallback: Function) {
    const watcher = chokidar.watch(['./src', './public'], {
        ignoreInitial: true
    });
    watcher.on('all', (event, path, details) => {
        onChangeCallback();
    });
}