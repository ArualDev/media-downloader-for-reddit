import handleFeed from "./handlers/handleFeed";
import handlePost from "./handlers/handlePost";
import { REFRESH_INTERVAL_MS} from "./helpers/constants";

function checkForChangesAndInject() {
    if (window.location.href.includes('/comments/')) {
        handlePost();
        return;
    }
    handleFeed();
}

function init() {
    setInterval(_ => {
        checkForChangesAndInject();
    }, REFRESH_INTERVAL_MS);
    checkForChangesAndInject();
}

init();