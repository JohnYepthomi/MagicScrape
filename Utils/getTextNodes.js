function getTableData(parent) {
  let result = [];

  getAllNodes(parent).forEach((n) => {
    if (n.nodeName === "A") {
      const linkText = getLink(n);
      if (linkText && linkText !== "")
        result.push({
          text: linkText,
          xpath: getRealtiveXPathToChild(n, parent),
        });
    } else if (n.nodeName === "#text") {
      const textContent = getText(n);
      if (textContent && textContent !== "")
        result.push({
          text: textContent,
          xpath: getRealtiveXPathToChild(n, parent),
        });
    }
  });

  return result;
}

function getAllNodes(parent) {
  let textNodes = [];

  Array.from(parent.getElementsByTagName("*")).forEach((el) => {
    if (el.childNodes) textNodes.push(...el.childNodes);
  });

  return textNodes;
}

function getLink(node) {
  return node.href;
}

function getText(node) {
  return node.textContent.trim();
}
