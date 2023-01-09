export async function waitLogic() {
    let currentDelayFactor = randomIntFromInterval(1, 5);
    if (prevDelayFactor === currentDelayFactor && currentDelayFactor > 2) {
        console.log('prevDelayFactor === currentDelayFactor && currentDelayFactor > 2')
        await waitFor(1000);
    } else if (prevDelayFactor > currentDelayFactor && currentDelayFactor > 3) {
        console.log('prevDelayFactor > currentDelayFactor && currentDelayFactor > 3');
        await waitFor(1000);
    } else if (prevDelayFactor === currentDelayFactor && currentDelayFactor === 1) {
        console.log('prevDelayFactor === currentDelayFactor && currentDelayFactor === 1');
        await waitFor(2000);
    } else {
        await waitFor(currentDelayFactor * 1000);
    }

    prevDelayFactor = currentDelayFactor;
}

export function getCurrentTime() {
    return new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds();
}

export function getCharIndex(str, char, n) {
    return str.split(char).slice(0, n).join(char).length;
}

export function createHtmlDomNode(htmlText) {
    let htmlDomNode = document.createElement('html');
    htmlDomNode.innerHTML = htmlText;

    return htmlDomNode;
}

export async function fetchHtmlText(url) {
    var response = await fetch(url);

    let htmlPromise = new Promise(async (resolve, reject) => {
        switch (response.status) {
            // status "OK"
            case 200:
                let template = await response.text();
                resolve(template)
                break;
            // status "Not Found"
            case 404:
                console.log('Error getting HTML');
                break;
        }
    });

    let html = await htmlPromise;
    return html;
}

export function randomIntFromInterval(min, max) {
    // min and max inclusive
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function customXpath(path) {
    return document.evaluate(
        path,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
}

export async function waitFor(delay) {
    console.log("delayed for : " + delay);
    return await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, delay);
    });
}

export function isElement(element) {
    return element instanceof Element || element instanceof HTMLDocument;
}

export function isDomNode(o) {
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
    );
}

export function custom_error(err_str) {
    console.err(err_str);
}

export async function asyncStorageGet(item) {
    var getValue = new Promise(function (resolve, reject) {
        chrome.storage.local.get(item, (data) => {
            resolve(data[item]);
        });
    });

    let gV = await getValue;
    return gV;
}

export async function asyncStorageSet(item) {
    new Promise(function (resolve, reject) {
        chrome.storage.local.set(item, () => {
            resolve();
        });
    });
}

export function startMutationObserver(selector) {
    console.log('starting mutation observer');

    let observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (!mutation.addedNodes) return

            for (let i = 0; i < mutation.addedNodes.length; i++) {
                // do things to your newly added nodes here
                let node = mutation.addedNodes[i];
                console.log({ node });
            }
        })
    })

    observer.observe(document.querySelector(selector), {
        childList: true
        , subtree: true
        , attributes: false
        , characterData: false
    })

    return observer;
}

export function StopMutationObserver(observer) {
    console.log('Stopping MutationObserver')
    observer.disconnect();
}

export function LogService(scop, color) {
    const logService = {
        info: (message) =>
            console.log(
                scope + "%c" + " " + message,
                `color: ${color ? color : "teal"}; font-style: italic;`
            ),
        error: (message) =>
            console.error(
                scope + "%c" + " " + message,
                `color: ${color ? color : "red"}`
            ),
    };

    Object.freeze(logService);

    return logService;
}

module.exports = {
    StopMutationObserver,
    startMutationObserver,
    asyncStorageGet,
    asyncStorageSet,
    isDomNode,
    isElement,
    customXpath,
    custom_error,
    randomIntFromInterval,
    getCurrentTime,
    createHtmlDomNode,
    waitLogic,
    waitFor,
    getIndex
}