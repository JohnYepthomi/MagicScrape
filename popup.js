document.addEventListener("DOMContentLoaded", async function () {
  const startInjecButton = document.querySelector('#start-injection');
  startInjecButton.addEventListener('click', async () => {
    await chrome.runtime.sendMessage(null, { message: 'inject' })
  });

  await chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('message received on popup tab: ', message, ', by sender: ', sender);
  });

  window.addEventListener("beforeunload", function (e) {
    e.preventDefault();
    e.returnValue = "";
  });
});


  // chrome.storage.onChanged.addListener(async function (changes, namespace) {
  //   for (key in changes) {
  //     console.log({ key });
  //     if (key === "bookDetails") {
  //       let lastIndex = changes.bookDetails.newValue.length - 1;
  //       console.log('changes: ', changes.bookDetails.newValue[lastIndex]);
  //       createTableRowWithData(changes.bookDetails.newValue[lastIndex]);
  //     }
  //   }
  // });