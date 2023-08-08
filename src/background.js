const messageActions = {
	download: msg => {
		browser.downloads.download({
			url: msg.url,
			filename: msg.filename,
			saveAs: msg.saveAs
		});
	},
	getVersion: (message, sender, sendResponse) => {
		const manifest = browser.runtime.getManifest();
		sendResponse(manifest.version);
	}
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action in messageActions)
		messageActions[message.action](message, sender, sendResponse);
});