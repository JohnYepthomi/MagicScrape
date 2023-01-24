/**
 *  @Function_to_check_if_an_element_has_Child_Text_Nodes_with_actual_text_and_not_just_ESCAPE_CHARACTERS
 * eg node.textContent == ' \n '
 * */

function hasChildTextNodesContainingText(tagNode) {
  let formatTags = [
    "b",
    "strong",
    "i",
    "em",
    "mark",
    "small",
    "del",
    "ins",
    "sub",
    "sup",
  ];

  //Ignoring format tags i.e <i> <b> <sup> etc..
  if (formatTags.includes(tagNode.nodeName.toLowerCase())) return false;

  if (
    Array.from(tagNode.childNodes).filter((d) => d.nodeName === "#text")
      .length === 0
  )
    return false;
  return Array.from(tagNode.childNodes)
    .filter((d) => d.nodeName === "#text")
    .every((e) => e.nodeValue.trim() !== "");
}

function getAllTextInNode(tagNode) {
  let childNodes = tagNode.querySelectorAll("*");
  let textsList = [];
  Array.from(childNodes).forEach((item) => {
    if (hasChildTextNodesContainingText(item) && item.textContent.length > 1) {
      textsList.push(item.textContent);
    }
  });

  return textsList;
}

function getTableData(parent) {
  let result = [];

  getAllNodes(parent).forEach((node) => {
    let textContent = "";
    let className = "";
    let textExist = false;
    let currNodeName = node.nodeName;

    if (currNodeName === "A") {
      let baseClassName = node.classList.value.split(" ")[0];
      baseClassName =
        baseClassName === ""
          ? findClosestClass(node, parent) + " href"
          : baseClassName + " href";
      if (baseClassName) {
        className =
          baseClassName +
          result.filter((item) => item.class.includes(baseClassName))?.length;
        textContent = getLink(node);
      }
    } else if (currNodeName === "#text") {
      const ParentTagEl = node.parentNode;
      let baseClassName = ParentTagEl.classList.value.split(" ")[0];
      baseClassName =
        baseClassName === "" ? findClosestClass(node, parent) : baseClassName;

      if (baseClassName) {
        className =
          baseClassName +
          result.filter((item) => item.class.includes(baseClassName))?.length;
        textContent = getText(node);
      }
    }

    if (
      textContent !== "" &&
      textContent.length > 1 &&
      className &&
      className !== ""
    ) {
      result.forEach((item) => {
        if (!textExist && item.text === textContent) textExist = true;
      });

      if (
        (currNodeName === "A" || currNodeName === "#text") &&
        !textExist &&
        className &&
        className !== ""
      )
        result.push({
          text: textContent,
          xpath: getRealtiveXPathToChild(node, parent),
          class: className,
        });
    }
  });

  return result;
}

function findClosestClass(el, stopNode) {
  if (el === stopNode) return "";
  else if (el.parentElement.classList.value !== "")
    return el.parentElement.classList.value;
  else return findClosestClass(el.parentElement);
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function getAllNodes(parent) {
  let nodesList = [];

  Array.from(parent.getElementsByTagName("*")).forEach((el) => {
    if (el.childNodes) nodesList.push(...el.childNodes);
  });

  return nodesList;
}

function getLink(node) {
  return node.href;
}

function getText(node) {
  return node.textContent.trim();
}
