let prevHoverEl = "";

class FindColParent {
    static result;
    static prevSibs = [];
    static hoverEl;
    static finalCandidate;
    static prevCounterEls = [];

    static search(hoverEl) {
        if (!hoverEl) return;
        this.hoverEl = hoverEl;
        this.finalCandidate = undefined;

        let prevText = "";
        let timeoutId = setTimeout(
            function () {
                const currHoverText = getHoverText(hoverEl);

                /* condition if same text  */
                if (currHoverText === prevText) return;

                const candidate = hoverEl?.parentElement;
                if (candidate) {
                    this.find(candidate);

                    if (currHoverText && currHoverText !== "") {
                        prevText = currHoverText;
                    }   

                    if (currHoverText) {
                        console.log("hoverText: ", currHoverText);
                    }
                    console.log("hoverEl: ", hoverEl);
                }
            }.bind(this),
            150
        );

        hoverEl.addEventListener("mouseleave", function cancelTimeoutExecution() {
            clearTimeout(timeoutId);
        });
    }

    static find(candidate) {
        if (!candidate) {
            return this.result;
        }

        const sibs = candidate?.parentElement?.children;
        if (!sibs || sibs.length === 0) {
            return this.find(candidate?.parentElement);
        } else if (sibs.length > 0) {
            this.onCompletion(candidate, sibs);
            return this.result;
        }

    }

    static onCompletion(candidate, sibs) {
        this.finalCandidate = candidate;

        if (ValidateColParent.validateConsecutivePairs(sibs)) {
            const filteredSibs = ValidateColParent.filterAnomalies(sibs);

            if (this.prevSibs.length > 0) {
                this.prevSibs.forEach((sib) => removeParentHighlight(sib));
            }

            filteredSibs.forEach((sib) => {
                if (sib) {
                    highlightParentEl(sib);
                }
            });

            this.result = candidate;
            this.prevSibs = [...sibs];
            this.findCounterElements(sibs, this.hoverEl);

            removeDocumentHoverListener();
            console.log("FINAL PARENT: ", candidate);
        } else {
            const newCandidate = candidate?.parentElement;
            if (newCandidate) {
                return this.find(newCandidate);
            } else {
                console.log("No Candidates passed, No More Candidate(ColParent).");
                return null;
            }
        }
    }

    static findCounterElements(sibs, hoverEl) {
        const counterElements = [];
        const relXpath = getRealtiveXPathToChild(
            hoverEl,
            null,
            this.finalCandidate
        );

        if (relXpath) {
            Array.from(sibs).forEach((sib) => {
                counterElements.push(getElementByXpath(relXpath, sib));
            });
        }

        if (this.prevCounterEls) {
            this.prevCounterEls.forEach((pe) => {
                highlightHoverEl(pe, true);
            });
        }

        if (counterElements) {
            counterElements.forEach((el) => {
                highlightHoverEl(el);
            });
        }

        this.prevCounterEls = [...counterElements];
        console.log("relXpath: ", relXpath, ", counterElements: ", counterElements);
    }
}

class ValidateColParent {
    static validate(candidate) {
        return this.level1(candidate) && this.level2(candidate) ? true : false;
    }

    static validateConsecutivePairs(sibs) {
        let FOUND = false;
        let sibsLen = sibs.length - 1;

        for (let i = 0; i < sibsLen; i++) {
            if (FOUND) break;
            if (i !== sibsLen && !FOUND)
                if (this.validate(sibs[i], sibs[i + 1])) FOUND = true;
        }

        return FOUND;
    }

    static level1(candidate) {
        const c1 = candidate?.childElementCount;
        let c2 = candidate?.nextElementSibling?.childElementCount;

        if (!c2) {
            c2 = candidate?.previousElementSibling?.childElementCount;
        }

        return c1 && c2 && c1 === c2 ? true : false;
    }

