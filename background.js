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
	},
	getVersion: (message, sender, sendResponse) => {
		const manifest = browser.runtime.getManifest();
		const extensionVersion = manifest.version;
		sendResponse(extensionVersion);
	}
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action in messageActions)
		messageActions[message.action](message, sender, sendResponse);
});