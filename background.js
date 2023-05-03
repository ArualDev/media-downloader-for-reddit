function downloadFromUrl(url, filename) {
  console.log(`DOWNLOADING FROM: ${url}`);
  browser.downloads.download({
    url: url,
    filename: filename
  });
}

function downloadRapid(url, filename) {
  console.log(`DOWNLOADING FROM: ${url}`);
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      // console.log(`BLOB SIZE: ${blob.size}`);

      if(blob.size === 0) {
        console.error("Couldn't download file");
        return;
      }

      const url = URL.createObjectURL(blob);
      downloadFromUrl(url, filename);
    })
}

browser.runtime.onMessage.addListener(message => {

  // const downloadMethods = {
  //   download: downloadFromUrl,
  //   downloadRS: downloadRapid
  // }
  // downloadMethods[message.action]();

  if (message.action === "download")
    downloadFromUrl(message.url, message.filename)
  else if (message.action === "downloadRS")
    downloadRapid(message.url, message.filename)
});