function downloadFromUrl(url, filename, saveAs = false) {
	browser.downloads.download({
		url: url,
		filename: filename,
		saveAs: saveAs
	});
}

const messageActions = {
	download: msg => {
		downloadFromUrl(msg.url, msg.filename, msg.saveAs)
	}
}

browser.runtime.onMessage.addListener(message => {
	if (message.action in messageActions)
		messageActions[message.action](message);
});