    static level2(candidate) {
        const Nodes1 = candidate?.firstElementChild?.children;
        let Nodes2 = candidate?.nextElementSibling?.firstElementChild?.children;

        if (!Nodes2) {
            Nodes2 = candidate?.previousElementSibling?.firstElementChild?.children;
        }

        if (Nodes1 && Nodes2 && Nodes1.length === 0 && Nodes2.length === 0) {
            return true;
        }

        if (Nodes1 && Nodes2 && Nodes1?.length === Nodes2?.length) {
            if (this.validateByTags(Nodes1, Nodes2)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    static filterAnomalies(sibs) {
        let sibsArr = Array.from(sibs);
        let lengthsArr = [];
        let numCountsArr = {};
        sibsArr.forEach((sib) => lengthsArr.push(sib.childElementCount));
        lengthsArr = Array.from(new Set(lengthsArr));
        sibsArr.forEach((sib) => {
            lengthsArr.forEach((len) => {
                if (sib.childElementCount === len) {
                    numCountsArr[len] = [
                        ...(numCountsArr[len] ? numCountsArr[len] : []),
                        sib
                    ];
                }
            });
        });

        let count = 0;
        let key = "";
        Object.keys(numCountsArr).forEach((lenKey) => {
            if (numCountsArr[lenKey].length > count) {
                count = numCountsArr[lenKey].length;
                key = lenKey;
            }
        });

        sibsArr = null;

        return numCountsArr[key];
    }

    static validateByTags(n1, n2) {
        if (n1.length !== n2.length) return false;

        let len = n1.length - 1;
        let trueCount = 0;

        for (let i = 0; i < len; i++) {
            if (n1[i].tagName === n2[i].tagName) {
                trueCount++;
            }
        }

        if (trueCount === len) return true;
        else return false;
    }

    static hasSibling(el) {
        return el.previousElementSibling || el.nextElementSibling ? true : false;
    }
}

/* UTILITIES */
function getHoverText(el) {
    if (!el) {
        return;
    }

    let excludeTags = [
        "B",
        "STRONG",
        "I",
        "EM",
        "MARK",
        "SMALL",
        "DEL",
        "INS",
        "SUB",
        "SUP"
    ];

    const children = el.children;
    const filteredNodes = Array.from(children).filter(
        (n) => !excludeTags.includes(n.tagName)
    );
    const filteredCount = filteredNodes.length;

    // console.log("filteredNodes: ", filteredNodes);
    // console.log("hoverEl children: ", children);

    if (filteredCount === 0) {
        return el?.innerText?.trim();
    } else {
        // console.log("DirtyText: ", el?.textContent?.trim(), ", el: ", el);
        return undefined;
    }
}

function highlightParentEl(el) {
    try {
        el.style = "border-radius: 5px; border: 1.5px solid green;";
    } catch (error) {
        console.log("Could not apply style to Element: ", el, ", error: ", error);
    }
}

function removeParentHighlight(el) {
    try {
        el.style = "";
    } catch (error) {
        console.log("Could not apply style to Element: ", el, ", error: ", error);
    }
}

function highlightHoverEl(e, remove = false) {
    if (remove && e) e.style = "";
    else if (e && !remove)
        e.style =
            "background: rgb(38 204 72 / 84%); color: white; border-radius: 3px;";
}

function getElementByXpath(path, node) {
    return document.evaluate(
        path,
        node ? node : document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
    ).singleNodeValue;
}

function FilterUndefined(query) {
    return query ? query : "NA";
}

const areSiblings = (elm1, elm2) =>
    elm1 !== elm2 && elm1.parentNode === elm2.parentNode;

function createHoverControlUI(hoverEl) {
    const HTML = `<div style="position: sticky; z-index: 999999999999999; height: 150px; width: 150px; padding: 7px;  top: 0; "><button style="padding: 5px; background: green; color: white;" id="my-hover-button-up">Up One Level</button><button style="padding: 5px; background: red; color: white;" id="my-hover-button-down">down One Level</button><button style="padding: 5px; background: orange; color: black;" id="toggle-hover"> Activate hover</button></div>`;
    const body = document.body;
    document.body.insertAdjacentHTML("afterbegin", HTML);

    const upEl = body.querySelector("#my-hover-button-up");
    const downEl = body.querySelector("#my-hover-button-down");
    const activateHover = body.querySelector("#toggle-hover");
    upEl.addEventListener("click", () => {
        console.log(
            "up level called with FindColParent.result: ",
            FindColParent.result
        );
        if (FindColParent.result) {
            FindColParent.find(FindColParent.result.parentElement);
        }
    });
    downEl.addEventListener("click", () => {
        if (FindColParent.result)
            FindColParent.find(FindColParent.result.firstElementChild);
    });
    activateHover.addEventListener("click", () => {
        document.removeEventListener("mousemove", handleDocumentHover);
        document.addEventListener("mousemove", handleDocumentHover);
    });
}

/**
 * May give bad resutls
 * @ref : https://stackoverflow.com/questions/9197884/how-do-i-get-the-xpath-of-an-element-in-an-x-html-file
 */

function getAbsoluteXPath(node) {
    var comp,
        comps = [];
    var parent = null;
    var xpath = "";
    var getPos = function (node) {
        var position = 1,
            curNode;
        if (node.nodeType === Node.ATTRIBUTE_NODE) {
            return null;
        }
        for (
            curNode = node.previousSibling;
            curNode;
            curNode = curNode.previousSibling
        ) {
            if (curNode.nodeName === node.nodeName) {
                ++position;
            }
        }
        return position;
    };

    if (node instanceof Document) {
        return "/";
    }

    for (
        ;
        node && !(node instanceof Document);
        node =
        node.nodeType === Node.ATTRIBUTE_NODE
            ? node.ownerElement
            : node.parentNode
    ) {
        comp = comps[comps.length] = {};

        /*eslint default-case: "error"*/
        switch (node.nodeType) {
            case Node.TEXT_NODE:
                comp.name = "text()";
                break;
            case Node.ATTRIBUTE_NODE:
                comp.name = "@" + node.nodeName;
                break;
            case Node.PROCESSING_INSTRUCTION_NODE:
                comp.name = "processing-instruction()";
                break;
            case Node.COMMENT_NODE:
                comp.name = "comment()";
                break;
            case Node.ELEMENT_NODE:
                comp.name = node.nodeName;
                break;
            // No Default
        }
        comp.position = getPos(node);
    }

    for (var i = comps.length - 1; i >= 0; i--) {
        comp = comps[i];
        xpath += "/" + comp.name;
        if (comp.position != null) {
            xpath += "[" + comp.position + "]";
        }
    }

    return xpath;
}

function getRealtiveXPathToChild(childNode, Tags, mainNode) {
    const mainParent = mainNode.parentNode;
    Tags = Tags ? Tags : [];
    let currTag = childNode.tagName;
    const currParent = childNode.parentNode;

    if (currParent && mainParent !== currParent) {
        var els = currParent.querySelectorAll(`:scope > ${currTag}`);

        els.forEach((el, idx) => {
            if (els.length > 1 && el === childNode) {
                currTag += "[" + (idx + 1) + "]";
            }
        });

        Tags.push(currTag);
        return this.getRealtiveXPathToChild(currParent, Tags, mainNode);
    }

    return Tags.reverse().join("/");
}

/* Listeners */

function removeDocumentHoverListener() {
    console.log("removeDocumentHoverListener called");
    document.removeEventListener("mousemove", handleDocumentHover);
}

function handleDocumentHover(e) {
    console.log("handleDocumentHover called.");
    if (e.target === prevHoverEl) return;
    let hoverEl = document.elementFromPoint(e.clientX, e.clientY);
    console.log("Parent not found, searching parents...");
    FindColParent.search(hoverEl, getHoverText(hoverEl), e);
    prevHoverEl = e.target;
}

const DOCUMENT_HOVER_KEY = "ControlLeft";
const COUNTER_HOVER_KEY = "ShiftLeft";

function addListeners() {
    document.addEventListener("keydown", (e) => {
        console.log("keydown Listener Activated", e.code);
        if (e.code === DOCUMENT_HOVER_KEY) {
            FindColParent.finalCandidate = undefined;
            addDocumentHoverListener();
        } else if (e.code === COUNTER_HOVER_KEY && FindColParent.finalCandidate) {
            addBoundingListener(e);
        }
    });

    document.addEventListener("keyup", (e) => {
        console.log("keyup Listener Activated", e.code);
        if (e.code === DOCUMENT_HOVER_KEY) removeDocumentHoverListener();
        else if (e.code === COUNTER_HOVER_KEY) removeBoundingListener(e);
    });

    function addDocumentHoverListener() {
        document.addEventListener("mousemove", handleDocumentHover);
    }

    function addBoundingListener(e) {
        console.log("addBoundingListener", e.code);
        const boundingEl = FindColParent.finalCandidate.parentElement;
        console.log("boundingEl: ", boundingEl);
        if (e.code === COUNTER_HOVER_KEY && boundingEl) {
            boundingEl.addEventListener("mousemove", handleCounterHover);
        }
    }

    function removeBoundingListener(e) {
        console.log("removeBoundingListener called", e.code);
        const boundingEl = FindColParent?.finalCandidate?.parentElement;
        if (e.code === COUNTER_HOVER_KEY && boundingEl) {
            boundingEl.removeEventListener("mousemove", handleCounterHover);
        }
    }

    function handleCounterHover(e) {
        console.log("bounded listener activated");
        const ColParent = getColParentFromPoint(e.clientX, e.clientY);
        const trueElement = trueElementFromPointWithinCol(
            e.clientX,
            e.clientY,
            ColParent
        );
        console.log("True Element: ", trueElement);
        // FindColParent.findCounterElements(FindColParent.prevSibs, e.target);
        FindColParent.findCounterElements(FindColParent.prevSibs, trueElement);
    }
}

function removeListeners() {
    document.removeEventListener('keyup',)
    document.removeEventListener('keyup',)
    document.removeEventListener('keyup',)
    document.removeEventListener('keyup',)
}

function trueElementFromPointWithinCol(x, y, ColParent) {
    let result;
    if (ColParent) {
        const all = ColParent.getElementsByTagName("*");
        Array.from(all).forEach((el) => {
            const bb = el.getBoundingClientRect();
            if (isPointWithinBoundingBox(x, y, bb)) {
                result = el;
            }
        });
    }

    return result;
}

function getColParentFromPoint(x, y) {
    const ColParent = FindColParent.finalCandidate;
    if (ColParent) {
        const sibs = ColParent.parentElement.children;
        let result;
        Array.from(sibs).forEach((sib) => {
            const bb = sib.getBoundingClientRect();
            if (isPointWithinBoundingBox(x, y, bb)) {
                result = sib;
            }
        });

        return result;
    }
}

function isPointWithinBoundingBox(x, y, bb) {
    return bb.top <= y && y <= bb.bottom && bb.left <= x && x <= bb.right
        ? true
        : false;
}