try {
  handlePopupActionWindow();
  enableActiveTabListeners();
  handleRuntimeMessages();
} catch (e) {
  //log error
  console.log("catchblock : " + e);
}

/* UTILITIES */

function handleRuntimeMessages() {
  chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
  ) {

    return true;
  });
}

function handlePopupActionWindow() {
  chrome.action.onClicked.addListener(function (tab) {
    // const popupUrl = chrome.runtime.getURL("/popup.html");

    chrome.windows.getAll(
      { populate: true, windowTypes: ["popup"] },
      async function (windows) {
        if (windows.length === 0) {
          chrome.windows.create(
            {
              url: chrome.runtime.getURL(
                "./FRONTEND/MagicScrapeFE/dist/index.html"
              ),
              type: "popup",
            },
            async function (window) {
              await asyncStorageSet({
                popupDetails: { tabId: window.tabs[0].id, windowId: window.id },
              });
              const temp = await asyncStorageGet("popupDetails");
              console.log(temp);
            }
          );
        }
      }
    );
  });
}

async function getActiveWindowTab() {
  let windowWithTabId = {};
  const windows = await chrome.windows.getAll({
    populate: true,
    windowTypes: ["normal"],
  });
  console.log("windows: ", windows);
  windows.forEach((window) => {
    if (window.focused)
      window.tabs.forEach((tab) => {
        if (tab.active) {
          windowWithTabId = { window, tab };
        }
      });
  });

  return windowWithTabId;
}

async function injectScriptToActiveWindowTab() {
  const tabData = await asyncStorageGet("lastActiveTabData");
  const currentActiveTab = await getTabFromId(tabData.tabId);
  console.log({ currentActiveTab });
  await chrome.scripting.executeScript({
    target: { tabId: tabData.tabId },
    files: ["./contentscripts/FindRowAndCol.js", "./contentscripts/main.js"],
  });
}

async function getTabFromId(tabId) {
  const allTabs = await chrome.tabs.query({});
  return allTabs.filter((tab) => tab.id == tabId)[0];
}


function enableActiveTabListeners() {
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const currentActiveTab = await getTabFromId(activeInfo.tabId);
    if (isSupportedSite(currentActiveTab.url) && currentActiveTab.favIconUrl) {
      await asyncStorageSet({
        lastActiveTabData: {
          tabId: activeInfo.tabId,
          icon: currentActiveTab.favIconUrl,
          title: currentActiveTab.title,
        },
      });
    }
  });

  chrome.windows.onFocusChanged.addListener(
    async (windowId) => {
      const windows = await chrome.windows.getAll({
        populate: true,
        windowTypes: ["normal"],
      });
      windows.forEach((window) => {
        if (window.id == windowId)
          window.tabs.forEach(async (tab) => {
            if (tab.active && tab.favIconUrl) {
              await asyncStorageSet({
                lastActiveTabData: {
                  tabId: tab.id,
                  icon: tab.favIconUrl,
                  title: tab.title,
                },
              });
            }
          });
      });
    },
    { windowTypes: ["normal"] }
  );
}

function isSupportedSite(url) {
  const avoidList = [
    "chrome-extension://fboobaoipckeajljimnmankjcgfboejp/popup.html",
    "chrome://extensions/",
  ];
  return !avoidList.includes(url) ? true : false;
}

function isTargetUrl(url) {
  let targetTag = url.split("").splice(getChar(url, "i", 2) + 2);
  return targetTag
    .join("")
    .split("")
    .splice(0, getChar(targetTag.join(""), "&", 1))
    .join("") === "digital-text"
    ? true
    : false;
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
