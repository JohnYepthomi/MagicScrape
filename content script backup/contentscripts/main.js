(async () => {
	addListeners();

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		console.log('Message received on contentScript: ', message, ', by sender: ', sender);
	});

	window.addEventListener("beforeunload", async function (e) {
		e.preventDefault();
		e.returnValue = "";
	});
})()




