let tbodyEl = document.getElementsByTagName('tbody')[0];

let permission = Notification.permission;

//To Support pagination 
//asyncStorageSet({startMutation: false});


if (permission === "granted") {
  //showNotification();
} else if (permission === "default") {
  requestAndShowPermission();
}

//Send a start message to all opened tabs
function initiateProcess() {
  console.log("process initialted...");
  chrome.tabs.query({}, function (tabs) {
    // var activeTab = tabs[0];
    for (let tab of tabs) {
      chrome.tabs.sendMessage(tab.id, { message: "start" });
    }
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
  ){
    if (request.message === "completed") {
      showNotification();
      currentpageindicatorEl.innerText = "completed"
      chrome.runtime.sendMessage({ message: "clear-cookies" }, function (response) {
        console.log("clear-cookie message sent to serviceworker");
      });
      return true;
    }

    return true;
  }); 

  chrome.storage.onChanged.addListener(async function (changes, namespace) {
    for (key in changes) {
      console.log({key});
      if (key === "bookDetails") {
        let lastIndex = changes.bookDetails.newValue.length - 1;
        console.log('changes: ', changes.bookDetails.newValue[lastIndex]);
        createTableRowWithData(changes.bookDetails.newValue[lastIndex]);
      }
    }
  });

  //Confirm closing of tab with unsaved changes
  window.addEventListener("beforeunload", function (e) {
    //closePinnedTab();
    e.preventDefault();
    e.returnValue = "";
  });
});

function createTableRowWithData(data){
  let tr         = document.createElement('tr');
  let url_th     = document.createElement('th');
  let title_td   = document.createElement('td');
  let price_td   = document.createElement('td');
  let pages_td   = document.createElement('td');
  let ranking_td = document.createElement('td');
  let img        = document.createElement('img');

  url_th.className = 'col-2 text-truncate';
  
  title_td.innerText   = data.title;
  price_td.innerText   = data.price;
  pages_td.innerText   = data.pages;
  ranking_td.innerText = data.ranking;
  url_th.innerText     = data.url;
  img.src              = data.imgUrl;

  tr.appendChild(img);
  tr.appendChild(title_td);
  tr.appendChild(price_td);
  tr.appendChild(pages_td);
  tr.appendChild(ranking_td);
  tr.appendChild(url_th);

  tbodyEl.appendChild(tr);
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

async function closePinnedTab() {
  let tTab = await asyncStorageGet("targetTab");
  chrome.tabs.remove(tTab, () => {});
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

//Will be called once to open a new tab with the Url
async function createTargetTab() {
  console.log("::::::: Creating Target Tab :::::::");
  chrome.tabs.create({ url: "https://visa.vfsglobal.com/dza/fr/fra/interim-page" }, async function (newTab) {
    await asyncStorageSet({targetTab: newTab.id});
    chrome.tabs.update(await asyncStorageGet("popupTabId"), { active: true });
  });
}