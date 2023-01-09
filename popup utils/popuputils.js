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

async function closePinnedTab() {
    let tTab = await asyncStorageGet("targetTab");
    chrome.tabs.remove(tTab, () => { });
}

function requestAndShowPermission() {
    Notification.requestPermission(function (permission) {
        if (permission === "granted") {
            showNotification();
        }
    });
}

function showNotification() {
    if (document.visibilityState === "visible") {
        return;
    }
    var title = "infoScraper";
    icon = "icons/48.png";
    var body = "Process completed.";
    var notification = new Notification("Title", { body, icon });
    notification.onclick = () => {
        notification.close();
        window.parent.focus();
    };
}

async function createTargetTab() {
    console.log("::::::: Creating Target Tab :::::::");
    chrome.tabs.create({ url: "https://visa.vfsglobal.com/dza/fr/fra/interim-page" }, async function (newTab) {
        await asyncStorageSet({ targetTab: newTab.id });
        chrome.tabs.update(await asyncStorageGet("popupTabId"), { active: true });
    });
}

async function injectScript(tabId) {
    await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["./contentscripts/refactoredKindleSearch.js"],
    });
}

async function messageOpenTabs(message) {
    await chrome.tabs.query({}, async function (tabs) {
        if (tabs.length > 0) {
            tabs.forEach(async tab => {
                if (!tab.url.includes('chrome-extension')) {
                    await chrome.tabs.sendMessage(tab.id, message);
                }
            });
        }
    });
}

function createNotification() {
    const permission = Notification.permission;

    if (permission === "granted") {
        showNotification();
    } else if (permission === "default") {
        requestAndShowPermission();
    }
}

