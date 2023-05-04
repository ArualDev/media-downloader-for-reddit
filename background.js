function downloadFromUrl(url, filename) {
	browser.downloads.download({
		url: url,
		filename: filename
	});
}

const messageActions = {
	download: msg => {
		downloadFromUrl(msg.url, msg.filename)
	}
}

browser.runtime.onMessage.addListener(message => {
	if (message.action in messageActions)
		messageActions[message.action](message);
});