try {
  
  chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
  ) {
    if(request.message === 'clear-cookies'){
      clearCookies();
    }

    return true;
  });

  chrome.action.onClicked.addListener(function (tab) {
    var popupUrl = chrome.runtime.getURL("/popup.html");
    chrome.tabs.query({ url: popupUrl }, async function (tabs) {
      if (tabs.length > 0) {
        //The popup exists
        // let winId = await asyncStorageGet("popupTabId");
        // chrome.tabs.update(winId);
      } else {
        chrome.tabs.create(
          {
            url: chrome.runtime.getURL("popup.html"),
          },
          async function (tab) {
            await asyncStorageSet({ popupTabId: tab.id });
          }
        );
      }
    });
  });

  // This is where you Inject scripts when page load completes for each link
  chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    if (changeInfo.status == "complete"){
      // if (tab.url.indexOf("visa.vfsglobal.com") != -1 && tabId === (await asyncStorageGet("targetTab"))){
      //   console.log("%c -> injected script to 'visa.vfsglobal.com-verification'.","color: purple; font-size:0.7rem; font-style: bold");
      //   injectScript("visa.vfsglobal.com");
      // }

      // https://www.amazon.in/s?k=web+scraping&i=digital-text&sprefix=web+scra%2Cdigital-text%2C245&ref=nb_sb_ss_ts-doa-p_4_8

      if (isTargetUrl(tab.url)){
        console.log("%c -> injecting script to 'Amazon Kindle Store Search'.","color: purple; font-size:0.7rem; font-style: bold");
        injectScript("digital-text", tab.id);
      }
    }
  });
} catch (e) {
  //log error
  console.log("catchblock : " + e);
}

async function injectScript(domain, tabId) {
  if(domain === "digital-text"){
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["./contentscripts/refactoredKindleSearch.js"],
    });
  }
}

function isTargetUrl(url){
  let targetTag = url.split('').splice(getChar(url, 'i', 2) + 2);
  return (targetTag.join('').split('').splice(0, getChar(targetTag.join(''), '&', 1)).join('') === 'digital-text') ? true : false;
}

function getChar(str, char, n) {
  return str.split(char).slice(0, n).join(char).length;
}

async function asyncStorageGet(item) {
  var getValue = new Promise(function (resolve, reject) {
    chrome.storage.local.get(item, (data) => {
      resolve(data[item]);
    });
  });

  let gV = await getValue;
  return gV;
}

async function asyncStorageSet(item) {
  new Promise(function (resolve, reject) {
    chrome.storage.local.set(item, () => {
      resolve();
    });
  });
}