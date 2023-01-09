const MAGIC_SCRAPE_SCRIPT_INJECTED = true;

(async () => {
  addColListeners();
  // createHoverControlUI();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(
      "Message received on contentScript: ",
      request.message,
      ", by sender: ",
      sender
    );
    if (request.message === "search-table") {
      console.log("searching table...");
      addDocumentHoverListener();
    }
  });

  window.addEventListener("beforeunload", async function (e) {
    e.preventDefault();
    e.returnValue = "";
  });
})();
