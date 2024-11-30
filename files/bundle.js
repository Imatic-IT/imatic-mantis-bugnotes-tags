/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/components/BugnoteEnhancer.ts":
/*!*******************************************!*\
  !*** ./src/components/BugnoteEnhancer.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BugnoteEnhancer: () => (/* binding */ BugnoteEnhancer)
/* harmony export */ });
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/utils */ "./src/utils/utils.ts");
/* harmony import */ var emoji_picker_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! emoji-picker-element */ "./node_modules/emoji-picker-element/index.js");
/* harmony import */ var _utils_IconManager__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/IconManager */ "./src/utils/IconManager.ts");
/* harmony import */ var _utils_BugnotesHelper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/BugnotesHelper */ "./src/utils/BugnotesHelper.ts");
/* harmony import */ var _utils_ReactionIconManager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/ReactionIconManager */ "./src/utils/ReactionIconManager.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};





class BugnoteEnhancer {
    constructor() {
        this.settings = _utils_utils__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_SETTINGS;
        this.iconManager = new _utils_IconManager__WEBPACK_IMPORTED_MODULE_2__.IconManager();
        this.bugnoteHelper = new _utils_BugnotesHelper__WEBPACK_IMPORTED_MODULE_3__.BugnotesHelper();
        this.reactionIconManager = new _utils_ReactionIconManager__WEBPACK_IMPORTED_MODULE_4__.ReactionIconManager();
        this.highlightedBugnotes = [];
        this.highlightedClass = 'highlighted';
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.moveSavedBugnotesButton();
            yield this.loadSettings();
            yield this.loadHighlightedBugnotes();
            yield this.initializeBugnoteUI();
        });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = yield (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.getSettings)();
        });
    }
    loadHighlightedBugnotes() {
        return __awaiter(this, void 0, void 0, function* () {
            this.highlightedBugnotes = yield this.bugnoteHelper.getHighlightedBugnotes();
        });
    }
    initializeBugnoteUI() {
        return __awaiter(this, void 0, void 0, function* () {
            const bugnotes = this.bugnoteHelper.getBugnotesTableRows();
            if (!bugnotes || bugnotes.length === 0)
                return;
            requestIdleCallback(() => __awaiter(this, void 0, void 0, function* () {
                for (const bugnote of bugnotes) {
                    yield this.processBugnote(bugnote);
                }
            }));
        });
    }
    processBugnote(bugnote) {
        return __awaiter(this, void 0, void 0, function* () {
            const bugnoteId = bugnote.parentElement.id;
            const divWrapper = this.createDivWrapper();
            const div = this.createBugnoteIconsDiv();
            const saveIcon = this.iconManager.createSaveBugnoteIcon();
            const reactionIcon = this.iconManager.createReactionOnBugnoteIcon();
            if (this.highlightedBugnotes.includes(bugnoteId)) {
                this.makeBugnoteHighlighted(bugnote);
                saveIcon.classList.add(this.iconManager.saveIconClass);
                saveIcon.classList.remove(this.iconManager.savedIconClass);
            }
            div.append(saveIcon, reactionIcon);
            divWrapper.appendChild(div);
            bugnote.appendChild(divWrapper);
            saveIcon.addEventListener('click', () => this.handleSaveIconClick(bugnote));
            const reactedIconContainer = yield this.reactionIconManager.createReactionContainer(bugnoteId);
            bugnote.appendChild(reactedIconContainer);
            this.reactionIconManager.createEmojiPicker(reactionIcon);
        });
    }
    createElement(tag, className) {
        const element = document.createElement(tag);
        element.classList.add(className);
        return element;
    }
    createDivWrapper() {
        return this.createElement("div", "bugnote-wrapper");
    }
    createBugnoteIconsDiv() {
        return this.createElement("div", "bugnote-icons");
    }
    handleSaveIconClick(bugnote) {
        return __awaiter(this, void 0, void 0, function* () {
            const bugnoteId = bugnote.parentElement.id;
            const action = this.getAction(bugnote);
            this.toggleBugnoteHighlight(bugnote, bugnoteId);
            try {
                const response = yield fetch(this.settings.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bugnoteId: bugnoteId, bugId: this.settings.bugId, action }),
                });
                if (!response.ok) {
                    console.error(`Failed ${action} action. Status: ${response.status}. Message: ${yield response.text()}`);
                }
            }
            catch (error) {
                console.error(`Error performing ${action} action.`, error);
            }
        });
    }
    getAction(bugnote) {
        const isHighlighted = bugnote.parentElement.classList.contains(this.highlightedClass);
        return isHighlighted ? this.settings.actions.unhighlight : this.settings.actions.highlight;
    }
    toggleBugnoteHighlight(bugnote, bugnoteId) {
        const isHighlighted = bugnote.parentElement.classList.contains(this.highlightedClass);
        if (isHighlighted) {
            this.highlightedBugnotes = this.highlightedBugnotes.filter(id => id !== bugnoteId);
        }
        else {
            this.highlightedBugnotes.push(bugnoteId);
        }
        this.makeBugnoteHighlighted(bugnote);
    }
    makeBugnoteHighlighted(bugnote) {
        this.bugnoteHelper.makeBugnoteHighlighted(bugnote);
        this.iconManager.toggleSaveBugnoteIcon(bugnote);
    }
    moveSavedBugnotesButton() {
        return __awaiter(this, void 0, void 0, function* () {
            const button = document.querySelector("a[href='#history']");
            const newButton = document.querySelector("#savedBugnotesLinkButton");
            if (button && newButton) {
                const parentElement = button.parentElement;
                if (parentElement) {
                    parentElement.append(button, newButton);
                }
            }
        });
    }
}


/***/ }),

/***/ "./src/service/Tooltip.ts":
/*!********************************!*\
  !*** ./src/service/Tooltip.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Tooltip: () => (/* binding */ Tooltip)
/* harmony export */ });
class Tooltip {
    createTooltip() {
        return this.createElement('div', ['reaction-tooltip']);
    }
    createElement(tag, classList = []) {
        const element = document.createElement(tag);
        element.classList.add(...classList);
        return element;
    }
    attachTooltipModalEvents(button, names) {
        button.addEventListener("mouseover", () => {
            let modal = document.querySelector(".reaction-modal");
            if (!modal) {
                modal = this.createElement('div', ['reaction-modal']);
                document.body.appendChild(modal);
            }
            const rect = button.getBoundingClientRect();
            modal.style.position = "fixed";
            modal.style.top = `${rect.top - modal.offsetHeight}px`;
            modal.style.left = `${rect.left + button.offsetWidth / 2}px`;
            const currentNames = button.dataset.names ? JSON.parse(button.dataset.names) : names;
            modal.textContent = currentNames.join(", ");
        });
        button.addEventListener("mouseout", () => {
            const modal = document.querySelector(".reaction-modal");
            modal === null || modal === void 0 ? void 0 : modal.remove();
        });
        button.dataset.names = JSON.stringify(names);
    }
    addUserToTooltipModal(button, name) {
        const modal = document.querySelector(".reaction-modal");
        if (!modal) {
            return;
        }
        const names = button.dataset.names ? JSON.parse(button.dataset.names) : [];
        names.push(name);
        button.dataset.names = JSON.stringify(names);
        modal.textContent = names.join(", ");
    }
    removeUserFromTooltipModal(button, name) {
        const modal = document.querySelector(".reaction-modal");
        if (!modal) {
            return;
        }
        const names = button.dataset.names ? JSON.parse(button.dataset.names) : [];
        const index = names.indexOf(name);
        if (index === -1) {
            return;
        }
        names.splice(index, 1);
        if (names.length === 0) {
            modal.remove();
            return;
        }
        button.dataset.names = JSON.stringify(names);
        modal.textContent = names.join(", ");
    }
}


/***/ }),

/***/ "./src/utils/BugnotesHelper.ts":
/*!*************************************!*\
  !*** ./src/utils/BugnotesHelper.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BugnotesHelper: () => (/* binding */ BugnotesHelper)
/* harmony export */ });
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/utils */ "./src/utils/utils.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

class BugnotesHelper {
    constructor() {
        this.settings = _utils_utils__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_SETTINGS;
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = yield (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.getSettings)();
            yield this.getHighlightedBugnotes();
        });
    }
    getHighlightedBugnotes() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(this.settings.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: this.settings.actions.get_highlights,
                        bugId: this.settings.bugId,
                    }),
                });
                if (response.ok) {
                    const data = yield response.json();
                    return data;
                }
                else {
                    console.error(`Error fetching issues: ${response.statusText}`);
                }
            }
            catch (e) {
                console.error(e);
            }
            return [];
        });
    }
    getBugnotesTable() {
        const elements = document.querySelectorAll('#bugnotes');
        if (elements.length < 2) {
            return elements[0];
        }
        return elements[1];
    }
    getBugnotesTableRows() {
        const bugnotesTable = this.getBugnotesTable();
        if (!bugnotesTable) {
            return null;
        }
        const tdElements = Array.from(bugnotesTable.querySelectorAll('.category'));
        if (tdElements.length === 0) {
            return null;
        }
        return tdElements;
    }
    makeBugnoteHighlighted(bugnote) {
        bugnote.parentElement.classList.toggle('highlighted');
    }
}


/***/ }),

/***/ "./src/utils/IconManager.ts":
/*!**********************************!*\
  !*** ./src/utils/IconManager.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   IconManager: () => (/* binding */ IconManager)
/* harmony export */ });
class IconManager {
    constructor() {
        this.saveIconClass = 'fa-bookmark';
        this.savedIconClass = 'fa-bookmark-o';
    }
    toggleSaveBugnoteIcon(bugnote) {
        const i = bugnote.querySelector('.bugnote-save-icon');
        if (i) {
            if (i.classList.contains(this.saveIconClass)) {
                i.classList.replace(this.saveIconClass, this.savedIconClass);
            }
            else {
                i.classList.replace(this.savedIconClass, this.saveIconClass);
            }
        }
    }
    createSaveBugnoteIcon() {
        const i = document.createElement("i");
        i.classList.add('bugnote-icon', 'bugnote-save-icon', 'fa', this.savedIconClass);
        return i;
    }
    createReactionOnBugnoteIcon() {
        const i = document.createElement("i");
        i.classList.add('bugnote-icon', 'fa', 'fa-smile-o', 'bugnote-reaction-icon');
        return i;
    }
}


/***/ }),

/***/ "./src/utils/ReactionIconManager.ts":
/*!******************************************!*\
  !*** ./src/utils/ReactionIconManager.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ReactionIconManager: () => (/* binding */ ReactionIconManager)
/* harmony export */ });
/* harmony import */ var _utils_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/utils */ "./src/utils/utils.ts");
/* harmony import */ var picmo__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! picmo */ "./node_modules/picmo/dist/index.js");
/* harmony import */ var _service_Tooltip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../service/Tooltip */ "./src/service/Tooltip.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};



class ReactionIconManager {
    constructor() {
        this.settings = _utils_utils__WEBPACK_IMPORTED_MODULE_0__.DEFAULT_SETTINGS;
        this.emojiPicker = null;
        this.tooltip = new _service_Tooltip__WEBPACK_IMPORTED_MODULE_2__.Tooltip();
        this.initialize();
        this.attachEventListeners();
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.init();
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
        });
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = yield (0,_utils_utils__WEBPACK_IMPORTED_MODULE_0__.getSettings)();
        });
    }
    attachEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        document.addEventListener('click', this.handleClick.bind(this));
    }
    groupAndCountReactionsByBugnoteId(reactions) {
        return reactions.reduce((acc, reaction) => {
            const bugnoteId = 'c' + reaction.bugnote_id;
            const emoji = reaction.emoji || 'unknown';
            const username = reaction.username || 'unknown';
            acc[bugnoteId] = acc[bugnoteId] || {};
            acc[bugnoteId][emoji] = acc[bugnoteId][emoji] || { count: 0, reactions: [], usernames: [] };
            acc[bugnoteId][emoji].count++;
            acc[bugnoteId][emoji].reactions.push(reaction);
            if (!acc[bugnoteId][emoji].usernames.includes(username)) {
                acc[bugnoteId][emoji].usernames.push(username);
            }
            return acc;
        }, {});
    }
    getAllReactions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch(this.settings.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application-json' },
                    body: JSON.stringify({ bugId: this.settings.bugId, action: this.settings.actions.get_reactions })
                });
                if (!response.ok) {
                    const message = `Failed ${this.settings.actions.get_reactions} action. Status: ${response.status}. Message: ${yield response.text()}`;
                    console.error(message);
                    throw new Error(message);
                }
                return yield response.json();
            }
            catch (error) {
                console.error(`Error performing ${this.settings.actions.get_reactions} action.`, error);
                throw error;
            }
        });
    }
    createReactionContainer(bugnoteId) {
        return __awaiter(this, void 0, void 0, function* () {
            const reactions = yield this.getAllReactions();
            const reactionsByBugnote = this.groupAndCountReactionsByBugnoteId(reactions);
            const div = document.createElement("div");
            div.classList.add('bugnote-reaction-icons', 'bugnote-reaction-icons-' + bugnoteId);
            if (!reactionsByBugnote[bugnoteId]) {
                return div;
            }
            for (const [emoji, { count, usernames }] of Object.entries(reactionsByBugnote[bugnoteId])) {
                const reactionButton = this.createReactionButton(emoji, usernames);
                const span = this.createElement('span', ['reaction-count']);
                span.textContent = count.toString();
                reactionButton.textContent = `${emoji}`;
                reactionButton.dataset.bugnoteId = bugnoteId;
                reactionButton.appendChild(span);
                div.appendChild(reactionButton);
            }
            return div;
        });
    }
    createButton(text) {
        const button = this.createElement('button', ['reaction-button']);
        button.dataset.emoji = text;
        button.textContent = text;
        return button;
    }
    createElement(tag, classList = []) {
        const element = document.createElement(tag);
        element.classList.add(...classList);
        return element;
    }
    createReactionButton(reaction, usernames) {
        const button = this.createButton(reaction);
        const tooltip = this.tooltip.createTooltip();
        button.textContent = reaction;
        button.appendChild(tooltip);
        button.addEventListener("click", () => {
            this.handleEmojiClick(reaction, button);
        });
        this.tooltip.attachTooltipModalEvents(button, usernames);
        return button;
    }
    applyStyles(element, styles) {
        Object.assign(element.style, styles);
    }
    ;
    createEmojiPicker(reactionIcon) {
        const handlePickerClose = () => {
            this.closeEmojiPicker();
            this.emojiPicker = null;
        };
        const createOrGetRootElement = () => {
            let rootElement = document.querySelector('#pickerContainer');
            if (!rootElement) {
                rootElement = document.createElement('div');
                rootElement.id = 'pickerContainer';
                document.body.appendChild(rootElement);
            }
            return rootElement;
        };
        const setupPicker = (rootElement, onSelect) => {
            const picker = (0,picmo__WEBPACK_IMPORTED_MODULE_1__.createPicker)({ rootElement });
            picker.addEventListener('emoji:select', onSelect);
            return picker;
        };
        const calculatePosition = (reactionIcon) => {
            const rect = reactionIcon.getBoundingClientRect();
            return {
                top: rect.top + window.scrollY + rect.height,
                left: rect.left + window.scrollX,
            };
        };
        reactionIcon.addEventListener('click', () => {
            if (this.emojiPicker) {
                handlePickerClose();
                return;
            }
            const rootElement = createOrGetRootElement();
            const { top, left } = calculatePosition(reactionIcon);
            setupPicker(rootElement, (event) => {
                this.handleEmojiClick(event.emoji, reactionIcon);
                document.body.removeChild(rootElement);
                this.emojiPicker = null;
            });
            this.applyStyles(rootElement, {
                position: 'absolute',
                zIndex: '999999',
                top: `${top}px`,
                left: `${left}px`,
                display: 'block',
            });
            this.emojiPicker = rootElement;
        });
    }
    handleEmojiClick(emoji, button) {
        return __awaiter(this, void 0, void 0, function* () {
            const bugnoteId = this.getBugnoteId(button);
            const response = yield this.saveReaction(emoji, bugnoteId);
            const reactionIcons = document.querySelector(`.bugnote-reaction-icons-${bugnoteId}`);
            if (!reactionIcons) {
                return;
            }
            const existingButton = reactionIcons.querySelector(`[data-emoji="${emoji}"]`);
            if (!existingButton) {
                const newButton = this.createReactionButton(emoji, [response.username]);
                const span = this.createElement('span', ['reaction-count']);
                span.textContent = '1';
                newButton.appendChild(span);
                reactionIcons.appendChild(newButton);
            }
            else if (response === null || response === void 0 ? void 0 : response.action) {
                this.updateReactionCount(existingButton, response);
            }
        });
    }
    updateReactionCount(button, response) {
        const span = button.querySelector('.reaction-count');
        if (span) {
            const currentCount = parseInt(span.textContent || '0');
            const newCount = this.calculateNewCount(currentCount, response.action);
            if (response.action === 'delete') {
                this.tooltip.removeUserFromTooltipModal(button, response.username);
            }
            else if (response.action === 'save') {
                this.tooltip.addUserToTooltipModal(button, response.username);
            }
            this.updateButtonOrRemove(button, newCount, span);
        }
    }
    calculateNewCount(currentCount, action) {
        return action === 'delete' ? currentCount - 1 : currentCount + 1;
    }
    updateButtonOrRemove(button, newCount, span) {
        if (newCount === 0) {
            button.remove();
        }
        else {
            span.textContent = newCount.toString();
        }
    }
    getBugnoteId(button) {
        const closestTr = button.closest('tr');
        if (!closestTr) {
            throw new Error('Closest <tr> not found');
        }
        const bugnoteId = closestTr.getAttribute('id');
        if (!bugnoteId) {
            throw new Error('Bugnote ID not found');
        }
        return bugnoteId;
    }
    saveReaction(emoji, bugnoteId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield this.sendReactionRequest(emoji, bugnoteId);
                if (!response.ok) {
                    const message = `Failed ${this.settings.actions.reaction} action. Status: ${response.status}. Message: ${yield response.text()}`;
                    console.error(message);
                    throw new Error(message);
                }
                const responseText = yield response.text();
                try {
                    const parsedResponse = JSON.parse(responseText);
                    const action = parsedResponse.action === 'delete' || parsedResponse.action === 'save'
                        ? parsedResponse.action
                        : 'save';
                    return {
                        action: action,
                        username: parsedResponse.username
                    };
                }
                catch (jsonError) {
                    console.error('Failed to parse server response as JSON:', jsonError);
                    throw new Error(`Invalid JSON response: ${responseText}`);
                }
            }
            catch (error) {
                console.error(`Error performing ${this.settings.actions.reaction} action.`, error);
                throw error;
            }
        });
    }
    sendReactionRequest(emoji, bugnoteId) {
        return __awaiter(this, void 0, void 0, function* () {
            return fetch(this.settings.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bugnoteId,
                    bugId: this.settings.bugId,
                    emoji,
                    action: this.settings.actions.reaction,
                }),
            });
        });
    }
    handleKeyPress(event) {
        if (!this.emojiPicker)
            return;
        if (event.key === 'Escape')
            return this.closeEmojiPicker();
    }
    handleClick(event) {
        const target = event.target;
        const reactionIcons = document.querySelectorAll('.bugnote-reaction-icon');
        const isReactionIcon = Array.from(reactionIcons).some(icon => icon === target);
        if (this.emojiPicker && !this.emojiPicker.contains(target) && !isReactionIcon) {
            this.closeEmojiPicker();
        }
    }
    closeEmojiPicker() {
        if (this.emojiPicker) {
            this.emojiPicker.remove();
            this.emojiPicker = null;
        }
    }
}


/***/ }),

/***/ "./src/utils/utils.ts":
/*!****************************!*\
  !*** ./src/utils/utils.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_SETTINGS: () => (/* binding */ DEFAULT_SETTINGS),
/* harmony export */   getSettings: () => (/* binding */ getSettings)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const DEFAULT_SETTINGS = {
    url: "",
    actions: {
        highlight: "",
        unhighlight: "",
        get_highlights: "",
        reaction: "",
        get_reactions: ""
    },
    bugId: ""
};
function getSettings() {
    return __awaiter(this, void 0, void 0, function* () {
        const el = document.querySelector('#imaticNoteHighlighting');
        const data = el.dataset.data;
        if (!data) {
            throw new Error('Missing data attribute on #imaticNoteHighlighting element');
        }
        return JSON.parse(data);
    });
}


/***/ }),

/***/ "./node_modules/emoji-picker-element/database.js":
/*!*******************************************************!*\
  !*** ./node_modules/emoji-picker-element/database.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Database)
/* harmony export */ });
function assertNonEmptyString (str) {
  if (typeof str !== 'string' || !str) {
    throw new Error('expected a non-empty string, got: ' + str)
  }
}

function assertNumber (number) {
  if (typeof number !== 'number') {
    throw new Error('expected a number, got: ' + number)
  }
}

const DB_VERSION_CURRENT = 1;
const DB_VERSION_INITIAL = 1;
const STORE_EMOJI = 'emoji';
const STORE_KEYVALUE = 'keyvalue';
const STORE_FAVORITES = 'favorites';
const FIELD_TOKENS = 'tokens';
const INDEX_TOKENS = 'tokens';
const FIELD_UNICODE = 'unicode';
const INDEX_COUNT = 'count';
const FIELD_GROUP = 'group';
const FIELD_ORDER = 'order';
const INDEX_GROUP_AND_ORDER = 'group-order';
const KEY_ETAG = 'eTag';
const KEY_URL = 'url';
const KEY_PREFERRED_SKINTONE = 'skinTone';
const MODE_READONLY = 'readonly';
const MODE_READWRITE = 'readwrite';
const INDEX_SKIN_UNICODE = 'skinUnicodes';
const FIELD_SKIN_UNICODE = 'skinUnicodes';

const DEFAULT_DATA_SOURCE = 'https://cdn.jsdelivr.net/npm/emoji-picker-element-data@^1/en/emojibase/data.json';
const DEFAULT_LOCALE = 'en';

// like lodash's uniqBy but much smaller
function uniqBy (arr, func) {
  const set = new Set();
  const res = [];
  for (const item of arr) {
    const key = func(item);
    if (!set.has(key)) {
      set.add(key);
      res.push(item);
    }
  }
  return res
}

function uniqEmoji (emojis) {
  return uniqBy(emojis, _ => _.unicode)
}

function initialMigration (db) {
  function createObjectStore (name, keyPath, indexes) {
    const store = keyPath
      ? db.createObjectStore(name, { keyPath })
      : db.createObjectStore(name);
    if (indexes) {
      for (const [indexName, [keyPath, multiEntry]] of Object.entries(indexes)) {
        store.createIndex(indexName, keyPath, { multiEntry });
      }
    }
    return store
  }

  createObjectStore(STORE_KEYVALUE);
  createObjectStore(STORE_EMOJI, /* keyPath */ FIELD_UNICODE, {
    [INDEX_TOKENS]: [FIELD_TOKENS, /* multiEntry */ true],
    [INDEX_GROUP_AND_ORDER]: [[FIELD_GROUP, FIELD_ORDER]],
    [INDEX_SKIN_UNICODE]: [FIELD_SKIN_UNICODE, /* multiEntry */ true]
  });
  createObjectStore(STORE_FAVORITES, undefined, {
    [INDEX_COUNT]: ['']
  });
}

const openIndexedDBRequests = {};
const databaseCache = {};
const onCloseListeners = {};

function handleOpenOrDeleteReq (resolve, reject, req) {
  // These things are almost impossible to test with fakeIndexedDB sadly
  /* istanbul ignore next */
  req.onerror = () => reject(req.error);
  /* istanbul ignore next */
  req.onblocked = () => reject(new Error('IDB blocked'));
  req.onsuccess = () => resolve(req.result);
}

async function createDatabase (dbName) {
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, DB_VERSION_CURRENT);
    openIndexedDBRequests[dbName] = req;
    req.onupgradeneeded = e => {
      // Technically there is only one version, so we don't need this `if` check
      // But if an old version of the JS is in another browser tab
      // and it gets upgraded in the future and we have a new DB version, well...
      // better safe than sorry.
      /* istanbul ignore else */
      if (e.oldVersion < DB_VERSION_INITIAL) {
        initialMigration(req.result);
      }
    };
    handleOpenOrDeleteReq(resolve, reject, req);
  });
  // Handle abnormal closes, e.g. "delete database" in chrome dev tools.
  // No need for removeEventListener, because once the DB can no longer
  // fire "close" events, it will auto-GC.
  // Unfortunately cannot test in fakeIndexedDB: https://github.com/dumbmatter/fakeIndexedDB/issues/50
  /* istanbul ignore next */
  db.onclose = () => closeDatabase(dbName);
  return db
}

function openDatabase (dbName) {
  if (!databaseCache[dbName]) {
    databaseCache[dbName] = createDatabase(dbName);
  }
  return databaseCache[dbName]
}

function dbPromise (db, storeName, readOnlyOrReadWrite, cb) {
  return new Promise((resolve, reject) => {
    // Use relaxed durability because neither the emoji data nor the favorites/preferred skin tone
    // are really irreplaceable data. IndexedDB is just a cache in this case.
    const txn = db.transaction(storeName, readOnlyOrReadWrite, { durability: 'relaxed' });
    const store = typeof storeName === 'string'
      ? txn.objectStore(storeName)
      : storeName.map(name => txn.objectStore(name));
    let res;
    cb(store, txn, (result) => {
      res = result;
    });

    txn.oncomplete = () => resolve(res);
    /* istanbul ignore next */
    txn.onerror = () => reject(txn.error);
  })
}

function closeDatabase (dbName) {
  // close any open requests
  const req = openIndexedDBRequests[dbName];
  const db = req && req.result;
  if (db) {
    db.close();
    const listeners = onCloseListeners[dbName];
    /* istanbul ignore else */
    if (listeners) {
      for (const listener of listeners) {
        listener();
      }
    }
  }
  delete openIndexedDBRequests[dbName];
  delete databaseCache[dbName];
  delete onCloseListeners[dbName];
}

function deleteDatabase (dbName) {
  return new Promise((resolve, reject) => {
    // close any open requests
    closeDatabase(dbName);
    const req = indexedDB.deleteDatabase(dbName);
    handleOpenOrDeleteReq(resolve, reject, req);
  })
}

// The "close" event occurs during an abnormal shutdown, e.g. a user clearing their browser data.
// However, it doesn't occur with the normal "close" event, so we handle that separately.
// https://www.w3.org/TR/IndexedDB/#close-a-database-connection
function addOnCloseListener (dbName, listener) {
  let listeners = onCloseListeners[dbName];
  if (!listeners) {
    listeners = onCloseListeners[dbName] = [];
  }
  listeners.push(listener);
}

// list of emoticons that don't match a simple \W+ regex
// extracted using:
// require('emoji-picker-element-data/en/emojibase/data.json').map(_ => _.emoticon).filter(Boolean).filter(_ => !/^\W+$/.test(_))
const irregularEmoticons = new Set([
  ':D', 'XD', ":'D", 'O:)',
  ':X', ':P', ';P', 'XP',
  ':L', ':Z', ':j', '8D',
  'XO', '8)', ':B', ':O',
  ':S', ":'o", 'Dx', 'X(',
  'D:', ':C', '>0)', ':3',
  '</3', '<3', '\\M/', ':E',
  '8#'
]);

function extractTokens (str) {
  return str
    .split(/[\s_]+/)
    .map(word => {
      if (!word.match(/\w/) || irregularEmoticons.has(word)) {
        // for pure emoticons like :) or :-), just leave them as-is
        return word.toLowerCase()
      }

      return word
        .replace(/[)(:,]/g, '')
        .replace(/’/g, "'")
        .toLowerCase()
    }).filter(Boolean)
}

const MIN_SEARCH_TEXT_LENGTH = 2;

// This is an extra step in addition to extractTokens(). The difference here is that we expect
// the input to have already been run through extractTokens(). This is useful for cases like
// emoticons, where we don't want to do any tokenization (because it makes no sense to split up
// ">:)" by the colon) but we do want to lowercase it to have consistent search results, so that
// the user can type ':P' or ':p' and still get the same result.
function normalizeTokens (str) {
  return str
    .filter(Boolean)
    .map(_ => _.toLowerCase())
    .filter(_ => _.length >= MIN_SEARCH_TEXT_LENGTH)
}

// Transform emoji data for storage in IDB
function transformEmojiData (emojiData) {
  const res = emojiData.map(({ annotation, emoticon, group, order, shortcodes, skins, tags, emoji, version }) => {
    const tokens = [...new Set(
      normalizeTokens([
        ...(shortcodes || []).map(extractTokens).flat(),
        ...(tags || []).map(extractTokens).flat(),
        ...extractTokens(annotation),
        emoticon
      ])
    )].sort();
    const res = {
      annotation,
      group,
      order,
      tags,
      tokens,
      unicode: emoji,
      version
    };
    if (emoticon) {
      res.emoticon = emoticon;
    }
    if (shortcodes) {
      res.shortcodes = shortcodes;
    }
    if (skins) {
      res.skinTones = [];
      res.skinUnicodes = [];
      res.skinVersions = [];
      for (const { tone, emoji, version } of skins) {
        res.skinTones.push(tone);
        res.skinUnicodes.push(emoji);
        res.skinVersions.push(version);
      }
    }
    return res
  });
  return res
}

// helper functions that help compress the code better

function callStore (store, method, key, cb) {
  store[method](key).onsuccess = e => (cb && cb(e.target.result));
}

function getIDB (store, key, cb) {
  callStore(store, 'get', key, cb);
}

function getAllIDB (store, key, cb) {
  callStore(store, 'getAll', key, cb);
}

function commit (txn) {
  /* istanbul ignore else */
  if (txn.commit) {
    txn.commit();
  }
}

// like lodash's minBy
function minBy (array, func) {
  let minItem = array[0];
  for (let i = 1; i < array.length; i++) {
    const item = array[i];
    if (func(minItem) > func(item)) {
      minItem = item;
    }
  }
  return minItem
}

// return an array of results representing all items that are found in each one of the arrays
//

function findCommonMembers (arrays, uniqByFunc) {
  const shortestArray = minBy(arrays, _ => _.length);
  const results = [];
  for (const item of shortestArray) {
    // if this item is included in every array in the intermediate results, add it to the final results
    if (!arrays.some(array => array.findIndex(_ => uniqByFunc(_) === uniqByFunc(item)) === -1)) {
      results.push(item);
    }
  }
  return results
}

async function isEmpty (db) {
  return !(await get(db, STORE_KEYVALUE, KEY_URL))
}

async function hasData (db, url, eTag) {
  const [oldETag, oldUrl] = await Promise.all([KEY_ETAG, KEY_URL]
    .map(key => get(db, STORE_KEYVALUE, key)));
  return (oldETag === eTag && oldUrl === url)
}

async function doFullDatabaseScanForSingleResult (db, predicate) {
  // This batching algorithm is just a perf improvement over a basic
  // cursor. The BATCH_SIZE is an estimate of what would give the best
  // perf for doing a full DB scan (worst case).
  //
  // Mini-benchmark for determining the best batch size:
  //
  // PERF=1 pnpm build:rollup && pnpm test:adhoc
  //
  // (async () => {
  //   performance.mark('start')
  //   await $('emoji-picker').database.getEmojiByShortcode('doesnotexist')
  //   performance.measure('total', 'start')
  //   console.log(performance.getEntriesByName('total').slice(-1)[0].duration)
  // })()
  const BATCH_SIZE = 50; // Typically around 150ms for 6x slowdown in Chrome for above benchmark
  return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, txn, cb) => {
    let lastKey;

    const processNextBatch = () => {
      emojiStore.getAll(lastKey && IDBKeyRange.lowerBound(lastKey, true), BATCH_SIZE).onsuccess = e => {
        const results = e.target.result;
        for (const result of results) {
          lastKey = result.unicode;
          if (predicate(result)) {
            return cb(result)
          }
        }
        if (results.length < BATCH_SIZE) {
          return cb()
        }
        processNextBatch();
      };
    };
    processNextBatch();
  })
}

async function loadData (db, emojiData, url, eTag) {
  try {
    const transformedData = transformEmojiData(emojiData);
    await dbPromise(db, [STORE_EMOJI, STORE_KEYVALUE], MODE_READWRITE, ([emojiStore, metaStore], txn) => {
      let oldETag;
      let oldUrl;
      let todo = 0;

      function checkFetched () {
        if (++todo === 2) { // 2 requests made
          onFetched();
        }
      }

      function onFetched () {
        if (oldETag === eTag && oldUrl === url) {
          // check again within the transaction to guard against concurrency, e.g. multiple browser tabs
          return
        }
        // delete old data
        emojiStore.clear();
        // insert new data
        for (const data of transformedData) {
          emojiStore.put(data);
        }
        metaStore.put(eTag, KEY_ETAG);
        metaStore.put(url, KEY_URL);
        commit(txn);
      }

      getIDB(metaStore, KEY_ETAG, result => {
        oldETag = result;
        checkFetched();
      });

      getIDB(metaStore, KEY_URL, result => {
        oldUrl = result;
        checkFetched();
      });
    });
  } finally {
  }
}

async function getEmojiByGroup (db, group) {
  return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, txn, cb) => {
    const range = IDBKeyRange.bound([group, 0], [group + 1, 0], false, true);
    getAllIDB(emojiStore.index(INDEX_GROUP_AND_ORDER), range, cb);
  })
}

async function getEmojiBySearchQuery (db, query) {
  const tokens = normalizeTokens(extractTokens(query));

  if (!tokens.length) {
    return []
  }

  return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, txn, cb) => {
    // get all results that contain all tokens (i.e. an AND query)
    const intermediateResults = [];

    const checkDone = () => {
      if (intermediateResults.length === tokens.length) {
        onDone();
      }
    };

    const onDone = () => {
      const results = findCommonMembers(intermediateResults, _ => _.unicode);
      cb(results.sort((a, b) => a.order < b.order ? -1 : 1));
    };

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const range = i === tokens.length - 1
        ? IDBKeyRange.bound(token, token + '\uffff', false, true) // treat last token as a prefix search
        : IDBKeyRange.only(token); // treat all other tokens as an exact match
      getAllIDB(emojiStore.index(INDEX_TOKENS), range, result => {
        intermediateResults.push(result);
        checkDone();
      });
    }
  })
}

// This could have been implemented as an IDB index on shortcodes, but it seemed wasteful to do that
// when we can already query by tokens and this will give us what we're looking for 99.9% of the time
async function getEmojiByShortcode (db, shortcode) {
  const emojis = await getEmojiBySearchQuery(db, shortcode);

  // In very rare cases (e.g. the shortcode "v" as in "v for victory"), we cannot search because
  // there are no usable tokens (too short in this case). In that case, we have to do an inefficient
  // full-database scan, which I believe is an acceptable tradeoff for not having to have an extra
  // index on shortcodes.

  if (!emojis.length) {
    const predicate = _ => ((_.shortcodes || []).includes(shortcode.toLowerCase()));
    return (await doFullDatabaseScanForSingleResult(db, predicate)) || null
  }

  return emojis.filter(_ => {
    const lowerShortcodes = (_.shortcodes || []).map(_ => _.toLowerCase());
    return lowerShortcodes.includes(shortcode.toLowerCase())
  })[0] || null
}

async function getEmojiByUnicode (db, unicode) {
  return dbPromise(db, STORE_EMOJI, MODE_READONLY, (emojiStore, txn, cb) => (
    getIDB(emojiStore, unicode, result => {
      if (result) {
        return cb(result)
      }
      getIDB(emojiStore.index(INDEX_SKIN_UNICODE), unicode, result => cb(result || null));
    })
  ))
}

function get (db, storeName, key) {
  return dbPromise(db, storeName, MODE_READONLY, (store, txn, cb) => (
    getIDB(store, key, cb)
  ))
}

function set (db, storeName, key, value) {
  return dbPromise(db, storeName, MODE_READWRITE, (store, txn) => {
    store.put(value, key);
    commit(txn);
  })
}

function incrementFavoriteEmojiCount (db, unicode) {
  return dbPromise(db, STORE_FAVORITES, MODE_READWRITE, (store, txn) => (
    getIDB(store, unicode, result => {
      store.put((result || 0) + 1, unicode);
      commit(txn);
    })
  ))
}

function getTopFavoriteEmoji (db, customEmojiIndex, limit) {
  if (limit === 0) {
    return []
  }
  return dbPromise(db, [STORE_FAVORITES, STORE_EMOJI], MODE_READONLY, ([favoritesStore, emojiStore], txn, cb) => {
    const results = [];
    favoritesStore.index(INDEX_COUNT).openCursor(undefined, 'prev').onsuccess = e => {
      const cursor = e.target.result;
      if (!cursor) { // no more results
        return cb(results)
      }

      function addResult (result) {
        results.push(result);
        if (results.length === limit) {
          return cb(results) // done, reached the limit
        }
        cursor.continue();
      }

      const unicodeOrName = cursor.primaryKey;
      const custom = customEmojiIndex.byName(unicodeOrName);
      if (custom) {
        return addResult(custom)
      }
      // This could be done in parallel (i.e. make the cursor and the get()s parallelized),
      // but my testing suggests it's not actually faster.
      getIDB(emojiStore, unicodeOrName, emoji => {
        if (emoji) {
          return addResult(emoji)
        }
        // emoji not found somehow, ignore (may happen if custom emoji change)
        cursor.continue();
      });
    };
  })
}

// trie data structure for prefix searches
// loosely based on https://github.com/nolanlawson/substring-trie

const CODA_MARKER = ''; // marks the end of the string

function trie (arr, itemToTokens) {
  const map = new Map();
  for (const item of arr) {
    const tokens = itemToTokens(item);
    for (const token of tokens) {
      let currentMap = map;
      for (let i = 0; i < token.length; i++) {
        const char = token.charAt(i);
        let nextMap = currentMap.get(char);
        if (!nextMap) {
          nextMap = new Map();
          currentMap.set(char, nextMap);
        }
        currentMap = nextMap;
      }
      let valuesAtCoda = currentMap.get(CODA_MARKER);
      if (!valuesAtCoda) {
        valuesAtCoda = [];
        currentMap.set(CODA_MARKER, valuesAtCoda);
      }
      valuesAtCoda.push(item);
    }
  }

  const search = (query, exact) => {
    let currentMap = map;
    for (let i = 0; i < query.length; i++) {
      const char = query.charAt(i);
      const nextMap = currentMap.get(char);
      if (nextMap) {
        currentMap = nextMap;
      } else {
        return []
      }
    }

    if (exact) {
      const results = currentMap.get(CODA_MARKER);
      return results || []
    }

    const results = [];
    // traverse
    const queue = [currentMap];
    while (queue.length) {
      const currentMap = queue.shift();
      const entriesSortedByKey = [...currentMap.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1);
      for (const [key, value] of entriesSortedByKey) {
        if (key === CODA_MARKER) { // CODA_MARKER always comes first; it's the empty string
          results.push(...value);
        } else {
          queue.push(value);
        }
      }
    }
    return results
  };

  return search
}

const requiredKeys$1 = [
  'name',
  'url'
];

function assertCustomEmojis (customEmojis) {
  const isArray = customEmojis && Array.isArray(customEmojis);
  const firstItemIsFaulty = isArray &&
    customEmojis.length &&
    (!customEmojis[0] || requiredKeys$1.some(key => !(key in customEmojis[0])));
  if (!isArray || firstItemIsFaulty) {
    throw new Error('Custom emojis are in the wrong format')
  }
}

function customEmojiIndex (customEmojis) {
  assertCustomEmojis(customEmojis);

  const sortByName = (a, b) => a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;

  //
  // all()
  //
  const all = customEmojis.sort(sortByName);

  //
  // search()
  //
  const emojiToTokens = emoji => {
    const set = new Set();
    if (emoji.shortcodes) {
      for (const shortcode of emoji.shortcodes) {
        for (const token of extractTokens(shortcode)) {
          set.add(token);
        }
      }
    }
    return set
  };
  const searchTrie = trie(customEmojis, emojiToTokens);
  const searchByExactMatch = _ => searchTrie(_, true);
  const searchByPrefix = _ => searchTrie(_, false);

  // Search by query for custom emoji. Similar to how we do this in IDB, the last token
  // is treated as a prefix search, but every other one is treated as an exact match.
  // Then we AND the results together
  const search = query => {
    const tokens = extractTokens(query);
    const intermediateResults = tokens.map((token, i) => (
      (i < tokens.length - 1 ? searchByExactMatch : searchByPrefix)(token)
    ));
    return findCommonMembers(intermediateResults, _ => _.name).sort(sortByName)
  };

  //
  // byShortcode, byName
  //
  const shortcodeToEmoji = new Map();
  const nameToEmoji = new Map();
  for (const customEmoji of customEmojis) {
    nameToEmoji.set(customEmoji.name.toLowerCase(), customEmoji);
    for (const shortcode of (customEmoji.shortcodes || [])) {
      shortcodeToEmoji.set(shortcode.toLowerCase(), customEmoji);
    }
  }

  const byShortcode = shortcode => shortcodeToEmoji.get(shortcode.toLowerCase());
  const byName = name => nameToEmoji.get(name.toLowerCase());

  return {
    all,
    search,
    byShortcode,
    byName
  }
}

const isFirefoxContentScript = typeof wrappedJSObject !== 'undefined';

// remove some internal implementation details, i.e. the "tokens" array on the emoji object
// essentially, convert the emoji from the version stored in IDB to the version used in-memory
function cleanEmoji (emoji) {
  if (!emoji) {
    return emoji
  }
  // if inside a Firefox content script, need to clone the emoji object to prevent Firefox from complaining about
  // cross-origin object. See: https://github.com/nolanlawson/emoji-picker-element/issues/356
  /* istanbul ignore if */
  if (isFirefoxContentScript) {
    emoji = structuredClone(emoji);
  }
  delete emoji.tokens;
  if (emoji.skinTones) {
    const len = emoji.skinTones.length;
    emoji.skins = Array(len);
    for (let i = 0; i < len; i++) {
      emoji.skins[i] = {
        tone: emoji.skinTones[i],
        unicode: emoji.skinUnicodes[i],
        version: emoji.skinVersions[i]
      };
    }
    delete emoji.skinTones;
    delete emoji.skinUnicodes;
    delete emoji.skinVersions;
  }
  return emoji
}

function warnETag (eTag) {
  if (!eTag) {
    console.warn('emoji-picker-element is more efficient if the dataSource server exposes an ETag header.');
  }
}

const requiredKeys = [
  'annotation',
  'emoji',
  'group',
  'order',
  'version'
];

function assertEmojiData (emojiData) {
  if (!emojiData ||
    !Array.isArray(emojiData) ||
    !emojiData[0] ||
    (typeof emojiData[0] !== 'object') ||
    requiredKeys.some(key => (!(key in emojiData[0])))) {
    throw new Error('Emoji data is in the wrong format')
  }
}

function assertStatus (response, dataSource) {
  if (Math.floor(response.status / 100) !== 2) {
    throw new Error('Failed to fetch: ' + dataSource + ':  ' + response.status)
  }
}

async function getETag (dataSource) {
  const response = await fetch(dataSource, { method: 'HEAD' });
  assertStatus(response, dataSource);
  const eTag = response.headers.get('etag');
  warnETag(eTag);
  return eTag
}

async function getETagAndData (dataSource) {
  const response = await fetch(dataSource);
  assertStatus(response, dataSource);
  const eTag = response.headers.get('etag');
  warnETag(eTag);
  const emojiData = await response.json();
  assertEmojiData(emojiData);
  return [eTag, emojiData]
}

// TODO: including these in blob-util.ts causes typedoc to generate docs for them,
// even with --excludePrivate ¯\_(ツ)_/¯
/** @private */
/**
 * Convert an `ArrayBuffer` to a binary string.
 *
 * Example:
 *
 * ```js
 * var myString = blobUtil.arrayBufferToBinaryString(arrayBuff)
 * ```
 *
 * @param buffer - array buffer
 * @returns binary string
 */
function arrayBufferToBinaryString(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    var length = bytes.byteLength;
    var i = -1;
    while (++i < length) {
        binary += String.fromCharCode(bytes[i]);
    }
    return binary;
}
/**
 * Convert a binary string to an `ArrayBuffer`.
 *
 * ```js
 * var myBuffer = blobUtil.binaryStringToArrayBuffer(binaryString)
 * ```
 *
 * @param binary - binary string
 * @returns array buffer
 */
function binaryStringToArrayBuffer(binary) {
    var length = binary.length;
    var buf = new ArrayBuffer(length);
    var arr = new Uint8Array(buf);
    var i = -1;
    while (++i < length) {
        arr[i] = binary.charCodeAt(i);
    }
    return buf;
}

// generate a checksum based on the stringified JSON
async function jsonChecksum (object) {
  const inString = JSON.stringify(object);
  let inBuffer = binaryStringToArrayBuffer(inString);

  // this does not need to be cryptographically secure, SHA-1 is fine
  const outBuffer = await crypto.subtle.digest('SHA-1', inBuffer);
  const outBinString = arrayBufferToBinaryString(outBuffer);
  const res = btoa(outBinString);
  return res
}

async function checkForUpdates (db, dataSource) {
  // just do a simple HEAD request first to see if the eTags match
  let emojiData;
  let eTag = await getETag(dataSource);
  if (!eTag) { // work around lack of ETag/Access-Control-Expose-Headers
    const eTagAndData = await getETagAndData(dataSource);
    eTag = eTagAndData[0];
    emojiData = eTagAndData[1];
    if (!eTag) {
      eTag = await jsonChecksum(emojiData);
    }
  }
  if (await hasData(db, dataSource, eTag)) ; else {
    if (!emojiData) {
      const eTagAndData = await getETagAndData(dataSource);
      emojiData = eTagAndData[1];
    }
    await loadData(db, emojiData, dataSource, eTag);
  }
}

async function loadDataForFirstTime (db, dataSource) {
  let [eTag, emojiData] = await getETagAndData(dataSource);
  if (!eTag) {
    // Handle lack of support for ETag or Access-Control-Expose-Headers
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Expose-Headers#Browser_compatibility
    eTag = await jsonChecksum(emojiData);
  }

  await loadData(db, emojiData, dataSource, eTag);
}

class Database {
  constructor ({ dataSource = DEFAULT_DATA_SOURCE, locale = DEFAULT_LOCALE, customEmoji = [] } = {}) {
    this.dataSource = dataSource;
    this.locale = locale;
    this._dbName = `emoji-picker-element-${this.locale}`;
    this._db = undefined;
    this._lazyUpdate = undefined;
    this._custom = customEmojiIndex(customEmoji);

    this._clear = this._clear.bind(this);
    this._ready = this._init();
  }

  async _init () {
    const db = this._db = await openDatabase(this._dbName);

    addOnCloseListener(this._dbName, this._clear);
    const dataSource = this.dataSource;
    const empty = await isEmpty(db);

    if (empty) {
      await loadDataForFirstTime(db, dataSource);
    } else { // offline-first - do an update asynchronously
      this._lazyUpdate = checkForUpdates(db, dataSource);
    }
  }

  async ready () {
    const checkReady = async () => {
      if (!this._ready) {
        this._ready = this._init();
      }
      return this._ready
    };
    await checkReady();
    // There's a possibility of a race condition where the element gets added, removed, and then added again
    // with a particular timing, which would set the _db to undefined.
    // We *could* do a while loop here, but that seems excessive and could lead to an infinite loop.
    if (!this._db) {
      await checkReady();
    }
  }

  async getEmojiByGroup (group) {
    assertNumber(group);
    await this.ready();
    return uniqEmoji(await getEmojiByGroup(this._db, group)).map(cleanEmoji)
  }

  async getEmojiBySearchQuery (query) {
    assertNonEmptyString(query);
    await this.ready();
    const customs = this._custom.search(query);
    const natives = uniqEmoji(await getEmojiBySearchQuery(this._db, query)).map(cleanEmoji);
    return [
      ...customs,
      ...natives
    ]
  }

  async getEmojiByShortcode (shortcode) {
    assertNonEmptyString(shortcode);
    await this.ready();
    const custom = this._custom.byShortcode(shortcode);
    if (custom) {
      return custom
    }
    return cleanEmoji(await getEmojiByShortcode(this._db, shortcode))
  }

  async getEmojiByUnicodeOrName (unicodeOrName) {
    assertNonEmptyString(unicodeOrName);
    await this.ready();
    const custom = this._custom.byName(unicodeOrName);
    if (custom) {
      return custom
    }
    return cleanEmoji(await getEmojiByUnicode(this._db, unicodeOrName))
  }

  async getPreferredSkinTone () {
    await this.ready();
    return (await get(this._db, STORE_KEYVALUE, KEY_PREFERRED_SKINTONE)) || 0
  }

  async setPreferredSkinTone (skinTone) {
    assertNumber(skinTone);
    await this.ready();
    return set(this._db, STORE_KEYVALUE, KEY_PREFERRED_SKINTONE, skinTone)
  }

  async incrementFavoriteEmojiCount (unicodeOrName) {
    assertNonEmptyString(unicodeOrName);
    await this.ready();
    return incrementFavoriteEmojiCount(this._db, unicodeOrName)
  }

  async getTopFavoriteEmoji (limit) {
    assertNumber(limit);
    await this.ready();
    return (await getTopFavoriteEmoji(this._db, this._custom, limit)).map(cleanEmoji)
  }

  set customEmoji (customEmojis) {
    this._custom = customEmojiIndex(customEmojis);
  }

  get customEmoji () {
    return this._custom.all
  }

  async _shutdown () {
    await this.ready(); // reopen if we've already been closed/deleted
    try {
      await this._lazyUpdate; // allow any lazy updates to process before closing/deleting
    } catch (err) { /* ignore network errors (offline-first) */ }
  }

  // clear references to IDB, e.g. during a close event
  _clear () {
    // We don't need to call removeEventListener or remove the manual "close" listeners.
    // The memory leak tests prove this is unnecessary. It's because:
    // 1) IDBDatabases that can no longer fire "close" automatically have listeners GCed
    // 2) we clear the manual close listeners in databaseLifecycle.js.
    this._db = this._ready = this._lazyUpdate = undefined;
  }

  async close () {
    await this._shutdown();
    await closeDatabase(this._dbName);
  }

  async delete () {
    await this._shutdown();
    await deleteDatabase(this._dbName);
  }
}




/***/ }),

/***/ "./node_modules/emoji-picker-element/index.js":
/*!****************************************************!*\
  !*** ./node_modules/emoji-picker-element/index.js ***!
  \****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Database: () => (/* reexport safe */ _database_js__WEBPACK_IMPORTED_MODULE_1__["default"]),
/* harmony export */   Picker: () => (/* reexport safe */ _picker_js__WEBPACK_IMPORTED_MODULE_0__["default"])
/* harmony export */ });
/* harmony import */ var _picker_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./picker.js */ "./node_modules/emoji-picker-element/picker.js");
/* harmony import */ var _database_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./database.js */ "./node_modules/emoji-picker-element/database.js");





/***/ }),

/***/ "./node_modules/emoji-picker-element/picker.js":
/*!*****************************************************!*\
  !*** ./node_modules/emoji-picker-element/picker.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PickerElement)
/* harmony export */ });
/* harmony import */ var _database_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./database.js */ "./node_modules/emoji-picker-element/database.js");


// via https://unpkg.com/browse/emojibase-data@6.0.0/meta/groups.json
const allGroups = [
  [-1, '✨', 'custom'],
  [0, '😀', 'smileys-emotion'],
  [1, '👋', 'people-body'],
  [3, '🐱', 'animals-nature'],
  [4, '🍎', 'food-drink'],
  [5, '🏠️', 'travel-places'],
  [6, '⚽', 'activities'],
  [7, '📝', 'objects'],
  [8, '⛔️', 'symbols'],
  [9, '🏁', 'flags']
].map(([id, emoji, name]) => ({ id, emoji, name }));

const groups = allGroups.slice(1);

const MIN_SEARCH_TEXT_LENGTH = 2;
const NUM_SKIN_TONES = 6;

/* istanbul ignore next */
const rIC = typeof requestIdleCallback === 'function' ? requestIdleCallback : setTimeout;

// check for ZWJ (zero width joiner) character
function hasZwj (emoji) {
  return emoji.unicode.includes('\u200d')
}

// Find one good representative emoji from each version to test by checking its color.
// Ideally it should have color in the center. For some inspiration, see:
// https://about.gitlab.com/blog/2018/05/30/journey-in-native-unicode-emoji/
//
// Note that for certain versions (12.1, 13.1), there is no point in testing them explicitly, because
// all the emoji from this version are compound-emoji from previous versions. So they would pass a color
// test, even in browsers that display them as double emoji. (E.g. "face in clouds" might render as
// "face without mouth" plus "fog".) These emoji can only be filtered using the width test,
// which happens in checkZwjSupport.js.
const versionsAndTestEmoji = {
  '🫨': 15.1, // shaking head, technically from v15 but see note above
  '🫠': 14,
  '🥲': 13.1, // smiling face with tear, technically from v13 but see note above
  '🥻': 12.1, // sari, technically from v12 but see note above
  '🥰': 11,
  '🤩': 5,
  '👱‍♀️': 4,
  '🤣': 3,
  '👁️‍🗨️': 2,
  '😀': 1,
  '😐️': 0.7,
  '😃': 0.6
};

const TIMEOUT_BEFORE_LOADING_MESSAGE = 1000; // 1 second
const DEFAULT_SKIN_TONE_EMOJI = '🖐️';
const DEFAULT_NUM_COLUMNS = 8;

// Based on https://fivethirtyeight.com/features/the-100-most-used-emojis/ and
// https://blog.emojipedia.org/facebook-reveals-most-and-least-used-emojis/ with
// a bit of my own curation. (E.g. avoid the "OK" gesture because of connotations:
// https://emojipedia.org/ok-hand/)
const MOST_COMMONLY_USED_EMOJI = [
  '😊',
  '😒',
  '❤️',
  '👍️',
  '😍',
  '😂',
  '😭',
  '☺️',
  '😔',
  '😩',
  '😏',
  '💕',
  '🙌',
  '😘'
];

// It's important to list Twemoji Mozilla before everything else, because Mozilla bundles their
// own font on some platforms (notably Windows and Linux as of this writing). Typically, Mozilla
// updates faster than the underlying OS, and we don't want to render older emoji in one font and
// newer emoji in another font:
// https://github.com/nolanlawson/emoji-picker-element/pull/268#issuecomment-1073347283
const FONT_FAMILY = '"Twemoji Mozilla","Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol",' +
  '"Noto Color Emoji","EmojiOne Color","Android Emoji",sans-serif';

/* istanbul ignore next */
const DEFAULT_CATEGORY_SORTING = (a, b) => a < b ? -1 : a > b ? 1 : 0;

// Test if an emoji is supported by rendering it to canvas and checking that the color is not black
// See https://about.gitlab.com/blog/2018/05/30/journey-in-native-unicode-emoji/
// and https://www.npmjs.com/package/if-emoji for inspiration
// This implementation is largely borrowed from if-emoji, adding the font-family


const getTextFeature = (text, color) => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;

  const ctx = canvas.getContext('2d', {
    // Improves the performance of `getImageData()`
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getContextAttributes#willreadfrequently
    willReadFrequently: true
  });
  ctx.textBaseline = 'top';
  ctx.font = `100px ${FONT_FAMILY}`;
  ctx.fillStyle = color;
  ctx.scale(0.01, 0.01);
  ctx.fillText(text, 0, 0);

  return ctx.getImageData(0, 0, 1, 1).data
};

const compareFeatures = (feature1, feature2) => {
  const feature1Str = [...feature1].join(',');
  const feature2Str = [...feature2].join(',');
  // This is RGBA, so for 0,0,0, we are checking that the first RGB is not all zeroes.
  // Most of the time when unsupported this is 0,0,0,0, but on Chrome on Mac it is
  // 0,0,0,61 - there is a transparency here.
  return feature1Str === feature2Str && !feature1Str.startsWith('0,0,0,')
};

function testColorEmojiSupported (text) {
  // Render white and black and then compare them to each other and ensure they're the same
  // color, and neither one is black. This shows that the emoji was rendered in color.
  const feature1 = getTextFeature(text, '#000');
  const feature2 = getTextFeature(text, '#fff');
  return feature1 && feature2 && compareFeatures(feature1, feature2)
}

// rather than check every emoji ever, which would be expensive, just check some representatives from the
// different emoji releases to determine what the font supports

function determineEmojiSupportLevel () {
  const entries = Object.entries(versionsAndTestEmoji);
  try {
    // start with latest emoji and work backwards
    for (const [emoji, version] of entries) {
      if (testColorEmojiSupported(emoji)) {
        return version
      }
    }
  } catch (e) { // canvas error
  } finally {
  }
  // In case of an error, be generous and just assume all emoji are supported (e.g. for canvas errors
  // due to anti-fingerprinting add-ons). Better to show some gray boxes than nothing at all.
  return entries[0][1] // first one in the list is the most recent version
}

// Check which emojis we know for sure aren't supported, based on Unicode version level
let promise;
const detectEmojiSupportLevel = () => {
  if (!promise) {
    // Delay so it can run while the IDB database is being created by the browser (on another thread).
    // This helps especially with first load – we want to start pre-populating the database on the main thread,
    // and then wait for IDB to commit everything, and while waiting we run this check.
    promise = new Promise(resolve => (
      rIC(() => (
        resolve(determineEmojiSupportLevel()) // delay so ideally this can run while IDB is first populating
      ))
    ));
  }
  return promise
};
// determine which emojis containing ZWJ (zero width joiner) characters
// are supported (rendered as one glyph) rather than unsupported (rendered as two or more glyphs)
const supportedZwjEmojis = new Map();

const VARIATION_SELECTOR = '\ufe0f';
const SKINTONE_MODIFIER = '\ud83c';
const ZWJ = '\u200d';
const LIGHT_SKIN_TONE = 0x1F3FB;
const LIGHT_SKIN_TONE_MODIFIER = 0xdffb;

// TODO: this is a naive implementation, we can improve it later
// It's only used for the skintone picker, so as long as people don't customize with
// really exotic emoji then it should work fine
function applySkinTone (str, skinTone) {
  if (skinTone === 0) {
    return str
  }
  const zwjIndex = str.indexOf(ZWJ);
  if (zwjIndex !== -1) {
    return str.substring(0, zwjIndex) +
      String.fromCodePoint(LIGHT_SKIN_TONE + skinTone - 1) +
      str.substring(zwjIndex)
  }
  if (str.endsWith(VARIATION_SELECTOR)) {
    str = str.substring(0, str.length - 1);
  }
  return str + SKINTONE_MODIFIER + String.fromCodePoint(LIGHT_SKIN_TONE_MODIFIER + skinTone - 1)
}

function halt (event) {
  event.preventDefault();
  event.stopPropagation();
}

// Implementation left/right or up/down navigation, circling back when you
// reach the start/end of the list
function incrementOrDecrement (decrement, val, arr) {
  val += (decrement ? -1 : 1);
  if (val < 0) {
    val = arr.length - 1;
  } else if (val >= arr.length) {
    val = 0;
  }
  return val
}

// like lodash's uniqBy but much smaller
function uniqBy (arr, func) {
  const set = new Set();
  const res = [];
  for (const item of arr) {
    const key = func(item);
    if (!set.has(key)) {
      set.add(key);
      res.push(item);
    }
  }
  return res
}

// We don't need all the data on every emoji, and there are specific things we need
// for the UI, so build a "view model" from the emoji object we got from the database

function summarizeEmojisForUI (emojis, emojiSupportLevel) {
  const toSimpleSkinsMap = skins => {
    const res = {};
    for (const skin of skins) {
      // ignore arrays like [1, 2] with multiple skin tones
      // also ignore variants that are in an unsupported emoji version
      // (these do exist - variants from a different version than their base emoji)
      if (typeof skin.tone === 'number' && skin.version <= emojiSupportLevel) {
        res[skin.tone] = skin.unicode;
      }
    }
    return res
  };

  return emojis.map(({ unicode, skins, shortcodes, url, name, category, annotation }) => ({
    unicode,
    name,
    shortcodes,
    url,
    category,
    annotation,
    id: unicode || name,
    skins: skins && toSimpleSkinsMap(skins)
  }))
}

// import rAF from one place so that the bundle size is a bit smaller
const rAF = requestAnimationFrame;

// "Svelte action"-like utility to detect layout changes via ResizeObserver.
// If ResizeObserver is unsupported, we just use rAF once and don't bother to update.


let resizeObserverSupported = typeof ResizeObserver === 'function';

function resizeObserverAction (node, abortSignal, onUpdate) {
  let resizeObserver;
  if (resizeObserverSupported) {
    resizeObserver = new ResizeObserver(onUpdate);
    resizeObserver.observe(node);
  } else { // just run once, don't bother trying to track it
    rAF(onUpdate);
  }

  // cleanup function (called on destroy)
  abortSignal.addEventListener('abort', () => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });
}

// get the width of the text inside of a DOM node, via https://stackoverflow.com/a/59525891/680742
function calculateTextWidth (node) {
  // skip running this in jest/vitest because we don't need to check for emoji support in that environment
  /* istanbul ignore else */
  {
    const range = document.createRange();
    range.selectNode(node.firstChild);
    return range.getBoundingClientRect().width
  }
}

let baselineEmojiWidth;

/**
 * Check if the given emojis containing ZWJ characters are supported by the current browser (don't render
 * as double characters) and return true if all are supported.
 * @param zwjEmojisToCheck
 * @param baselineEmoji
 * @param emojiToDomNode
 */
function checkZwjSupport (zwjEmojisToCheck, baselineEmoji, emojiToDomNode) {
  let allSupported = true;
  for (const emoji of zwjEmojisToCheck) {
    const domNode = emojiToDomNode(emoji);
    const emojiWidth = calculateTextWidth(domNode);
    if (typeof baselineEmojiWidth === 'undefined') { // calculate the baseline emoji width only once
      baselineEmojiWidth = calculateTextWidth(baselineEmoji);
    }
    // On Windows, some supported emoji are ~50% bigger than the baseline emoji, but what we really want to guard
    // against are the ones that are 2x the size, because those are truly broken (person with red hair = person with
    // floating red wig, black cat = cat with black square, polar bear = bear with snowflake, etc.)
    // So here we set the threshold at 1.8 times the size of the baseline emoji.
    const supported = emojiWidth / 1.8 < baselineEmojiWidth;
    supportedZwjEmojis.set(emoji.unicode, supported);

    if (!supported) {
      allSupported = false;
    }
  }
  return allSupported
}

// like lodash's uniq

function uniq (arr) {
  return uniqBy(arr, _ => _)
}

// Note we put this in its own function outside Picker.js to avoid Svelte doing an invalidation on the "setter" here.
// At best the invalidation is useless, at worst it can cause infinite loops:
// https://github.com/nolanlawson/emoji-picker-element/pull/180
// https://github.com/sveltejs/svelte/issues/6521
// Also note tabpanelElement can be null if the element is disconnected immediately after connected
function resetScrollTopIfPossible (element) {
  /* istanbul ignore else */
  if (element) { // Makes me nervous not to have this `if` guard
    element.scrollTop = 0;
  }
}

function getFromMap (cache, key, func) {
  let cached = cache.get(key);
  if (!cached) {
    cached = func();
    cache.set(key, cached);
  }
  return cached
}

function toString (value) {
  return '' + value
}

function parseTemplate (htmlString) {
  const template = document.createElement('template');
  template.innerHTML = htmlString;
  return template
}

const parseCache = new WeakMap();
const domInstancesCache = new WeakMap();
// This needs to be a symbol because it needs to be different from any possible output of a key function
const unkeyedSymbol = Symbol('un-keyed');

// Not supported in Safari <=13
const hasReplaceChildren = 'replaceChildren' in Element.prototype;
function replaceChildren (parentNode, newChildren) {
  /* istanbul ignore else */
  if (hasReplaceChildren) {
    parentNode.replaceChildren(...newChildren);
  } else { // minimal polyfill for Element.prototype.replaceChildren
    parentNode.innerHTML = '';
    parentNode.append(...newChildren);
  }
}

function doChildrenNeedRerender (parentNode, newChildren) {
  let oldChild = parentNode.firstChild;
  let oldChildrenCount = 0;
  // iterate using firstChild/nextSibling because browsers use a linked list under the hood
  while (oldChild) {
    const newChild = newChildren[oldChildrenCount];
    // check if the old child and new child are the same
    if (newChild !== oldChild) {
      return true
    }
    oldChild = oldChild.nextSibling;
    oldChildrenCount++;
  }
  // if new children length is different from old, we must re-render
  return oldChildrenCount !== newChildren.length
}

function patchChildren (newChildren, instanceBinding) {
  const { targetNode } = instanceBinding;
  let { targetParentNode } = instanceBinding;

  let needsRerender = false;

  if (targetParentNode) { // already rendered once
    needsRerender = doChildrenNeedRerender(targetParentNode, newChildren);
  } else { // first render of list
    needsRerender = true;
    instanceBinding.targetNode = undefined; // placeholder node not needed anymore, free memory
    instanceBinding.targetParentNode = targetParentNode = targetNode.parentNode;
  }
  // avoid re-rendering list if the dom nodes are exactly the same before and after
  if (needsRerender) {
    replaceChildren(targetParentNode, newChildren);
  }
}

function patch (expressions, instanceBindings) {
  for (const instanceBinding of instanceBindings) {
    const {
      targetNode,
      currentExpression,
      binding: {
        expressionIndex,
        attributeName,
        attributeValuePre,
        attributeValuePost
      }
    } = instanceBinding;

    const expression = expressions[expressionIndex];

    if (currentExpression === expression) {
      // no need to update, same as before
      continue
    }

    instanceBinding.currentExpression = expression;

    if (attributeName) { // attribute replacement
      targetNode.setAttribute(attributeName, attributeValuePre + toString(expression) + attributeValuePost);
    } else { // text node / child element / children replacement
      let newNode;
      if (Array.isArray(expression)) { // array of DOM elements produced by tag template literals
        patchChildren(expression, instanceBinding);
      } else if (expression instanceof Element) { // html tag template returning a DOM element
        newNode = expression;
        targetNode.replaceWith(newNode);
      } else { // primitive - string, number, etc
        // nodeValue is faster than textContent supposedly https://www.youtube.com/watch?v=LY6y3HbDVmg
        // note we may be replacing the value in a placeholder text node
        targetNode.nodeValue = toString(expression);
      }
      if (newNode) {
        instanceBinding.targetNode = newNode;
      }
    }
  }
}

function parse (tokens) {
  let htmlString = '';

  let withinTag = false;
  let withinAttribute = false;
  let elementIndexCounter = -1; // depth-first traversal order

  const elementsToBindings = new Map();
  const elementIndexes = [];

  for (let i = 0, len = tokens.length; i < len; i++) {
    const token = tokens[i];
    htmlString += token;

    if (i === len - 1) {
      break // no need to process characters - no more expressions to be found
    }

    for (let j = 0; j < token.length; j++) {
      const char = token.charAt(j);
      switch (char) {
        case '<': {
          const nextChar = token.charAt(j + 1);
          if (nextChar === '/') { // closing tag
            // leaving an element
            elementIndexes.pop();
          } else { // not a closing tag
            withinTag = true;
            elementIndexes.push(++elementIndexCounter);
          }
          break
        }
        case '>': {
          withinTag = false;
          withinAttribute = false;
          break
        }
        case '=': {
          withinAttribute = true;
          break
        }
      }
    }

    const elementIndex = elementIndexes[elementIndexes.length - 1];
    const bindings = getFromMap(elementsToBindings, elementIndex, () => []);

    let attributeName;
    let attributeValuePre;
    let attributeValuePost;
    if (withinAttribute) {
      // I never use single-quotes for attribute values in HTML, so just support double-quotes or no-quotes
      const match = /(\S+)="?([^"=]*)$/.exec(token);
      attributeName = match[1];
      attributeValuePre = match[2];
      attributeValuePost = /^[^">]*/.exec(tokens[i + 1])[0];
    }

    const binding = {
      attributeName,
      attributeValuePre,
      attributeValuePost,
      expressionIndex: i
    };

    bindings.push(binding);

    if (!withinTag && !withinAttribute) {
      // Add a placeholder text node, so we can find it later. Note we only support one dynamic child text node
      htmlString += ' ';
    }
  }

  const template = parseTemplate(htmlString);

  return {
    template,
    elementsToBindings
  }
}

function applyBindings (bindings, element, instanceBindings) {
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];

    const targetNode = binding.attributeName
      ? element // attribute binding, just use the element itself
      : element.firstChild; // not an attribute binding, so has a placeholder text node

    const instanceBinding = {
      binding,
      targetNode,
      targetParentNode: undefined,
      currentExpression: undefined
    };

    instanceBindings.push(instanceBinding);
  }
}

function traverseAndSetupBindings (rootElement, elementsToBindings) {
  const instanceBindings = [];

  let topLevelBindings;
  if (elementsToBindings.size === 1 && (topLevelBindings = elementsToBindings.get(0))) {
    // Optimization for the common case where there's only one element and one binding
    // Skip creating a TreeWalker entirely and just handle the root DOM element
    applyBindings(topLevelBindings, rootElement, instanceBindings);
  } else {
    // traverse dom
    const treeWalker = document.createTreeWalker(rootElement, NodeFilter.SHOW_ELEMENT);

    let element = rootElement;
    let elementIndex = -1;
    do {
      const bindings = elementsToBindings.get(++elementIndex);
      if (bindings) {
        applyBindings(bindings, element, instanceBindings);
      }
    } while ((element = treeWalker.nextNode()))
  }

  return instanceBindings
}

function parseHtml (tokens) {
  // All templates and bound expressions are unique per tokens array
  const { template, elementsToBindings } = getFromMap(parseCache, tokens, () => parse(tokens));

  // When we parseHtml, we always return a fresh DOM instance ready to be updated
  const dom = template.cloneNode(true).content.firstElementChild;
  const instanceBindings = traverseAndSetupBindings(dom, elementsToBindings);

  return function updateDomInstance (expressions) {
    patch(expressions, instanceBindings);
    return dom
  }
}

function createFramework (state) {
  const domInstances = getFromMap(domInstancesCache, state, () => new Map());
  let domInstanceCacheKey = unkeyedSymbol;

  function html (tokens, ...expressions) {
    // Each unique lexical usage of map() is considered unique due to the html`` tagged template call it makes,
    // which has lexically unique tokens. The unkeyed symbol is just used for html`` usage outside of a map().
    const domInstancesForTokens = getFromMap(domInstances, tokens, () => new Map());
    const updateDomInstance = getFromMap(domInstancesForTokens, domInstanceCacheKey, () => parseHtml(tokens));

    return updateDomInstance(expressions) // update with expressions
  }

  function map (array, callback, keyFunction) {
    return array.map((item, index) => {
      const originalCacheKey = domInstanceCacheKey;
      domInstanceCacheKey = keyFunction(item);
      try {
        return callback(item, index)
      } finally {
        domInstanceCacheKey = originalCacheKey;
      }
    })
  }

  return { map, html }
}

function render (container, state, helpers, events, actions, refs, abortSignal, actionContext, firstRender) {
  const { labelWithSkin, titleForEmoji, unicodeWithSkin } = helpers;
  const { html, map } = createFramework(state);

  function emojiList (emojis, searchMode, prefix) {
    return map(emojis, (emoji, i) => {
      return html`<button role="${searchMode ? 'option' : 'menuitem'}" aria-selected="${searchMode ? i === state.activeSearchItem : ''}" aria-label="${labelWithSkin(emoji, state.currentSkinTone)}" title="${titleForEmoji(emoji)}" class="${
                'emoji' +
                (searchMode && i === state.activeSearchItem ? ' active' : '') +
                (emoji.unicode ? '' : ' custom-emoji')
              }" id="${`${prefix}-${emoji.id}`}" style="${emoji.unicode ? '' : `--custom-emoji-background: url(${JSON.stringify(emoji.url)})`}">${
        emoji.unicode
          ? unicodeWithSkin(emoji, state.currentSkinTone)
          : ''
      }</button>`
      // It's important for the cache key to be unique based on the prefix, because the framework caches based on the
      // unique tokens + cache key, and the same emoji may be used in the tab as well as in the fav bar
    }, emoji => `${prefix}-${emoji.id}`)
  }

  const section = () => {
    return html`<section data-ref="rootElement" class="picker" aria-label="${state.i18n.regionLabel}" style="${state.pickerStyle || ''}"><div class="pad-top"></div><div class="search-row"><div class="search-wrapper"><input id="search" class="search" type="search" role="combobox" enterkeyhint="search" placeholder="${state.i18n.searchLabel}" autocapitalize="none" autocomplete="off" spellcheck="true" aria-expanded="${!!(state.searchMode && state.currentEmojis.length)}" aria-controls="search-results" aria-describedby="search-description" aria-autocomplete="list" aria-activedescendant="${state.activeSearchItemId ? `emo-${state.activeSearchItemId}` : ''}" data-ref="searchElement" data-on-input="onSearchInput" data-on-keydown="onSearchKeydown"><label class="sr-only" for="search">${state.i18n.searchLabel}</label> <span id="search-description" class="sr-only">${state.i18n.searchDescription}</span></div><div class="skintone-button-wrapper ${state.skinTonePickerExpandedAfterAnimation ? 'expanded' : ''}"><button id="skintone-button" class="emoji ${state.skinTonePickerExpanded ? 'hide-focus' : ''}" aria-label="${state.skinToneButtonLabel}" title="${state.skinToneButtonLabel}" aria-describedby="skintone-description" aria-haspopup="listbox" aria-expanded="${state.skinTonePickerExpanded}" aria-controls="skintone-list" data-on-click="onClickSkinToneButton">${state.skinToneButtonText || ''}</button></div><span id="skintone-description" class="sr-only">${state.i18n.skinToneDescription}</span><div data-ref="skinToneDropdown" id="skintone-list" class="skintone-list hide-focus ${state.skinTonePickerExpanded ? '' : 'hidden no-animate'}" style="transform:translateY(${state.skinTonePickerExpanded ? 0 : 'calc(-1 * var(--num-skintones) * var(--total-emoji-size))'})" role="listbox" aria-label="${state.i18n.skinTonesLabel}" aria-activedescendant="skintone-${state.activeSkinTone}" aria-hidden="${!state.skinTonePickerExpanded}" tabIndex="-1" data-on-focusout="onSkinToneOptionsFocusOut" data-on-click="onSkinToneOptionsClick" data-on-keydown="onSkinToneOptionsKeydown" data-on-keyup="onSkinToneOptionsKeyup">${
    map(state.skinTones, (skinTone, i) => {
    return html`<div id="skintone-${i}" class="emoji ${i === state.activeSkinTone ? 'active' : ''}" aria-selected="${i === state.activeSkinTone}" role="option" title="${state.i18n.skinTones[i]}" aria-label="${state.i18n.skinTones[i]}">${skinTone}</div>`
    }, skinTone => skinTone)
        }</div></div><div class="nav" role="tablist" style="grid-template-columns:repeat(${state.groups.length},1fr)" aria-label="${state.i18n.categoriesLabel}" data-on-keydown="onNavKeydown" data-on-click="onNavClick">${
            map(state.groups, (group) => {
              return html`<button role="tab" class="nav-button" aria-controls="tab-${group.id}" aria-label="${state.i18n.categories[group.name]}" aria-selected="${!state.searchMode && state.currentGroup.id === group.id}" title="${state.i18n.categories[group.name]}" data-group-id="${group.id}"><div class="nav-emoji emoji">${group.emoji}</div></button>`
            }, group => group.id)
          }</div><div class="indicator-wrapper"><div class="indicator" style="transform:translateX(${(/* istanbul ignore next */ (state.isRtl ? -1 : 1)) * state.currentGroupIndex * 100}%)"></div></div><div class="message ${state.message ? '' : 'gone'}" role="alert" aria-live="polite">${state.message || ''}</div><div data-ref="tabpanelElement" class="tabpanel ${(!state.databaseLoaded || state.message) ? 'gone' : ''}" role="${state.searchMode ? 'region' : 'tabpanel'}" aria-label="${state.searchMode ? state.i18n.searchResultsLabel : state.i18n.categories[state.currentGroup.name]}" id="${state.searchMode ? '' : `tab-${state.currentGroup.id}`}" tabIndex="0" data-on-click="onEmojiClick"><div data-action="calculateEmojiGridStyle">${
              map(state.currentEmojisWithCategories, (emojiWithCategory, i) => {
                return html`<div><div id="menu-label-${i}" class="category ${state.currentEmojisWithCategories.length === 1 && state.currentEmojisWithCategories[0].category === '' ? 'gone' : ''}" aria-hidden="true">${
                  state.searchMode
                    ? state.i18n.searchResultsLabel
                    : (
                      emojiWithCategory.category
                        ? emojiWithCategory.category
                        : (
                          state.currentEmojisWithCategories.length > 1
                            ? state.i18n.categories.custom
                            : state.i18n.categories[state.currentGroup.name]
                        )
                    )
                }</div><div class="emoji-menu ${i !== 0 && !state.searchMode && state.currentGroup.id === -1 ? 'visibility-auto' : ''}" style="${`--num-rows: ${Math.ceil(emojiWithCategory.emojis.length / state.numColumns)}`}" data-action="updateOnIntersection" role="${state.searchMode ? 'listbox' : 'menu'}" aria-labelledby="menu-label-${i}" id="${state.searchMode ? 'search-results' : ''}">${
              emojiList(emojiWithCategory.emojis, state.searchMode, /* prefix */ 'emo')
            }</div></div>`
              }, emojiWithCategory => emojiWithCategory.category)
            }</div></div><div class="favorites onscreen emoji-menu ${state.message ? 'gone' : ''}" role="menu" aria-label="${state.i18n.favoritesLabel}" data-on-click="onEmojiClick">${
            emojiList(state.currentFavorites, /* searchMode */ false, /* prefix */ 'fav')
          }</div><button data-ref="baselineEmoji" aria-hidden="true" tabindex="-1" class="abs-pos hidden emoji baseline-emoji">😀</button></section>`
  };

  const rootDom = section();

  // helper for traversing the dom, finding elements by an attribute, and getting the attribute value
  const forElementWithAttribute = (attributeName, callback) => {
    for (const element of container.querySelectorAll(`[${attributeName}]`)) {
      callback(element, element.getAttribute(attributeName));
    }
  };

  if (firstRender) { // not a re-render
    container.appendChild(rootDom);

    // we only bind events/refs once - there is no need to find them again given this component structure

    // bind events
    for (const eventName of ['click', 'focusout', 'input', 'keydown', 'keyup']) {
      forElementWithAttribute(`data-on-${eventName}`, (element, listenerName) => {
        element.addEventListener(eventName, events[listenerName]);
      });
    }

    // find refs
    forElementWithAttribute('data-ref', (element, ref) => {
      refs[ref] = element;
    });

    // destroy/abort logic
    abortSignal.addEventListener('abort', () => {
      container.removeChild(rootDom);
    });
  }

  // set up actions - these are re-bound on every render
  forElementWithAttribute('data-action', (element, action) => {
    let boundActions = actionContext.get(action);
    if (!boundActions) {
      actionContext.set(action, (boundActions = new WeakSet()));
    }

    // avoid applying the same action to the same element multiple times
    if (!boundActions.has(element)) {
      boundActions.add(element);
      actions[action](element);
    }
  });
}

/* istanbul ignore next */
const qM = typeof queueMicrotask === 'function' ? queueMicrotask : callback => Promise.resolve().then(callback);

function createState (abortSignal) {
  let destroyed = false;
  let currentObserver;

  const propsToObservers = new Map();
  const dirtyObservers = new Set();

  let queued;

  const flush = () => {
    if (destroyed) {
      return
    }
    const observersToRun = [...dirtyObservers];
    dirtyObservers.clear(); // clear before running to force any new updates to run in another tick of the loop
    try {
      for (const observer of observersToRun) {
        observer();
      }
    } finally {
      queued = false;
      if (dirtyObservers.size) { // new updates, queue another one
        queued = true;
        qM(flush);
      }
    }
  };

  const state = new Proxy({}, {
    get (target, prop) {
      if (currentObserver) {
        let observers = propsToObservers.get(prop);
        if (!observers) {
          observers = new Set();
          propsToObservers.set(prop, observers);
        }
        observers.add(currentObserver);
      }
      return target[prop]
    },
    set (target, prop, newValue) {
      if (target[prop] !== newValue) {
        target[prop] = newValue;
        const observers = propsToObservers.get(prop);
        if (observers) {
          for (const observer of observers) {
            dirtyObservers.add(observer);
          }
          if (!queued) {
            queued = true;
            qM(flush);
          }
        }
      }
      return true
    }
  });

  const createEffect = (callback) => {
    const runnable = () => {
      const oldObserver = currentObserver;
      currentObserver = runnable;
      try {
        return callback()
      } finally {
        currentObserver = oldObserver;
      }
    };
    return runnable()
  };

  // destroy logic
  abortSignal.addEventListener('abort', () => {
    destroyed = true;
  });

  return {
    state,
    createEffect
  }
}

// Compare two arrays, with a function called on each item in the two arrays that returns true if the items are equal
function arraysAreEqualByFunction (left, right, areEqualFunc) {
  if (left.length !== right.length) {
    return false
  }
  for (let i = 0; i < left.length; i++) {
    if (!areEqualFunc(left[i], right[i])) {
      return false
    }
  }
  return true
}

const intersectionObserverCache = new WeakMap();

function intersectionObserverAction (node, abortSignal, listener) {
  /* istanbul ignore else */
  {
    // The scroll root is always `.tabpanel`
    const root = node.closest('.tabpanel');

    let observer = intersectionObserverCache.get(root);
    if (!observer) {
      // TODO: replace this with the contentvisibilityautostatechange event when all supported browsers support it.
      // For now we use IntersectionObserver because it has better cross-browser support, and it would be bad for
      // old Safari versions if they eagerly downloaded all custom emoji all at once.
      observer = new IntersectionObserver(listener, {
        root,
        // trigger if we are 1/2 scroll container height away so that the images load a bit quicker while scrolling
        rootMargin: '50% 0px 50% 0px',
        // trigger if any part of the emoji grid is intersecting
        threshold: 0
      });

      // avoid creating a new IntersectionObserver for every category; just use one for the whole root
      intersectionObserverCache.set(root, observer);

      // assume that the abortSignal is always the same for this root node; just add one event listener
      abortSignal.addEventListener('abort', () => {
        observer.disconnect();
      });
    }

    observer.observe(node);
  }
}

/* eslint-disable prefer-const,no-labels,no-inner-declarations */

// constants
const EMPTY_ARRAY = [];

const { assign } = Object;

function createRoot (shadowRoot, props) {
  const refs = {};
  const abortController = new AbortController();
  const abortSignal = abortController.signal;
  const { state, createEffect } = createState(abortSignal);
  const actionContext = new Map();

  // initial state
  assign(state, {
    skinToneEmoji: undefined,
    i18n: undefined,
    database: undefined,
    customEmoji: undefined,
    customCategorySorting: undefined,
    emojiVersion: undefined
  });

  // public props
  assign(state, props);

  // private props
  assign(state, {
    initialLoad: true,
    currentEmojis: [],
    currentEmojisWithCategories: [],
    rawSearchText: '',
    searchText: '',
    searchMode: false,
    activeSearchItem: -1,
    message: undefined,
    skinTonePickerExpanded: false,
    skinTonePickerExpandedAfterAnimation: false,
    currentSkinTone: 0,
    activeSkinTone: 0,
    skinToneButtonText: undefined,
    pickerStyle: undefined,
    skinToneButtonLabel: '',
    skinTones: [],
    currentFavorites: [],
    defaultFavoriteEmojis: undefined,
    numColumns: DEFAULT_NUM_COLUMNS,
    isRtl: false,
    currentGroupIndex: 0,
    groups: groups,
    databaseLoaded: false,
    activeSearchItemId: undefined
  });

  //
  // Update the current group based on the currentGroupIndex
  //
  createEffect(() => {
    if (state.currentGroup !== state.groups[state.currentGroupIndex]) {
      state.currentGroup = state.groups[state.currentGroupIndex];
    }
  });

  //
  // Utils/helpers
  //

  const focus = id => {
    shadowRoot.getElementById(id).focus();
  };

  const emojiToDomNode = emoji => shadowRoot.getElementById(`emo-${emoji.id}`);

  // fire a custom event that crosses the shadow boundary
  const fireEvent = (name, detail) => {
    refs.rootElement.dispatchEvent(new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true
    }));
  };

  //
  // Comparison utils
  //

  const compareEmojiArrays = (a, b) => a.id === b.id;

  const compareCurrentEmojisWithCategories = (a, b) => {
    const { category: aCategory, emojis: aEmojis } = a;
    const { category: bCategory, emojis: bEmojis } = b;

    if (aCategory !== bCategory) {
      return false
    }

    return arraysAreEqualByFunction(aEmojis, bEmojis, compareEmojiArrays)
  };

  //
  // Update utils to avoid excessive re-renders
  //

  // avoid excessive re-renders by checking the value before setting
  const updateCurrentEmojis = (newEmojis) => {
    if (!arraysAreEqualByFunction(state.currentEmojis, newEmojis, compareEmojiArrays)) {
      state.currentEmojis = newEmojis;
    }
  };

  // avoid excessive re-renders
  const updateSearchMode = (newSearchMode) => {
    if (state.searchMode !== newSearchMode) {
      state.searchMode = newSearchMode;
    }
  };

  // avoid excessive re-renders
  const updateCurrentEmojisWithCategories = (newEmojisWithCategories) => {
    if (!arraysAreEqualByFunction(state.currentEmojisWithCategories, newEmojisWithCategories, compareCurrentEmojisWithCategories)) {
      state.currentEmojisWithCategories = newEmojisWithCategories;
    }
  };

  // Helpers used by PickerTemplate

  const unicodeWithSkin = (emoji, currentSkinTone) => (
    (currentSkinTone && emoji.skins && emoji.skins[currentSkinTone]) || emoji.unicode
  );

  const labelWithSkin = (emoji, currentSkinTone) => (
    uniq([
      (emoji.name || unicodeWithSkin(emoji, currentSkinTone)),
      emoji.annotation,
      ...(emoji.shortcodes || EMPTY_ARRAY)
    ].filter(Boolean)).join(', ')
  );

  const titleForEmoji = (emoji) => (
    emoji.annotation || (emoji.shortcodes || EMPTY_ARRAY).join(', ')
  );

  const helpers = {
    labelWithSkin, titleForEmoji, unicodeWithSkin
  };
  const events = {
    onClickSkinToneButton,
    onEmojiClick,
    onNavClick,
    onNavKeydown,
    onSearchKeydown,
    onSkinToneOptionsClick,
    onSkinToneOptionsFocusOut,
    onSkinToneOptionsKeydown,
    onSkinToneOptionsKeyup,
    onSearchInput
  };
  const actions = {
    calculateEmojiGridStyle,
    updateOnIntersection
  };

  let firstRender = true;
  createEffect(() => {
    render(shadowRoot, state, helpers, events, actions, refs, abortSignal, actionContext, firstRender);
    firstRender = false;
  });

  //
  // Determine the emoji support level (in requestIdleCallback)
  //

  // mount logic
  if (!state.emojiVersion) {
    detectEmojiSupportLevel().then(level => {
      // Can't actually test emoji support in Jest/Vitest/JSDom, emoji never render in color in Cairo
      /* istanbul ignore next */
      if (!level) {
        state.message = state.i18n.emojiUnsupportedMessage;
      }
    });
  }

  //
  // Set or update the database object
  //

  createEffect(() => {
    // show a Loading message if it takes a long time, or show an error if there's a network/IDB error
    async function handleDatabaseLoading () {
      let showingLoadingMessage = false;
      const timeoutHandle = setTimeout(() => {
        showingLoadingMessage = true;
        state.message = state.i18n.loadingMessage;
      }, TIMEOUT_BEFORE_LOADING_MESSAGE);
      try {
        await state.database.ready();
        state.databaseLoaded = true; // eslint-disable-line no-unused-vars
      } catch (err) {
        console.error(err);
        state.message = state.i18n.networkErrorMessage;
      } finally {
        clearTimeout(timeoutHandle);
        if (showingLoadingMessage) { // Seems safer than checking the i18n string, which may change
          showingLoadingMessage = false;
          state.message = ''; // eslint-disable-line no-unused-vars
        }
      }
    }

    if (state.database) {
      /* no await */
      handleDatabaseLoading();
    }
  });

  //
  // Global styles for the entire picker
  //

  createEffect(() => {
    state.pickerStyle = `
      --num-groups: ${state.groups.length}; 
      --indicator-opacity: ${state.searchMode ? 0 : 1}; 
      --num-skintones: ${NUM_SKIN_TONES};`;
  });

  //
  // Set or update the customEmoji
  //

  createEffect(() => {
    if (state.customEmoji && state.database) {
      updateCustomEmoji(); // re-run whenever customEmoji change
    }
  });

  createEffect(() => {
    if (state.customEmoji && state.customEmoji.length) {
      if (state.groups !== allGroups) { // don't update unnecessarily
        state.groups = allGroups;
      }
    } else if (state.groups !== groups) {
      if (state.currentGroupIndex) {
        // If the current group is anything other than "custom" (which is first), decrement.
        // This fixes the odd case where you set customEmoji, then pick a category, then unset customEmoji
        state.currentGroupIndex--;
      }
      state.groups = groups;
    }
  });

  //
  // Set or update the preferred skin tone
  //

  createEffect(() => {
    async function updatePreferredSkinTone () {
      if (state.databaseLoaded) {
        state.currentSkinTone = await state.database.getPreferredSkinTone();
      }
    }

    /* no await */ updatePreferredSkinTone();
  });

  createEffect(() => {
    state.skinTones = Array(NUM_SKIN_TONES).fill().map((_, i) => applySkinTone(state.skinToneEmoji, i));
  });

  createEffect(() => {
    state.skinToneButtonText = state.skinTones[state.currentSkinTone];
  });

  createEffect(() => {
    state.skinToneButtonLabel = state.i18n.skinToneLabel.replace('{skinTone}', state.i18n.skinTones[state.currentSkinTone]);
  });

  //
  // Set or update the favorites emojis
  //

  createEffect(() => {
    async function updateDefaultFavoriteEmojis () {
      const { database } = state;
      const favs = (await Promise.all(MOST_COMMONLY_USED_EMOJI.map(unicode => (
        database.getEmojiByUnicodeOrName(unicode)
      )))).filter(Boolean); // filter because in Jest/Vitest tests we don't have all the emoji in the DB
      state.defaultFavoriteEmojis = favs;
    }

    if (state.databaseLoaded) {
      /* no await */ updateDefaultFavoriteEmojis();
    }
  });

  function updateCustomEmoji () {
    // Certain effects have an implicit dependency on customEmoji since it affects the database
    // Getting it here on the state ensures this effect re-runs when customEmoji change.
    const { customEmoji, database } = state;
    const databaseCustomEmoji = customEmoji || EMPTY_ARRAY;
    if (database.customEmoji !== databaseCustomEmoji) {
      // Avoid setting this if the customEmoji have _not_ changed, because the setter triggers a re-computation of the
      // `customEmojiIndex`. Note we don't bother with deep object changes.
      database.customEmoji = databaseCustomEmoji;
    }
  }

  createEffect(() => {
    async function updateFavorites () {
      updateCustomEmoji(); // re-run whenever customEmoji change
      const { database, defaultFavoriteEmojis, numColumns } = state;
      const dbFavorites = await database.getTopFavoriteEmoji(numColumns);
      const favorites = await summarizeEmojis(uniqBy([
        ...dbFavorites,
        ...defaultFavoriteEmojis
      ], _ => (_.unicode || _.name)).slice(0, numColumns));
      state.currentFavorites = favorites;
    }

    if (state.databaseLoaded && state.defaultFavoriteEmojis) {
      /* no await */ updateFavorites();
    }
  });

  //
  // Re-run whenever the emoji grid changes size, and re-calc style/layout-related state variables:
  // 1) Re-calculate the --num-columns var because it may have changed
  // 2) Re-calculate whether we're in RTL mode or not.
  //
  // The benefit of doing this in one place is to align with rAF/ResizeObserver
  // and do all the calculations in one go. RTL vs LTR is not strictly layout-related,
  // but since we're already reading the style here, and since it's already aligned with
  // the rAF loop, this is the most appropriate place to do it perf-wise.
  //

  function calculateEmojiGridStyle (node) {
    resizeObserverAction(node, abortSignal, () => {
      /* istanbul ignore next */
      { // jsdom throws errors for this kind of fancy stuff
        // read all the style/layout calculations we need to make
        const style = getComputedStyle(refs.rootElement);
        const newNumColumns = parseInt(style.getPropertyValue('--num-columns'), 10);
        const newIsRtl = style.getPropertyValue('direction') === 'rtl';

        // write to state variables
        state.numColumns = newNumColumns;
        state.isRtl = newIsRtl;
      }
    });
  }

  // Re-run whenever the custom emoji in a category are shown/hidden. This is an optimization that simulates
  // what we'd get from `<img loading=lazy>` but without rendering an `<img>`.
  function updateOnIntersection (node) {
    intersectionObserverAction(node, abortSignal, (entries) => {
      for (const { target, isIntersecting } of entries) {
        target.classList.toggle('onscreen', isIntersecting);
      }
    });
  }

  //
  // Set or update the currentEmojis. Check for invalid ZWJ renderings
  // (i.e. double emoji).
  //

  createEffect(() => {
    async function updateEmojis () {
      const { searchText, currentGroup, databaseLoaded, customEmoji } = state;
      if (!databaseLoaded) {
        state.currentEmojis = [];
        state.searchMode = false;
      } else if (searchText.length >= MIN_SEARCH_TEXT_LENGTH) {
        const newEmojis = await getEmojisBySearchQuery(searchText);
        if (state.searchText === searchText) { // if the situation changes asynchronously, do not update
          updateCurrentEmojis(newEmojis);
          updateSearchMode(true);
        }
      } else { // database is loaded and we're not in search mode, so we're in normal category mode
        const { id: currentGroupId } = currentGroup;
        // avoid race condition where currentGroupId is -1 and customEmoji is undefined/empty
        if (currentGroupId !== -1 || (customEmoji && customEmoji.length)) {
          const newEmojis = await getEmojisByGroup(currentGroupId);
          if (state.currentGroup.id === currentGroupId) { // if the situation changes asynchronously, do not update
            updateCurrentEmojis(newEmojis);
            updateSearchMode(false);
          }
        }
      }
    }

    /* no await */ updateEmojis();
  });

  const resetScrollTopInRaf = () => {
    rAF(() => resetScrollTopIfPossible(refs.tabpanelElement));
  };

  // Some emojis have their ligatures rendered as two or more consecutive emojis
  // We want to treat these the same as unsupported emojis, so we compare their
  // widths against the baseline widths and remove them as necessary
  createEffect(() => {
    const { currentEmojis, emojiVersion } = state;
    const zwjEmojisToCheck = currentEmojis
      .filter(emoji => emoji.unicode) // filter custom emoji
      .filter(emoji => hasZwj(emoji) && !supportedZwjEmojis.has(emoji.unicode));
    if (!emojiVersion && zwjEmojisToCheck.length) {
      // render now, check their length later
      updateCurrentEmojis(currentEmojis);
      rAF(() => checkZwjSupportAndUpdate(zwjEmojisToCheck));
    } else {
      const newEmojis = emojiVersion ? currentEmojis : currentEmojis.filter(isZwjSupported);
      updateCurrentEmojis(newEmojis);
      // Reset scroll top to 0 when emojis change
      resetScrollTopInRaf();
    }
  });

  function checkZwjSupportAndUpdate (zwjEmojisToCheck) {
    const allSupported = checkZwjSupport(zwjEmojisToCheck, refs.baselineEmoji, emojiToDomNode);
    if (allSupported) {
      // Even if all emoji are supported, we still need to reset the scroll top to 0 when emojis change
      resetScrollTopInRaf();
    } else {
      // Force update. We only do this if there are any unsupported ZWJ characters since otherwise,
      // for browsers that support all emoji, it would be an unnecessary extra re-render.
      state.currentEmojis = [...state.currentEmojis];
    }
  }

  function isZwjSupported (emoji) {
    return !emoji.unicode || !hasZwj(emoji) || supportedZwjEmojis.get(emoji.unicode)
  }

  async function filterEmojisByVersion (emojis) {
    const emojiSupportLevel = state.emojiVersion || await detectEmojiSupportLevel();
    // !version corresponds to custom emoji
    return emojis.filter(({ version }) => !version || version <= emojiSupportLevel)
  }

  async function summarizeEmojis (emojis) {
    return summarizeEmojisForUI(emojis, state.emojiVersion || await detectEmojiSupportLevel())
  }

  async function getEmojisByGroup (group) {
    // -1 is custom emoji
    const emoji = group === -1 ? state.customEmoji : await state.database.getEmojiByGroup(group);
    return summarizeEmojis(await filterEmojisByVersion(emoji))
  }

  async function getEmojisBySearchQuery (query) {
    return summarizeEmojis(await filterEmojisByVersion(await state.database.getEmojiBySearchQuery(query)))
  }

  createEffect(() => {
  });

  //
  // Derive currentEmojisWithCategories from currentEmojis. This is always done even if there
  // are no categories, because it's just easier to code the HTML this way.
  //

  createEffect(() => {
    function calculateCurrentEmojisWithCategories () {
      const { searchMode, currentEmojis } = state;
      if (searchMode) {
        return [
          {
            category: '',
            emojis: currentEmojis
          }
        ]
      }
      const categoriesToEmoji = new Map();
      for (const emoji of currentEmojis) {
        const category = emoji.category || '';
        let emojis = categoriesToEmoji.get(category);
        if (!emojis) {
          emojis = [];
          categoriesToEmoji.set(category, emojis);
        }
        emojis.push(emoji);
      }
      return [...categoriesToEmoji.entries()]
        .map(([category, emojis]) => ({ category, emojis }))
        .sort((a, b) => state.customCategorySorting(a.category, b.category))
    }

    const newEmojisWithCategories = calculateCurrentEmojisWithCategories();
    updateCurrentEmojisWithCategories(newEmojisWithCategories);
  });

  //
  // Handle active search item (i.e. pressing up or down while searching)
  //

  createEffect(() => {
    state.activeSearchItemId = state.activeSearchItem !== -1 && state.currentEmojis[state.activeSearchItem].id;
  });

  //
  // Handle user input on the search input
  //

  createEffect(() => {
    const { rawSearchText } = state;
    rIC(() => {
      state.searchText = (rawSearchText || '').trim(); // defer to avoid input delays, plus we can trim here
      state.activeSearchItem = -1;
    });
  });

  function onSearchKeydown (event) {
    if (!state.searchMode || !state.currentEmojis.length) {
      return
    }

    const goToNextOrPrevious = (previous) => {
      halt(event);
      state.activeSearchItem = incrementOrDecrement(previous, state.activeSearchItem, state.currentEmojis);
    };

    switch (event.key) {
      case 'ArrowDown':
        return goToNextOrPrevious(false)
      case 'ArrowUp':
        return goToNextOrPrevious(true)
      case 'Enter':
        if (state.activeSearchItem === -1) {
          // focus the first option in the list since the list must be non-empty at this point (it's verified above)
          state.activeSearchItem = 0;
        } else { // there is already an active search item
          halt(event);
          return clickEmoji(state.currentEmojis[state.activeSearchItem].id)
        }
    }
  }

  //
  // Handle user input on nav
  //

  function onNavClick (event) {
    const { target } = event;
    const closestTarget = target.closest('.nav-button');
    /* istanbul ignore if */
    if (!closestTarget) {
      return // This should never happen, but makes me nervous not to have it
    }
    const groupId = parseInt(closestTarget.dataset.groupId, 10);
    refs.searchElement.value = ''; // clear search box input
    state.rawSearchText = '';
    state.searchText = '';
    state.activeSearchItem = -1;
    state.currentGroupIndex = state.groups.findIndex(_ => _.id === groupId);
  }

  function onNavKeydown (event) {
    const { target, key } = event;

    const doFocus = el => {
      if (el) {
        halt(event);
        el.focus();
      }
    };

    switch (key) {
      case 'ArrowLeft':
        return doFocus(target.previousElementSibling)
      case 'ArrowRight':
        return doFocus(target.nextElementSibling)
      case 'Home':
        return doFocus(target.parentElement.firstElementChild)
      case 'End':
        return doFocus(target.parentElement.lastElementChild)
    }
  }

  //
  // Handle user input on an emoji
  //

  async function clickEmoji (unicodeOrName) {
    const emoji = await state.database.getEmojiByUnicodeOrName(unicodeOrName);
    const emojiSummary = [...state.currentEmojis, ...state.currentFavorites]
      .find(_ => (_.id === unicodeOrName));
    const skinTonedUnicode = emojiSummary.unicode && unicodeWithSkin(emojiSummary, state.currentSkinTone);
    await state.database.incrementFavoriteEmojiCount(unicodeOrName);
    fireEvent('emoji-click', {
      emoji,
      skinTone: state.currentSkinTone,
      ...(skinTonedUnicode && { unicode: skinTonedUnicode }),
      ...(emojiSummary.name && { name: emojiSummary.name })
    });
  }

  async function onEmojiClick (event) {
    const { target } = event;
    /* istanbul ignore if */
    if (!target.classList.contains('emoji')) {
      // This should never happen, but makes me nervous not to have it
      return
    }
    halt(event);
    const id = target.id.substring(4); // replace 'emo-' or 'fav-' prefix

    /* no await */ clickEmoji(id);
  }

  //
  // Handle user input on the skintone picker
  //

  function changeSkinTone (skinTone) {
    state.currentSkinTone = skinTone;
    state.skinTonePickerExpanded = false;
    focus('skintone-button');
    fireEvent('skin-tone-change', { skinTone });
    /* no await */ state.database.setPreferredSkinTone(skinTone);
  }

  function onSkinToneOptionsClick (event) {
    const { target: { id } } = event;
    const match = id && id.match(/^skintone-(\d)/); // skintone option format
    /* istanbul ignore if */
    if (!match) { // not a skintone option
      return // This should never happen, but makes me nervous not to have it
    }
    halt(event);
    const skinTone = parseInt(match[1], 10); // remove 'skintone-' prefix
    changeSkinTone(skinTone);
  }

  function onClickSkinToneButton (event) {
    state.skinTonePickerExpanded = !state.skinTonePickerExpanded;
    state.activeSkinTone = state.currentSkinTone;
    // this should always be true, since the button is obscured by the listbox, so this `if` is just to be sure
    if (state.skinTonePickerExpanded) {
      halt(event);
      rAF(() => focus('skintone-list'));
    }
  }

  // To make the animation nicer, change the z-index of the skintone picker button
  // *after* the animation has played. This makes it appear that the picker box
  // is expanding "below" the button
  createEffect(() => {
    if (state.skinTonePickerExpanded) {
      refs.skinToneDropdown.addEventListener('transitionend', () => {
        state.skinTonePickerExpandedAfterAnimation = true; // eslint-disable-line no-unused-vars
      }, { once: true });
    } else {
      state.skinTonePickerExpandedAfterAnimation = false; // eslint-disable-line no-unused-vars
    }
  });

  function onSkinToneOptionsKeydown (event) {
    // this should never happen, but makes me nervous not to have it
    /* istanbul ignore if */
    if (!state.skinTonePickerExpanded) {
      return
    }
    const changeActiveSkinTone = async nextSkinTone => {
      halt(event);
      state.activeSkinTone = nextSkinTone;
    };

    switch (event.key) {
      case 'ArrowUp':
        return changeActiveSkinTone(incrementOrDecrement(true, state.activeSkinTone, state.skinTones))
      case 'ArrowDown':
        return changeActiveSkinTone(incrementOrDecrement(false, state.activeSkinTone, state.skinTones))
      case 'Home':
        return changeActiveSkinTone(0)
      case 'End':
        return changeActiveSkinTone(state.skinTones.length - 1)
      case 'Enter':
        // enter on keydown, space on keyup. this is just how browsers work for buttons
        // https://lists.w3.org/Archives/Public/w3c-wai-ig/2019JanMar/0086.html
        halt(event);
        return changeSkinTone(state.activeSkinTone)
      case 'Escape':
        halt(event);
        state.skinTonePickerExpanded = false;
        return focus('skintone-button')
    }
  }

  function onSkinToneOptionsKeyup (event) {
    // this should never happen, but makes me nervous not to have it
    /* istanbul ignore if */
    if (!state.skinTonePickerExpanded) {
      return
    }
    switch (event.key) {
      case ' ':
        // enter on keydown, space on keyup. this is just how browsers work for buttons
        // https://lists.w3.org/Archives/Public/w3c-wai-ig/2019JanMar/0086.html
        halt(event);
        return changeSkinTone(state.activeSkinTone)
    }
  }

  async function onSkinToneOptionsFocusOut (event) {
    // On blur outside of the skintone listbox, collapse the skintone picker.
    const { relatedTarget } = event;
    // The `else` should never happen, but makes me nervous not to have it
    /* istanbul ignore else */
    if (!relatedTarget || relatedTarget.id !== 'skintone-list') {
      state.skinTonePickerExpanded = false;
    }
  }

  function onSearchInput (event) {
    state.rawSearchText = event.target.value;
  }

  return {
    $set (newState) {
      assign(state, newState);
    },
    $destroy () {
      abortController.abort();
    }
  }
}

const DEFAULT_DATA_SOURCE = 'https://cdn.jsdelivr.net/npm/emoji-picker-element-data@^1/en/emojibase/data.json';
const DEFAULT_LOCALE = 'en';

var enI18n = {
  categoriesLabel: 'Categories',
  emojiUnsupportedMessage: 'Your browser does not support color emoji.',
  favoritesLabel: 'Favorites',
  loadingMessage: 'Loading…',
  networkErrorMessage: 'Could not load emoji.',
  regionLabel: 'Emoji picker',
  searchDescription: 'When search results are available, press up or down to select and enter to choose.',
  searchLabel: 'Search',
  searchResultsLabel: 'Search results',
  skinToneDescription: 'When expanded, press up or down to select and enter to choose.',
  skinToneLabel: 'Choose a skin tone (currently {skinTone})',
  skinTonesLabel: 'Skin tones',
  skinTones: [
    'Default',
    'Light',
    'Medium-Light',
    'Medium',
    'Medium-Dark',
    'Dark'
  ],
  categories: {
    custom: 'Custom',
    'smileys-emotion': 'Smileys and emoticons',
    'people-body': 'People and body',
    'animals-nature': 'Animals and nature',
    'food-drink': 'Food and drink',
    'travel-places': 'Travel and places',
    activities: 'Activities',
    objects: 'Objects',
    symbols: 'Symbols',
    flags: 'Flags'
  }
};

var baseStyles = ":host{--emoji-size:1.375rem;--emoji-padding:0.5rem;--category-emoji-size:var(--emoji-size);--category-emoji-padding:var(--emoji-padding);--indicator-height:3px;--input-border-radius:0.5rem;--input-border-size:1px;--input-font-size:1rem;--input-line-height:1.5;--input-padding:0.25rem;--num-columns:8;--outline-size:2px;--border-size:1px;--border-radius:0;--skintone-border-radius:1rem;--category-font-size:1rem;display:flex;width:min-content;height:400px}:host,:host(.light){color-scheme:light;--background:#fff;--border-color:#e0e0e0;--indicator-color:#385ac1;--input-border-color:#999;--input-font-color:#111;--input-placeholder-color:#999;--outline-color:#999;--category-font-color:#111;--button-active-background:#e6e6e6;--button-hover-background:#d9d9d9}:host(.dark){color-scheme:dark;--background:#222;--border-color:#444;--indicator-color:#5373ec;--input-border-color:#ccc;--input-font-color:#efefef;--input-placeholder-color:#ccc;--outline-color:#fff;--category-font-color:#efefef;--button-active-background:#555555;--button-hover-background:#484848}@media (prefers-color-scheme:dark){:host{color-scheme:dark;--background:#222;--border-color:#444;--indicator-color:#5373ec;--input-border-color:#ccc;--input-font-color:#efefef;--input-placeholder-color:#ccc;--outline-color:#fff;--category-font-color:#efefef;--button-active-background:#555555;--button-hover-background:#484848}}:host([hidden]){display:none}button{margin:0;padding:0;border:0;background:0 0;box-shadow:none;-webkit-tap-highlight-color:transparent}button::-moz-focus-inner{border:0}input{padding:0;margin:0;line-height:1.15;font-family:inherit}input[type=search]{-webkit-appearance:none}:focus{outline:var(--outline-color) solid var(--outline-size);outline-offset:calc(-1*var(--outline-size))}:host([data-js-focus-visible]) :focus:not([data-focus-visible-added]){outline:0}:focus:not(:focus-visible){outline:0}.hide-focus{outline:0}*{box-sizing:border-box}.picker{contain:content;display:flex;flex-direction:column;background:var(--background);border:var(--border-size) solid var(--border-color);border-radius:var(--border-radius);width:100%;height:100%;overflow:hidden;--total-emoji-size:calc(var(--emoji-size) + (2 * var(--emoji-padding)));--total-category-emoji-size:calc(var(--category-emoji-size) + (2 * var(--category-emoji-padding)))}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);border:0}.hidden{opacity:0;pointer-events:none}.abs-pos{position:absolute;left:0;top:0}.gone{display:none!important}.skintone-button-wrapper,.skintone-list{background:var(--background);z-index:3}.skintone-button-wrapper.expanded{z-index:1}.skintone-list{position:absolute;inset-inline-end:0;top:0;z-index:2;overflow:visible;border-bottom:var(--border-size) solid var(--border-color);border-radius:0 0 var(--skintone-border-radius) var(--skintone-border-radius);will-change:transform;transition:transform .2s ease-in-out;transform-origin:center 0}@media (prefers-reduced-motion:reduce){.skintone-list{transition-duration:.001s}}@supports not (inset-inline-end:0){.skintone-list{right:0}}.skintone-list.no-animate{transition:none}.tabpanel{overflow-y:auto;scrollbar-gutter:stable;-webkit-overflow-scrolling:touch;will-change:transform;min-height:0;flex:1;contain:content}.emoji-menu{display:grid;grid-template-columns:repeat(var(--num-columns),var(--total-emoji-size));justify-content:space-around;align-items:flex-start;width:100%}.emoji-menu.visibility-auto{content-visibility:auto;contain-intrinsic-size:calc(var(--num-columns)*var(--total-emoji-size)) calc(var(--num-rows)*var(--total-emoji-size))}.category{padding:var(--emoji-padding);font-size:var(--category-font-size);color:var(--category-font-color)}.emoji,button.emoji{font-size:var(--emoji-size);display:flex;align-items:center;justify-content:center;border-radius:100%;height:var(--total-emoji-size);width:var(--total-emoji-size);line-height:1;overflow:hidden;font-family:var(--emoji-font-family);cursor:pointer}@media (hover:hover) and (pointer:fine){.emoji:hover,button.emoji:hover{background:var(--button-hover-background)}}.emoji.active,.emoji:active,button.emoji.active,button.emoji:active{background:var(--button-active-background)}.onscreen .custom-emoji::after{content:\"\";width:var(--emoji-size);height:var(--emoji-size);background-repeat:no-repeat;background-position:center center;background-size:contain;background-image:var(--custom-emoji-background)}.nav,.nav-button{align-items:center}.nav{display:grid;justify-content:space-between;contain:content}.nav-button{display:flex;justify-content:center}.nav-emoji{font-size:var(--category-emoji-size);width:var(--total-category-emoji-size);height:var(--total-category-emoji-size)}.indicator-wrapper{display:flex;border-bottom:1px solid var(--border-color)}.indicator{width:calc(100%/var(--num-groups));height:var(--indicator-height);opacity:var(--indicator-opacity);background-color:var(--indicator-color);will-change:transform,opacity;transition:opacity .1s linear,transform .25s ease-in-out}@media (prefers-reduced-motion:reduce){.indicator{will-change:opacity;transition:opacity .1s linear}}.pad-top,input.search{background:var(--background);width:100%}.pad-top{height:var(--emoji-padding);z-index:3}.search-row{display:flex;align-items:center;position:relative;padding-inline-start:var(--emoji-padding);padding-bottom:var(--emoji-padding)}.search-wrapper{flex:1;min-width:0}input.search{padding:var(--input-padding);border-radius:var(--input-border-radius);border:var(--input-border-size) solid var(--input-border-color);color:var(--input-font-color);font-size:var(--input-font-size);line-height:var(--input-line-height)}input.search::placeholder{color:var(--input-placeholder-color)}.favorites{overflow-y:auto;scrollbar-gutter:stable;display:flex;flex-direction:row;border-top:var(--border-size) solid var(--border-color);contain:content}.message{padding:var(--emoji-padding)}";

const PROPS = [
  'customEmoji',
  'customCategorySorting',
  'database',
  'dataSource',
  'i18n',
  'locale',
  'skinToneEmoji',
  'emojiVersion'
];

// Styles injected ourselves, so we can declare the FONT_FAMILY variable in one place
const EXTRA_STYLES = `:host{--emoji-font-family:${FONT_FAMILY}}`;

class PickerElement extends HTMLElement {
  constructor (props) {
    super();
    this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = baseStyles + EXTRA_STYLES;
    this.shadowRoot.appendChild(style);
    this._ctx = {
      // Set defaults
      locale: DEFAULT_LOCALE,
      dataSource: DEFAULT_DATA_SOURCE,
      skinToneEmoji: DEFAULT_SKIN_TONE_EMOJI,
      customCategorySorting: DEFAULT_CATEGORY_SORTING,
      customEmoji: null,
      i18n: enI18n,
      emojiVersion: null,
      ...props
    };
    // Handle properties set before the element was upgraded
    for (const prop of PROPS) {
      if (prop !== 'database' && Object.prototype.hasOwnProperty.call(this, prop)) {
        this._ctx[prop] = this[prop];
        delete this[prop];
      }
    }
    this._dbFlush(); // wait for a flush before creating the db, in case the user calls e.g. a setter or setAttribute
  }

  connectedCallback () {
    // The _cmp may be defined if the component was immediately disconnected and then reconnected. In that case,
    // do nothing (preserve the state)
    if (!this._cmp) {
      this._cmp = createRoot(this.shadowRoot, this._ctx);
    }
  }

  disconnectedCallback () {
    // Check in a microtask if the element is still connected. If so, treat this as a "move" rather than a disconnect
    // Inspired by Vue: https://vuejs.org/guide/extras/web-components.html#building-custom-elements-with-vue
    qM(() => {
      // this._cmp may be defined if connect-disconnect-connect-disconnect occurs synchronously
      if (!this.isConnected && this._cmp) {
        this._cmp.$destroy();
        this._cmp = undefined;

        const { database } = this._ctx;
        database.close()
          // only happens if the database failed to load in the first place, so we don't care
          .catch(err => console.error(err));
      }
    });
  }

  static get observedAttributes () {
    return ['locale', 'data-source', 'skin-tone-emoji', 'emoji-version'] // complex objects aren't supported, also use kebab-case
  }

  attributeChangedCallback (attrName, oldValue, newValue) {
    this._set(
      // convert from kebab-case to camelcase
      // see https://github.com/sveltejs/svelte/issues/3852#issuecomment-665037015
      attrName.replace(/-([a-z])/g, (_, up) => up.toUpperCase()),
      // convert string attribute to float if necessary
      attrName === 'emoji-version' ? parseFloat(newValue) : newValue
    );
  }

  _set (prop, newValue) {
    this._ctx[prop] = newValue;
    if (this._cmp) {
      this._cmp.$set({ [prop]: newValue });
    }
    if (['locale', 'dataSource'].includes(prop)) {
      this._dbFlush();
    }
  }

  _dbCreate () {
    const { locale, dataSource, database } = this._ctx;
    // only create a new database if we really need to
    if (!database || database.locale !== locale || database.dataSource !== dataSource) {
      this._set('database', new _database_js__WEBPACK_IMPORTED_MODULE_0__["default"]({ locale, dataSource }));
    }
  }

  // Update the Database in one microtask if the locale/dataSource change. We do one microtask
  // so we don't create two Databases if e.g. both the locale and the dataSource change
  _dbFlush () {
    qM(() => (
      this._dbCreate()
    ));
  }
}

const definitions = {};

for (const prop of PROPS) {
  definitions[prop] = {
    get () {
      if (prop === 'database') {
        // in rare cases, the microtask may not be flushed yet, so we need to instantiate the DB
        // now if the user is asking for it
        this._dbCreate();
      }
      return this._ctx[prop]
    },
    set (val) {
      if (prop === 'database') {
        throw new Error('database is read-only')
      }
      this._set(prop, val);
    }
  };
}

Object.defineProperties(PickerElement.prototype, definitions);

/* istanbul ignore else */
if (!customElements.get('emoji-picker')) { // if already defined, do nothing (e.g. same script imported twice)
  customElements.define('emoji-picker', PickerElement);
}




/***/ }),

/***/ "./node_modules/picmo/dist/index.js":
/*!******************************************!*\
  !*** ./node_modules/picmo/dist/index.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EmojiPicker: () => (/* binding */ _s),
/* harmony export */   Events: () => (/* binding */ le),
/* harmony export */   FocusTrap: () => (/* binding */ st),
/* harmony export */   InMemoryProvider: () => (/* binding */ qs),
/* harmony export */   InMemoryStoreFactory: () => (/* binding */ Se),
/* harmony export */   IndexedDbStoreFactory: () => (/* binding */ Le),
/* harmony export */   LocalStorageProvider: () => (/* binding */ zt),
/* harmony export */   NativeRenderer: () => (/* binding */ Ft),
/* harmony export */   RecentsProvider: () => (/* binding */ Ae),
/* harmony export */   Renderer: () => (/* binding */ Et),
/* harmony export */   SessionStorageProvider: () => (/* binding */ Us),
/* harmony export */   animate: () => (/* binding */ I),
/* harmony export */   autoTheme: () => (/* binding */ Os),
/* harmony export */   caseInsensitiveIncludes: () => (/* binding */ ue),
/* harmony export */   computeHash: () => (/* binding */ Ue),
/* harmony export */   createDatabase: () => (/* binding */ Ws),
/* harmony export */   createPicker: () => (/* binding */ Hs),
/* harmony export */   createStyleInjector: () => (/* binding */ Ss),
/* harmony export */   darkTheme: () => (/* binding */ Ns),
/* harmony export */   debounce: () => (/* binding */ Ke),
/* harmony export */   deleteDatabase: () => (/* binding */ Bs),
/* harmony export */   empty: () => (/* binding */ V),
/* harmony export */   en: () => (/* binding */ ze),
/* harmony export */   getEmojiForEvent: () => (/* binding */ q),
/* harmony export */   getOptions: () => (/* binding */ $t),
/* harmony export */   getPrefixedClasses: () => (/* binding */ p),
/* harmony export */   globalConfig: () => (/* binding */ At),
/* harmony export */   i18n: () => (/* binding */ Ks),
/* harmony export */   isLocalStorageAvailable: () => (/* binding */ qe),
/* harmony export */   isSessionStorageAvailable: () => (/* binding */ xe),
/* harmony export */   lightTheme: () => (/* binding */ ot),
/* harmony export */   prefixClassName: () => (/* binding */ ne),
/* harmony export */   replaceChildren: () => (/* binding */ w),
/* harmony export */   shouldAnimate: () => (/* binding */ _e),
/* harmony export */   throttle: () => (/* binding */ He),
/* harmony export */   toElement: () => (/* binding */ Q)
/* harmony export */ });
var U = (s, e, t) => {
  if (!e.has(s))
    throw TypeError("Cannot " + t);
};
var y = (s, e, t) => (U(s, e, "read from private field"), t ? t.call(s) : e.get(s)), f = (s, e, t) => {
  if (e.has(s))
    throw TypeError("Cannot add the same private member more than once");
  e instanceof WeakSet ? e.add(s) : e.set(s, t);
}, A = (s, e, t, o) => (U(s, e, "write to private field"), o ? o.call(s, t) : e.set(s, t), t);
var g = (s, e, t) => (U(s, e, "access private method"), t);
const Ve = "14.0";
function De(s, e, t) {
  let o = `https://cdn.jsdelivr.net/npm/emojibase-data@${e}/${s}`;
  return typeof t == "function" ? o = t(s, e) : typeof t == "string" && (o = `${t}/${s}`), o;
}
async function ae(s, e = {}) {
  const {
    local: t = !1,
    version: o = "latest",
    cdnUrl: i,
    ...r
  } = e, a = De(s, o, i), n = t ? localStorage : sessionStorage, l = `emojibase/${o}/${s}`, m = n.getItem(l);
  if (m)
    return Promise.resolve(JSON.parse(m));
  const d = await fetch(a, {
    credentials: "omit",
    mode: "cors",
    redirect: "error",
    ...r
  });
  if (!d.ok)
    throw new Error("Failed to load Emojibase dataset.");
  const h = await d.json();
  try {
    n.setItem(l, JSON.stringify(h));
  } catch {
  }
  return h;
}
const Be = {
  discord: "joypixels",
  slack: "iamcal"
};
async function me(s, e, t) {
  var o;
  return ae(`${s}/shortcodes/${(o = Be[e]) !== null && o !== void 0 ? o : e}.json`, t);
}
function k(s, e) {
  if (e.length === 0)
    return s;
  const t = new Set(s.shortcodes);
  return e.forEach((o) => {
    const i = o[s.hexcode];
    Array.isArray(i) ? i.forEach((r) => t.add(r)) : i && t.add(i);
  }), s.shortcodes = [...t], s.skins && s.skins.forEach((o) => {
    k(o, e);
  }), s;
}
function Ne(s, e = []) {
  const t = [];
  return s.forEach((o) => {
    if (o.skins) {
      const {
        skins: i,
        ...r
      } = o;
      t.push(k(r, e)), i.forEach((a) => {
        const n = {
          ...a
        };
        r.tags && (n.tags = [...r.tags]), t.push(k(n, e));
      });
    } else
      t.push(k(o, e));
  }), t;
}
function Oe(s, e) {
  return e.length === 0 || s.forEach((t) => {
    k(t, e);
  }), s;
}
async function Ce(s, e = {}) {
  const {
    compact: t = !1,
    flat: o = !1,
    shortcodes: i = [],
    ...r
  } = e, a = await ae(`${s}/${t ? "compact" : "data"}.json`, r);
  let n = [];
  return i.length > 0 && (n = await Promise.all(i.map((l) => {
    let m;
    if (l.includes("/")) {
      const [d, h] = l.split("/");
      m = me(d, h, r);
    } else
      m = me(s, l, r);
    return m.catch(() => ({}));
  }))), o ? Ne(a, n) : Oe(a, n);
}
async function je(s, e) {
  return ae(`${s}/messages.json`, e);
}
function q(s, e) {
  const o = s.target.closest("[data-emoji]");
  if (o) {
    const i = e.find((r) => r.emoji === o.dataset.emoji);
    if (i)
      return i;
  }
  return null;
}
function _e(s) {
  var t;
  const e = (t = window.matchMedia) == null ? void 0 : t.call(window, "(prefers-reduced-motion: reduce)");
  return s.animate && !(e != null && e.matches);
}
function ue(s, e) {
  return s.toLowerCase().includes(e.toLowerCase());
}
function He(s, e) {
  let t = null;
  return () => {
    t || (t = window.setTimeout(() => {
      s(), t = null;
    }, e));
  };
}
function Ke(s, e) {
  let t = null;
  return (...o) => {
    t && window.clearTimeout(t), t = window.setTimeout(() => {
      s(...o), t = null;
    }, e);
  };
}
function I(s, e, t, o) {
  if (_e(o) && s.animate)
    return s.animate(e, t).finished;
  const i = t.direction === "normal" ? 1 : 0, r = Object.entries(e).reduce((a, [n, l]) => ({
    ...a,
    [n]: l[i]
  }), {});
  return Object.assign(s.style, r), Promise.resolve();
}
function Q(s) {
  var t;
  const e = document.createElement("template");
  return e.innerHTML = s, (t = e.content) == null ? void 0 : t.firstElementChild;
}
async function Ue(s) {
  const e = new TextEncoder().encode(s), t = await crypto.subtle.digest("SHA-256", e);
  return Array.from(new Uint8Array(t)).map((i) => i.toString(16).padStart(2, "0")).join("");
}
function p(...s) {
  return s.reduce((e, t) => ({
    ...e,
    [t]: ne(t)
  }), {});
}
function ne(s) {
  return `picmo__${s}`;
}
function V(s) {
  for (; s.firstChild; )
    s.removeChild(s.firstChild);
  return s;
}
function w(s, ...e) {
  V(s).append(...e);
}
function ke(s) {
  try {
    return window[s].length, !0;
  } catch {
    return !1;
  }
}
function xe() {
  return ke("sessionStorage");
}
function qe() {
  return ke("localStorage");
}
function x(s) {
  var e;
  return {
    emoji: s.emoji,
    label: s.label,
    tags: s.tags,
    skins: (e = s.skins) == null ? void 0 : e.map((t) => x(t)),
    order: s.order,
    custom: !1,
    hexcode: s.hexcode,
    version: s.version
  };
}
function B(s, e, t) {
  var o;
  return t && !t.some((i) => i.order === s.group) ? !1 : ue(s.label, e) || ((o = s.tags) == null ? void 0 : o.some((i) => ue(i, e)));
}
class Ee {
  constructor(e = "en") {
    this.locale = e;
  }
}
const We = [
  (s, e) => (s.hexcode === "1F91D" && e < 14 && (s.skins = []), s),
  (s, e) => (s.skins && (s.skins = s.skins.filter((t) => !t.version || t.version <= e)), s)
];
function Ge(s, e) {
  return We.some((t) => t(s, e) === null) ? null : s;
}
function N(s, e) {
  return s.filter((t) => Ge(t, e) !== null);
}
const W = {};
function Se(s) {
  return W[s] || (W[s] = new Je(s)), W[s];
}
Se.deleteDatabase = (s) => {
};
class Je extends Ee {
  open() {
    return Promise.resolve();
  }
  delete() {
    return Promise.resolve();
  }
  close() {
  }
  isPopulated() {
    return Promise.resolve(!1);
  }
  getEmojiCount() {
    return Promise.resolve(this.emojis.length);
  }
  getEtags() {
    return Promise.resolve({ foo: "bar" });
  }
  getHash() {
    return Promise.resolve("");
  }
  populate(e) {
    return this.categories = e.groups, this.emojis = e.emojis, Promise.resolve();
  }
  getCategories(e) {
    var o;
    let t = this.categories.filter((i) => i.key !== "component");
    if (e.showRecents && t.unshift({ key: "recents", order: -1 }), (o = e.custom) != null && o.length && t.push({ key: "custom", order: 10 }), e.categories) {
      const i = e.categories;
      t = t.filter((r) => i.includes(r.key)), t.sort((r, a) => i.indexOf(r.key) - i.indexOf(a.key));
    } else
      t.sort((i, r) => i.order - r.order);
    return Promise.resolve(t);
  }
  getEmojis(e, t) {
    const o = this.emojis.filter((i) => i.group === e.order).filter((i) => i.version <= t).sort((i, r) => i.order != null && r.order != null ? i.order - r.order : 0).map(x);
    return Promise.resolve(N(o, t));
  }
  searchEmojis(e, t, o, i) {
    const r = this.emojis.filter((l) => B(l, e, i) && l.version <= o).map(x), a = t.filter((l) => B(l, e, i)), n = [
      ...N(r, o),
      ...a
    ];
    return Promise.resolve(n);
  }
  setMeta(e) {
    this.meta = e;
  }
}
function Ze(s, e) {
  const t = `https://cdn.jsdelivr.net/npm/emojibase-data@${s}/${e}`;
  return {
    emojisUrl: `${t}/data.json`,
    messagesUrl: `${t}/messages.json`
  };
}
async function pe(s) {
  try {
    return (await fetch(s, { method: "HEAD" })).headers.get("etag");
  } catch {
    return null;
  }
}
function Ye(s) {
  const { emojisUrl: e, messagesUrl: t } = Ze("latest", s);
  try {
    return Promise.all([
      pe(e),
      pe(t)
    ]);
  } catch {
    return Promise.all([null, null]);
  }
}
async function Qe(s, e, t) {
  let o;
  try {
    o = await s.getEtags();
  } catch {
    o = {};
  }
  const { storedEmojisEtag: i, storedMessagesEtag: r } = o;
  if (t !== r || e !== i) {
    const [a, n] = await Promise.all([je(s.locale), Ce(s.locale)]);
    await s.populate({
      groups: a.groups,
      emojis: n,
      emojisEtag: e,
      messagesEtag: t
    });
  }
}
async function Xe(s, e) {
  const t = await s.getHash();
  return e !== t;
}
async function Fe(s, e, t) {
  let o = t || e(s);
  try {
    await o.open();
  } catch {
    console.warn("[picmo] IndexedDB not available, falling back to InMemoryStoreFactory"), o = Se(s);
  }
  return o;
}
async function et(s, e, t) {
  if (!xe() && typeof window < "u")
    throw new Error("Session storage is required to use CDN emoji data.");
  const o = await Fe(s, e, t), [i, r] = await Ye(s);
  if (await o.isPopulated())
    i && r && await Qe(o, i, r);
  else {
    const [a, n] = await Promise.all([je(s), Ce(s)]);
    await o.populate({ groups: a.groups, emojis: n, emojisEtag: i, messagesEtag: r });
  }
  return o;
}
async function tt(s, e, t, o, i) {
  const r = await Fe(s, e, i), a = await Ue(o);
  return (!await r.isPopulated() || await Xe(r, a)) && await r.populate({ groups: t.groups, emojis: o, hash: a }), r;
}
async function ce(s, e, t, o, i) {
  return t && o ? tt(s, e, t, o, i) : et(s, e, i);
}
function Bs(s, e) {
  s.deleteDatabase(e);
}
class st {
  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }
  activate(e) {
    this.rootElement = e, this.rootElement.addEventListener("keydown", this.handleKeyDown);
  }
  deactivate() {
    var e;
    (e = this.rootElement) == null || e.removeEventListener("keydown", this.handleKeyDown);
  }
  get focusableElements() {
    return this.rootElement.querySelectorAll('input, [tabindex="0"]');
  }
  get lastFocusableElement() {
    return this.focusableElements[this.focusableElements.length - 1];
  }
  get firstFocusableElement() {
    return this.focusableElements[0];
  }
  checkFocus(e, t, o) {
    e.target === t && (o.focus(), e.preventDefault());
  }
  handleKeyDown(e) {
    e.key === "Tab" && this.checkFocus(
      e,
      e.shiftKey ? this.firstFocusableElement : this.lastFocusableElement,
      e.shiftKey ? this.lastFocusableElement : this.firstFocusableElement
    );
  }
}
const {
  light: ot,
  dark: Ns,
  auto: Os
} = p("light", "dark", "auto");
class c {
  constructor({ template: e, classes: t, parent: o }) {
    this.isDestroyed = !1, this.appEvents = {}, this.uiEvents = [], this.uiElements = {}, this.ui = {}, this.template = e, this.classes = t, this.parent = o, this.keyBindingHandler = this.keyBindingHandler.bind(this);
  }
  initialize() {
    this.bindAppEvents();
  }
  setCustomEmojis(e) {
    this.customEmojis = e;
  }
  setEvents(e) {
    this.events = e;
  }
  setPickerId(e) {
    this.pickerId = e;
  }
  emit(e, ...t) {
    this.events.emit(e, ...t);
  }
  setI18n(e) {
    this.i18n = e;
  }
  setRenderer(e) {
    this.renderer = e;
  }
  setEmojiData(e) {
    this.emojiDataPromise = e, e.then((t) => {
      this.emojiData = t;
    });
  }
  updateEmojiData(e) {
    this.emojiData = e, this.emojiDataPromise = Promise.resolve(e);
  }
  setOptions(e) {
    this.options = e;
  }
  renderSync(e = {}) {
    return this.el = this.template.renderSync({
      classes: this.classes,
      i18n: this.i18n,
      pickerId: this.pickerId,
      ...e
    }), this.postRender(), this.el;
  }
  async render(e = {}) {
    return await this.emojiDataPromise, this.el = await this.template.renderAsync({
      classes: this.classes,
      i18n: this.i18n,
      pickerId: this.pickerId,
      ...e
    }), this.postRender(), this.el;
  }
  postRender() {
    this.bindUIElements(), this.bindKeyBindings(), this.bindUIEvents(), this.scheduleShowAnimation();
  }
  bindAppEvents() {
    Object.keys(this.appEvents).forEach((e) => {
      this.events.on(e, this.appEvents[e], this);
    }), this.events.on("data:ready", this.updateEmojiData, this);
  }
  unbindAppEvents() {
    Object.keys(this.appEvents).forEach((e) => {
      this.events.off(e, this.appEvents[e]);
    }), this.events.off("data:ready", this.updateEmojiData);
  }
  keyBindingHandler(e) {
    const t = this.keyBindings[e.key];
    t && t.call(this, e);
  }
  bindKeyBindings() {
    this.keyBindings && this.el.addEventListener("keydown", this.keyBindingHandler);
  }
  unbindKeyBindings() {
    this.keyBindings && this.el.removeEventListener("keydown", this.keyBindingHandler);
  }
  bindUIElements() {
    this.ui = Object.keys(this.uiElements).reduce((e, t) => ({
      ...e,
      [t]: this.el.querySelector(this.uiElements[t])
    }), {});
  }
  bindUIEvents() {
    this.uiEvents.forEach((e) => {
      e.handler = e.handler.bind(this), (e.target ? this.ui[e.target] : this.el).addEventListener(e.event, e.handler, e.options);
    });
  }
  unbindUIEvents() {
    this.uiEvents.forEach((e) => {
      (e.target ? this.ui[e.target] : this.el).removeEventListener(e.event, e.handler);
    });
  }
  destroy() {
    this.unbindAppEvents(), this.unbindUIEvents(), this.unbindKeyBindings(), this.el.remove(), this.isDestroyed = !0;
  }
  scheduleShowAnimation() {
    if (this.parent) {
      const e = new MutationObserver((t) => {
        const [o] = t;
        o.type === "childList" && o.addedNodes[0] === this.el && (_e(this.options) && this.animateShow && this.animateShow(), e.disconnect);
      });
      e.observe(this.parent, { childList: !0 });
    }
  }
  static childEvent(e, t, o, i = {}) {
    return { target: e, event: t, handler: o, options: i };
  }
  static uiEvent(e, t, o = {}) {
    return { event: e, handler: t, options: o };
  }
  static byClass(e) {
    return `.${e}`;
  }
}
const it = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512zM232 256C232 264 236 271.5 242.7 275.1L338.7 339.1C349.7 347.3 364.6 344.3 371.1 333.3C379.3 322.3 376.3 307.4 365.3 300L280 243.2V120C280 106.7 269.3 96 255.1 96C242.7 96 231.1 106.7 231.1 120L232 256z"/></svg>', rt = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M64 496C64 504.8 56.75 512 48 512h-32C7.25 512 0 504.8 0 496V32c0-17.75 14.25-32 32-32s32 14.25 32 32V496zM476.3 0c-6.365 0-13.01 1.35-19.34 4.233c-45.69 20.86-79.56 27.94-107.8 27.94c-59.96 0-94.81-31.86-163.9-31.87C160.9 .3055 131.6 4.867 96 15.75v350.5c32-9.984 59.87-14.1 84.85-14.1c73.63 0 124.9 31.78 198.6 31.78c31.91 0 68.02-5.971 111.1-23.09C504.1 355.9 512 344.4 512 332.1V30.73C512 11.1 495.3 0 476.3 0z"/></svg>', at = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256zM176.4 240C194 240 208.4 225.7 208.4 208C208.4 190.3 194 176 176.4 176C158.7 176 144.4 190.3 144.4 208C144.4 225.7 158.7 240 176.4 240zM336.4 176C318.7 176 304.4 190.3 304.4 208C304.4 225.7 318.7 240 336.4 240C354 240 368.4 225.7 368.4 208C368.4 190.3 354 176 336.4 176zM259.9 369.4C288.8 369.4 316.2 375.2 340.6 385.5C352.9 390.7 366.7 381.3 361.4 369.1C344.8 330.9 305.6 303.1 259.9 303.1C214.3 303.1 175.1 330.8 158.4 369.1C153.1 381.3 166.1 390.6 179.3 385.4C203.7 375.1 231 369.4 259.9 369.4L259.9 369.4z"/></svg>', nt = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M448 64H192C85.96 64 0 149.1 0 256s85.96 192 192 192h256c106 0 192-85.96 192-192S554 64 448 64zM247.1 280h-32v32c0 13.2-10.78 24-23.98 24c-13.2 0-24.02-10.8-24.02-24v-32L136 279.1C122.8 279.1 111.1 269.2 111.1 256c0-13.2 10.85-24.01 24.05-24.01L167.1 232v-32c0-13.2 10.82-24 24.02-24c13.2 0 23.98 10.8 23.98 24v32h32c13.2 0 24.02 10.8 24.02 24C271.1 269.2 261.2 280 247.1 280zM431.1 344c-22.12 0-39.1-17.87-39.1-39.1s17.87-40 39.1-40s39.1 17.88 39.1 40S454.1 344 431.1 344zM495.1 248c-22.12 0-39.1-17.87-39.1-39.1s17.87-40 39.1-40c22.12 0 39.1 17.88 39.1 40S518.1 248 495.1 248z"/></svg>', ct = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M112.1 454.3c0 6.297 1.816 12.44 5.284 17.69l17.14 25.69c5.25 7.875 17.17 14.28 26.64 14.28h61.67c9.438 0 21.36-6.401 26.61-14.28l17.08-25.68c2.938-4.438 5.348-12.37 5.348-17.7L272 415.1h-160L112.1 454.3zM191.4 .0132C89.44 .3257 16 82.97 16 175.1c0 44.38 16.44 84.84 43.56 115.8c16.53 18.84 42.34 58.23 52.22 91.45c.0313 .25 .0938 .5166 .125 .7823h160.2c.0313-.2656 .0938-.5166 .125-.7823c9.875-33.22 35.69-72.61 52.22-91.45C351.6 260.8 368 220.4 368 175.1C368 78.61 288.9-.2837 191.4 .0132zM192 96.01c-44.13 0-80 35.89-80 79.1C112 184.8 104.8 192 96 192S80 184.8 80 176c0-61.76 50.25-111.1 112-111.1c8.844 0 16 7.159 16 16S200.8 96.01 192 96.01z"/></svg>', lt = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M512 32H120c-13.25 0-24 10.75-24 24L96.01 288c0 53 43 96 96 96h192C437 384 480 341 480 288h32c70.63 0 128-57.38 128-128S582.6 32 512 32zM512 224h-32V96h32c35.25 0 64 28.75 64 64S547.3 224 512 224zM560 416h-544C7.164 416 0 423.2 0 432C0 458.5 21.49 480 48 480h480c26.51 0 48-21.49 48-48C576 423.2 568.8 416 560 416z"/></svg>', ht = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M482.3 192C516.5 192 576 221 576 256C576 292 516.5 320 482.3 320H365.7L265.2 495.9C259.5 505.8 248.9 512 237.4 512H181.2C170.6 512 162.9 501.8 165.8 491.6L214.9 320H112L68.8 377.6C65.78 381.6 61.04 384 56 384H14.03C6.284 384 0 377.7 0 369.1C0 368.7 .1818 367.4 .5398 366.1L32 256L.5398 145.9C.1818 144.6 0 143.3 0 142C0 134.3 6.284 128 14.03 128H56C61.04 128 65.78 130.4 68.8 134.4L112 192H214.9L165.8 20.4C162.9 10.17 170.6 0 181.2 0H237.4C248.9 0 259.5 6.153 265.2 16.12L365.7 192H482.3z"/></svg>', dt = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M9.375 233.4C3.375 239.4 0 247.5 0 256v128c0 8.5 3.375 16.62 9.375 22.62S23.5 416 32 416h32V224H32C23.5 224 15.38 227.4 9.375 233.4zM464 96H352V32c0-17.62-14.38-32-32-32S288 14.38 288 32v64H176C131.8 96 96 131.8 96 176V448c0 35.38 28.62 64 64 64h320c35.38 0 64-28.62 64-64V176C544 131.8 508.3 96 464 96zM256 416H192v-32h64V416zM224 296C201.9 296 184 278.1 184 256S201.9 216 224 216S264 233.9 264 256S246.1 296 224 296zM352 416H288v-32h64V416zM448 416h-64v-32h64V416zM416 296c-22.12 0-40-17.88-40-40S393.9 216 416 216S456 233.9 456 256S438.1 296 416 296zM630.6 233.4C624.6 227.4 616.5 224 608 224h-32v192h32c8.5 0 16.62-3.375 22.62-9.375S640 392.5 640 384V256C640 247.5 636.6 239.4 630.6 233.4z"/></svg>', mt = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient gradientUnits="userSpaceOnUse" cy="10%" id="gradient-0">
      <stop offset="0" stop-color="hsl(50, 100%, 50%)" />
      <stop offset="1" stop-color="hsl(50, 100%, 60%)" />
    </radialGradient>
  </defs>
  <!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
  <ellipse stroke="#000" fill="rgba(0, 0, 0, 0.6)" cx="172.586" cy="207.006" rx="39.974" ry="39.974"/>
  <ellipse stroke="#000" fill="rgba(0, 0, 0, 0.6)" cx="334.523" cy="207.481" rx="39.974" ry="39.974"/>
  <ellipse stroke="#000" fill="rgba(0, 0, 0, 0.6)" cx="313.325" cy="356.208" rx="91.497" ry="59.893"/>
  <path fill="#55a7ff" d="M 159.427 274.06 L 102.158 363.286 L 124.366 417.011 L 160.476 423.338 L 196.937 414.736 L 218.502 375.214"></path>
  <path fill="url(#gradient-0)" d="M256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0zM256 352C290.9 352 323.2 367.8 348.3 394.9C354.3 401.4 364.4 401.7 370.9 395.7C377.4 389.7 377.7 379.6 371.7 373.1C341.6 340.5 301 320 256 320C247.2 320 240 327.2 240 336C240 344.8 247.2 352 256 352H256zM208 369C208 349 179.6 308.6 166.4 291.3C163.2 286.9 156.8 286.9 153.6 291.3C140.6 308.6 112 349 112 369C112 395 133.5 416 160 416C186.5 416 208 395 208 369H208zM303.6 208C303.6 225.7 317.1 240 335.6 240C353.3 240 367.6 225.7 367.6 208C367.6 190.3 353.3 176 335.6 176C317.1 176 303.6 190.3 303.6 208zM207.6 208C207.6 190.3 193.3 176 175.6 176C157.1 176 143.6 190.3 143.6 208C143.6 225.7 157.1 240 175.6 240C193.3 240 207.6 225.7 207.6 208z" />
</svg>`, ut = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M500.3 443.7l-119.7-119.7c27.22-40.41 40.65-90.9 33.46-144.7C401.8 87.79 326.8 13.32 235.2 1.723C99.01-15.51-15.51 99.01 1.724 235.2c11.6 91.64 86.08 166.7 177.6 178.9c53.8 7.189 104.3-6.236 144.7-33.46l119.7 119.7c15.62 15.62 40.95 15.62 56.57 0C515.9 484.7 515.9 459.3 500.3 443.7zM79.1 208c0-70.58 57.42-128 128-128s128 57.42 128 128c0 70.58-57.42 128-128 128S79.1 278.6 79.1 208z"/></svg>', pt = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256zM256.3 331.8C208.9 331.8 164.1 324.9 124.5 312.8C112.2 309 100.2 319.7 105.2 331.5C130.1 390.6 188.4 432 256.3 432C324.2 432 382.4 390.6 407.4 331.5C412.4 319.7 400.4 309 388.1 312.8C348.4 324.9 303.7 331.8 256.3 331.8H256.3zM176.4 176C158.7 176 144.4 190.3 144.4 208C144.4 225.7 158.7 240 176.4 240C194 240 208.4 225.7 208.4 208C208.4 190.3 194 176 176.4 176zM336.4 240C354 240 368.4 225.7 368.4 208C368.4 190.3 354 176 336.4 176C318.7 176 304.4 190.3 304.4 208C304.4 225.7 318.7 240 336.4 240z"/></svg>', gt = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M500.3 7.251C507.7 13.33 512 22.41 512 31.1V175.1C512 202.5 483.3 223.1 447.1 223.1C412.7 223.1 383.1 202.5 383.1 175.1C383.1 149.5 412.7 127.1 447.1 127.1V71.03L351.1 90.23V207.1C351.1 234.5 323.3 255.1 287.1 255.1C252.7 255.1 223.1 234.5 223.1 207.1C223.1 181.5 252.7 159.1 287.1 159.1V63.1C287.1 48.74 298.8 35.61 313.7 32.62L473.7 .6198C483.1-1.261 492.9 1.173 500.3 7.251H500.3zM74.66 303.1L86.5 286.2C92.43 277.3 102.4 271.1 113.1 271.1H174.9C185.6 271.1 195.6 277.3 201.5 286.2L213.3 303.1H239.1C266.5 303.1 287.1 325.5 287.1 351.1V463.1C287.1 490.5 266.5 511.1 239.1 511.1H47.1C21.49 511.1-.0019 490.5-.0019 463.1V351.1C-.0019 325.5 21.49 303.1 47.1 303.1H74.66zM143.1 359.1C117.5 359.1 95.1 381.5 95.1 407.1C95.1 434.5 117.5 455.1 143.1 455.1C170.5 455.1 191.1 434.5 191.1 407.1C191.1 381.5 170.5 359.1 143.1 359.1zM440.3 367.1H496C502.7 367.1 508.6 372.1 510.1 378.4C513.3 384.6 511.6 391.7 506.5 396L378.5 508C372.9 512.1 364.6 513.3 358.6 508.9C352.6 504.6 350.3 496.6 353.3 489.7L391.7 399.1H336C329.3 399.1 323.4 395.9 321 389.6C318.7 383.4 320.4 376.3 325.5 371.1L453.5 259.1C459.1 255 467.4 254.7 473.4 259.1C479.4 263.4 481.6 271.4 478.7 278.3L440.3 367.1zM116.7 219.1L19.85 119.2C-8.112 90.26-6.614 42.31 24.85 15.34C51.82-8.137 93.26-3.642 118.2 21.83L128.2 32.32L137.7 21.83C162.7-3.642 203.6-8.137 231.6 15.34C262.6 42.31 264.1 90.26 236.1 119.2L139.7 219.1C133.2 225.6 122.7 225.6 116.7 219.1H116.7z"/></svg>', yt = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M413.8 447.1L256 448l0 31.99C256 497.7 241.8 512 224.1 512c-17.67 0-32.1-14.32-32.1-31.99l0-31.99l-158.9-.0099c-28.5 0-43.69-34.49-24.69-56.4l68.98-79.59H62.22c-25.41 0-39.15-29.8-22.67-49.13l60.41-70.85H89.21c-21.28 0-32.87-22.5-19.28-37.31l134.8-146.5c10.4-11.3 28.22-11.3 38.62-.0033l134.9 146.5c13.62 14.81 2.001 37.31-19.28 37.31h-10.77l60.35 70.86c16.46 19.34 2.716 49.12-22.68 49.12h-15.2l68.98 79.59C458.7 413.7 443.1 447.1 413.8 447.1z"/></svg>', ft = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M224 256c70.7 0 128-57.31 128-128S294.7 0 224 0C153.3 0 96 57.31 96 128S153.3 256 224 256zM274.7 304H173.3c-95.73 0-173.3 77.6-173.3 173.3C0 496.5 15.52 512 34.66 512H413.3C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304zM479.1 320h-73.85C451.2 357.7 480 414.1 480 477.3C480 490.1 476.2 501.9 470 512h138C625.7 512 640 497.6 640 479.1C640 391.6 568.4 320 479.1 320zM432 256C493.9 256 544 205.9 544 144S493.9 32 432 32c-25.11 0-48.04 8.555-66.72 22.51C376.8 76.63 384 101.4 384 128c0 35.52-11.93 68.14-31.59 94.71C372.7 243.2 400.8 256 432 256z"/></svg>', vt = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="radial" cy="85%">
      <stop offset="20%" stop-color="var(--color-secondary)" />
      <stop offset="100%" stop-color="var(--color-primary)" />
    </radialGradient>
  </defs>
  <!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. -->
  <path fill="url('#radial')" d="M506.3 417l-213.3-364c-16.33-28-57.54-28-73.98 0l-213.2 364C-10.59 444.9 9.849 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM232 168c0-13.25 10.75-24 24-24S280 154.8 280 168v128c0 13.25-10.75 24-23.1 24S232 309.3 232 296V168zM256 416c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 401.9 273.4 416 256 416z" />
</svg>`, wt = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"/></svg>';
function bt(s, e) {
  const t = Q(e);
  return t.dataset.icon = s, t.classList.add(ne("icon")), t;
}
const ge = {
  clock: it,
  flag: rt,
  frown: at,
  gamepad: nt,
  lightbulb: ct,
  mug: lt,
  plane: ht,
  robot: dt,
  sad: mt,
  search: ut,
  smiley: pt,
  symbols: gt,
  tree: yt,
  users: ft,
  warning: vt,
  xmark: wt
}, O = {
  recents: "clock",
  "smileys-emotion": "smiley",
  "people-body": "users",
  "animals-nature": "tree",
  "food-drink": "mug",
  activities: "gamepad",
  "travel-places": "plane",
  objects: "lightbulb",
  symbols: "symbols",
  flags: "flag",
  custom: "robot"
};
function Pe(s, e) {
  if (!(s in ge))
    return console.warn(`Unknown icon: "${s}"`), document.createElement("div");
  const t = bt(s, ge[s]);
  return e && t.classList.add(ne(`icon-${e}`)), t;
}
const Ct = {
  mode: "sync"
};
var b, E, S, X, F, ee, P, te;
class u {
  constructor(e, t = {}) {
    f(this, S);
    f(this, F);
    f(this, P);
    f(this, b, void 0);
    f(this, E, void 0);
    A(this, b, e), A(this, E, t.mode || Ct.mode);
  }
  renderSync(e = {}) {
    const t = Q(y(this, b).call(this, e));
    return g(this, P, te).call(this, t, e), g(this, F, ee).call(this, t), g(this, S, X).call(this, t, e), t;
  }
  async renderAsync(e = {}) {
    const t = Q(y(this, b).call(this, e));
    return g(this, P, te).call(this, t, e), g(this, F, ee).call(this, t), await g(this, S, X).call(this, t, e), t;
  }
  render(e) {
    return y(this, E) === "sync" ? this.renderSync(e) : this.renderAsync(e);
  }
}
b = new WeakMap(), E = new WeakMap(), S = new WeakSet(), X = async function(e, t) {
  const o = e.querySelectorAll("[data-view]"), i = [];
  for (const r of o) {
    const a = t[r.dataset.view];
    a ? r.dataset.render !== "sync" ? i.push(a.render().then((n) => (r.replaceWith(n), n))) : r.replaceWith(a.renderSync()) : r.remove();
  }
  return Promise.all(i);
}, F = new WeakSet(), ee = function(e) {
  e.querySelectorAll("i[data-icon]").forEach((o) => {
    const { icon: i, size: r } = o.dataset;
    o.replaceWith(Pe(i, r));
  });
}, P = new WeakSet(), te = function(e, t) {
  return e.querySelectorAll("[data-placeholder]").forEach((i) => {
    const r = i.dataset.placeholder;
    if (r && t[r]) {
      const a = t[r];
      i.replaceWith(...[a].flat());
    } else
      console.warn(`Missing placeholder element for key "${r}"`);
  }), e;
};
const jt = p(
  "imagePlaceholder",
  "placeholder"
), _t = new u(({ classes: s }) => `
  <div class="${s.placeholder} ${s.imagePlaceholder}"></div>
`);
class kt extends c {
  constructor({ classNames: e } = {}) {
    super({ template: _t, classes: jt }), this.classNames = e;
  }
  load(e) {
    const t = document.createElement("img");
    this.classNames && (t.className = this.classNames), t.addEventListener("load", () => {
      this.el.replaceWith(t);
    }, { once: !0 }), Promise.resolve(e).then((o) => t.src = o);
  }
  renderSync() {
    return super.renderSync(), this.classNames && this.classNames.split(" ").forEach((t) => this.el.classList.add(t)), this.el;
  }
}
const xt = p("customEmoji");
class Et {
  renderElement(e) {
    return { content: e };
  }
  renderImage(e = "", t) {
    const o = new kt({ classNames: e });
    return o.renderSync(), { content: o, resolver: () => (o.load(t()), o.el) };
  }
  doRender(e, t, o) {
    if (e.custom)
      return this.renderCustom(e, t, o);
    const { content: i, resolver: r } = this.render(e, o), a = i instanceof Element ? i : i.el;
    return r && r(), a;
  }
  doEmit(e) {
    return e.custom ? this.emitCustom(e) : this.emit(e);
  }
  emitCustom({ url: e, label: t, emoji: o, data: i }) {
    return { url: e, label: t, emoji: o, data: i };
  }
  renderCustom(e, t, o = "") {
    const i = [xt.customEmoji, o].join(" ").trim(), { content: r, resolver: a } = this.renderImage(i, () => e.url), n = r instanceof Element ? r : r.el;
    return a && a(), n;
  }
}
const St = new u(({ emoji: s }) => `<span>${s}</span>`);
class Ft extends Et {
  render(e) {
    return this.renderElement(St.renderSync({ emoji: e.emoji }));
  }
  emit({ emoji: e, hexcode: t, label: o }) {
    return { emoji: e, hexcode: t, label: o };
  }
}
const ze = {
  "categories.activities": "Activities",
  "categories.animals-nature": "Animals & Nature",
  "categories.custom": "Custom",
  "categories.flags": "Flags",
  "categories.food-drink": "Food & Drink",
  "categories.objects": "Objects",
  "categories.people-body": "People & Body",
  "categories.recents": "Recently Used",
  "categories.smileys-emotion": "Smileys & Emotion",
  "categories.symbols": "Symbols",
  "categories.travel-places": "Travel & Places",
  "error.load": "Failed to load emojis",
  "recents.clear": "Clear recent emojis",
  "recents.none": "You haven't selected any emojis yet.",
  retry: "Try again",
  "search.clear": "Clear search",
  "search.error": "Failed to search emojis",
  "search.notFound": "No results found",
  search: "Search emojis..."
}, se = "PicMo";
function Le(s) {
  return new Pt(s);
}
Le.deleteDatabase = (s) => new Promise((e, t) => {
  const o = indexedDB.deleteDatabase(`${se}-${s}`);
  o.addEventListener("success", e), o.addEventListener("error", t);
});
class Pt extends Ee {
  async open() {
    const e = indexedDB.open(`${se}-${this.locale}`);
    return new Promise((t, o) => {
      e.addEventListener("success", (i) => {
        var r;
        this.db = (r = i.target) == null ? void 0 : r.result, t();
      }), e.addEventListener("error", o), e.addEventListener("upgradeneeded", async (i) => {
        var a;
        this.db = (a = i.target) == null ? void 0 : a.result, this.db.createObjectStore("category", { keyPath: "order" });
        const r = this.db.createObjectStore("emoji", { keyPath: "emoji" });
        r.createIndex("category", "group"), r.createIndex("version", "version"), this.db.createObjectStore("meta");
      });
    });
  }
  async delete() {
    this.close();
    const e = indexedDB.deleteDatabase(`${se}-${this.locale}`);
    await this.waitForRequest(e);
  }
  close() {
    this.db.close();
  }
  async getEmojiCount() {
    const t = this.db.transaction("emoji", "readonly").objectStore("emoji");
    return (await this.waitForRequest(t.count())).target.result;
  }
  async getEtags() {
    const t = this.db.transaction("meta", "readonly").objectStore("meta"), [o, i] = await Promise.all([
      this.waitForRequest(t.get("emojisEtag")),
      this.waitForRequest(t.get("messagesEtag"))
    ]);
    return {
      storedEmojisEtag: o.target.result,
      storedMessagesEtag: i.target.result
    };
  }
  async setMeta(e) {
    const t = this.db.transaction("meta", "readwrite"), o = t.objectStore("meta");
    return new Promise((i) => {
      t.oncomplete = i, Object.keys(e).filter(Boolean).forEach((a) => {
        o.put(e[a], a);
      });
    });
  }
  async getHash() {
    const t = this.db.transaction("meta", "readonly").objectStore("meta");
    return (await this.waitForRequest(t.get("hash"))).target.result;
  }
  async isPopulated() {
    const t = this.db.transaction("category", "readonly").objectStore("category");
    return (await this.waitForRequest(t.count())).target.result > 0;
  }
  async populate({
    groups: e,
    emojis: t,
    emojisEtag: o,
    messagesEtag: i,
    hash: r
  }) {
    await this.removeAllObjects("category", "emoji");
    const a = [
      this.addObjects("category", e),
      this.addObjects("emoji", t),
      this.setMeta({ emojisEtag: o, messagesEtag: i, hash: r })
    ];
    await Promise.all(a);
  }
  async getCategories(e) {
    var a;
    const o = this.db.transaction("category", "readonly").objectStore("category");
    let r = (await this.waitForRequest(o.getAll())).target.result.filter((n) => n.key !== "component");
    if (e.showRecents && r.unshift({ key: "recents", order: -1 }), (a = e.custom) != null && a.length && r.push({ key: "custom", order: 10 }), e.categories) {
      const n = e.categories;
      r = r.filter((l) => n.includes(l.key)), r.sort((l, m) => n.indexOf(l.key) - n.indexOf(m.key));
    } else
      r.sort((n, l) => n.order - l.order);
    return r;
  }
  async getEmojis(e, t) {
    const r = this.db.transaction("emoji", "readonly").objectStore("emoji").index("category"), l = (await this.waitForRequest(r.getAll(e.order))).target.result.filter((m) => m.version <= t).sort((m, d) => m.order != null && d.order != null ? m.order - d.order : 0).map(x);
    return N(l, t);
  }
  async searchEmojis(e, t, o, i) {
    const r = [];
    return new Promise((a, n) => {
      const d = this.db.transaction("emoji", "readonly").objectStore("emoji").openCursor();
      d.addEventListener("success", (h) => {
        var de;
        const H = (de = h.target) == null ? void 0 : de.result;
        if (!H)
          return a([
            ...N(r, o),
            ...t.filter((Me) => B(Me, e))
          ]);
        const K = H.value;
        B(K, e, i) && K.version <= o && r.push(x(K)), H.continue();
      }), d.addEventListener("error", (h) => {
        n(h);
      });
    });
  }
  async waitForRequest(e) {
    return new Promise((t, o) => {
      e.onsuccess = t, e.onerror = o;
    });
  }
  withTransaction(e, t = "readwrite", o) {
    return new Promise((i, r) => {
      const a = this.db.transaction(e, t);
      a.oncomplete = i, a.onerror = r, o(a);
    });
  }
  async removeAllObjects(...e) {
    const t = this.db.transaction(e, "readwrite"), o = e.map((i) => t.objectStore(i));
    await Promise.all(o.map((i) => this.waitForRequest(i.clear())));
  }
  async addObjects(e, t) {
    return this.withTransaction(e, "readwrite", (o) => {
      const i = o.objectStore(e);
      t.forEach((r) => {
        i.add(r);
      });
    });
  }
}
function $e() {
  let s = {};
  return {
    getItem: (e) => s[e],
    setItem: (e, t) => s[e] = t,
    length: Object.keys(s).length,
    clear: () => s = {},
    key: (e) => Object.keys(s)[e],
    removeItem: (e) => delete s[e]
  };
}
class Ae {
}
const G = "PicMo:recents";
class Ie extends Ae {
  constructor(e) {
    super(), this.storage = e;
  }
  clear() {
    this.storage.removeItem(G);
  }
  getRecents(e) {
    var t;
    try {
      return JSON.parse((t = this.storage.getItem(G)) != null ? t : "[]").slice(0, e);
    } catch {
      return [];
    }
  }
  addOrUpdateRecent(e, t) {
    const o = [
      e,
      ...this.getRecents(t).filter((i) => i.hexcode !== e.hexcode)
    ].slice(0, t);
    try {
      this.storage.setItem(G, JSON.stringify(o));
    } catch {
      console.warn("storage is not available, recent emojis will not be saved");
    }
  }
}
class zt extends Ie {
  constructor() {
    super(qe() ? localStorage : $e());
  }
}
const Lt = {
  dataStore: Le,
  theme: ot,
  animate: !0,
  showCategoryTabs: !0,
  showPreview: !0,
  showRecents: !0,
  showSearch: !0,
  showVariants: !0,
  emojisPerRow: 8,
  visibleRows: 6,
  emojiVersion: "auto",
  i18n: ze,
  locale: "en",
  maxRecents: 50,
  custom: []
};
function $t(s = {}) {
  return {
    ...Lt,
    ...s,
    renderer: s.renderer || new Ft(),
    recentsProvider: s.recentsProvider || new zt()
  };
}
var v, C, D, z, oe;
class le {
  constructor() {
    f(this, C);
    f(this, z);
    f(this, v, /* @__PURE__ */ new Map());
  }
  on(e, t, o) {
    g(this, z, oe).call(this, e, t, o);
  }
  once(e, t, o) {
    g(this, z, oe).call(this, e, t, o, !0);
  }
  off(e, t) {
    const o = g(this, C, D).call(this, e);
    y(this, v).set(e, o.filter((i) => i.handler !== t));
  }
  emit(e, ...t) {
    g(this, C, D).call(this, e).forEach((i) => {
      i.handler.apply(i.context, t), i.once && this.off(e, i.handler);
    });
  }
  removeAll() {
    y(this, v).clear();
  }
}
v = new WeakMap(), C = new WeakSet(), D = function(e) {
  return y(this, v).has(e) || y(this, v).set(e, []), y(this, v).get(e);
}, z = new WeakSet(), oe = function(e, t, o, i = !1) {
  g(this, C, D).call(this, e).push({ context: o, handler: t, once: i });
};
const At = {
  injectStyles: !0
};
class It extends le {
}
class Tt extends le {
}
const ie = p(
  "emojiCategory",
  "categoryName",
  "noRecents",
  "recentEmojis"
);
class he extends c {
  constructor({ template: e, category: t, showVariants: o, lazyLoader: i }) {
    super({ template: e, classes: ie }), this.baseUIElements = {
      categoryName: c.byClass(ie.categoryName)
    }, this.category = t, this.showVariants = o, this.lazyLoader = i;
  }
  setActive(e, t, o) {
    this.emojiContainer.setActive(e, t, o);
  }
}
const Rt = new u(({ classes: s, emoji: e }) => `
  <button
    type="button"
    class="${s.emojiButton}"
    title="${e.label}"
    data-emoji="${e.emoji}"
    tabindex="-1">
    <div data-placeholder="emojiContent"></div>
  </button>
`), Mt = p("emojiButton");
class Te extends c {
  constructor({ emoji: e, lazyLoader: t, category: o }) {
    super({ template: Rt, classes: Mt }), this.emoji = e, this.lazyLoader = t, this.category = o;
  }
  initialize() {
    this.uiEvents = [
      c.uiEvent("focus", this.handleFocus)
    ], super.initialize();
  }
  handleFocus() {
    this.category && this.events.emit("focus:change", this.category);
  }
  activateFocus(e) {
    this.el.tabIndex = 0, e && this.el.focus();
  }
  deactivateFocus() {
    this.el.tabIndex = -1;
  }
  renderSync() {
    return super.renderSync({
      emoji: this.emoji,
      emojiContent: this.renderer.doRender(this.emoji, this.lazyLoader)
    });
  }
}
class Vt {
  constructor(e, t, o = 0, i = 0, r = !1) {
    this.events = new le(), this.keyHandlers = {
      ArrowLeft: this.focusPrevious.bind(this),
      ArrowRight: this.focusNext.bind(this),
      ArrowUp: this.focusUp.bind(this),
      ArrowDown: this.focusDown.bind(this)
    }, this.rowCount = Math.ceil(t / e), this.columnCount = e, this.focusedRow = o, this.focusedColumn = i, this.emojiCount = t, this.wrap = r, this.handleKeyDown = this.handleKeyDown.bind(this);
  }
  destroy() {
    this.events.removeAll();
  }
  on(e, t) {
    this.events.on(e, t);
  }
  handleKeyDown(e) {
    e.key in this.keyHandlers && (e.preventDefault(), this.keyHandlers[e.key]());
  }
  setCell(e, t, o = !0) {
    const i = this.getIndex();
    this.focusedRow = e, t !== void 0 && (this.focusedColumn = Math.min(this.columnCount, t)), (this.focusedRow >= this.rowCount || this.getIndex() >= this.emojiCount) && (this.focusedRow = this.rowCount - 1, this.focusedColumn = this.emojiCount % this.columnCount - 1), this.events.emit("focus:change", { from: i, to: this.getIndex(), performFocus: o });
  }
  setFocusedIndex(e, t = !0) {
    const o = Math.floor(e / this.columnCount), i = e % this.columnCount;
    this.setCell(o, i, t);
  }
  focusNext() {
    this.focusedColumn < this.columnCount - 1 && this.getIndex() < this.emojiCount - 1 ? this.setCell(this.focusedRow, this.focusedColumn + 1) : this.focusedRow < this.rowCount - 1 ? this.setCell(this.focusedRow + 1, 0) : this.wrap ? this.setCell(0, 0) : this.events.emit("focus:overflow", 0);
  }
  focusPrevious() {
    this.focusedColumn > 0 ? this.setCell(this.focusedRow, this.focusedColumn - 1) : this.focusedRow > 0 ? this.setCell(this.focusedRow - 1, this.columnCount - 1) : this.wrap ? this.setCell(this.rowCount - 1, this.columnCount - 1) : this.events.emit("focus:underflow", this.columnCount - 1);
  }
  focusUp() {
    this.focusedRow > 0 ? this.setCell(this.focusedRow - 1, this.focusedColumn) : this.events.emit("focus:underflow", this.focusedColumn);
  }
  focusDown() {
    this.focusedRow < this.rowCount - 1 ? this.setCell(this.focusedRow + 1, this.focusedColumn) : this.events.emit("focus:overflow", this.focusedColumn);
  }
  focusToIndex(e) {
    this.setCell(Math.floor(e / this.columnCount), e % this.columnCount);
  }
  getIndex() {
    return this.focusedRow * this.columnCount + this.focusedColumn;
  }
  getCell() {
    return { row: this.focusedRow, column: this.focusedColumn };
  }
  getRowCount() {
    return this.rowCount;
  }
}
const Dt = new u(({ classes: s }) => `
  <div class="${s.emojiContainer}">
    <div data-placeholder="emojis"></div>
  </div>
`), Bt = p("emojiContainer");
class $ extends c {
  constructor({ emojis: e, showVariants: t, preview: o = !0, lazyLoader: i, category: r, fullHeight: a = !1 }) {
    super({ template: Dt, classes: Bt }), this.fullHeight = !1, this.showVariants = t, this.lazyLoader = i, this.preview = o, this.emojis = e, this.category = r, this.fullHeight = a, this.setFocus = this.setFocus.bind(this), this.triggerNextCategory = this.triggerNextCategory.bind(this), this.triggerPreviousCategory = this.triggerPreviousCategory.bind(this);
  }
  initialize() {
    this.grid = new Vt(this.options.emojisPerRow, this.emojiCount, 0, 0, !this.category), this.grid.on("focus:change", this.setFocus), this.grid.on("focus:overflow", this.triggerNextCategory), this.grid.on("focus:underflow", this.triggerPreviousCategory), this.uiEvents = [
      c.uiEvent("click", this.selectEmoji),
      c.uiEvent("keydown", this.grid.handleKeyDown)
    ], this.preview && this.uiEvents.push(
      c.uiEvent("mouseover", this.showPreview),
      c.uiEvent("mouseout", this.hidePreview),
      c.uiEvent("focus", this.showPreview, { capture: !0 }),
      c.uiEvent("blur", this.hidePreview, { capture: !0 })
    ), super.initialize();
  }
  setFocusedView(e, t) {
    if (!!e)
      if (typeof e == "string") {
        const o = this.emojis.findIndex((i) => i.emoji === e);
        this.grid.setFocusedIndex(o, !1), setTimeout(() => {
          var n, l, m, d;
          const i = this.emojiViews[o].el;
          i.scrollIntoView();
          const r = (n = i.parentElement) == null ? void 0 : n.previousElementSibling, a = (m = (l = i.parentElement) == null ? void 0 : l.parentElement) == null ? void 0 : m.parentElement;
          a.scrollTop -= (d = r == null ? void 0 : r.offsetHeight) != null ? d : 0;
        });
      } else
        e.row === "first" || e.row === 0 ? this.grid.setCell(0, e.offset, t) : e.row === "last" && this.grid.setCell(this.grid.getRowCount() - 1, e.offset, t);
  }
  setActive(e, t, o) {
    var i;
    e ? this.setFocusedView(t, o) : (i = this.emojiViews[this.grid.getIndex()]) == null || i.deactivateFocus();
  }
  renderSync() {
    return this.emojiViews = this.emojis.map(
      (e) => this.viewFactory.create(Te, {
        emoji: e,
        category: this.category,
        lazyLoader: this.lazyLoader,
        renderer: this.renderer
      })
    ), this.emojiElements = this.emojiViews.map((e) => e.renderSync()), super.renderSync({
      emojis: this.emojiElements,
      i18n: this.i18n
    });
  }
  destroy() {
    super.destroy(), this.emojiViews.forEach((e) => e.destroy()), this.grid.destroy();
  }
  triggerPreviousCategory(e) {
    this.events.emit("category:previous", e);
  }
  triggerNextCategory(e) {
    this.category && this.events.emit("category:next", e);
  }
  setFocus({ from: e, to: t, performFocus: o }) {
    var i, r;
    (i = this.emojiViews[e]) == null || i.deactivateFocus(), (r = this.emojiViews[t]) == null || r.activateFocus(o);
  }
  selectEmoji(e) {
    e.stopPropagation();
    const t = q(e, this.emojis);
    t && this.events.emit("emoji:select", {
      emoji: t,
      showVariants: this.showVariants
    });
  }
  showPreview(e) {
    const o = e.target.closest("button"), i = o == null ? void 0 : o.firstElementChild, r = q(e, this.emojis);
    r && this.events.emit("preview:show", r, i == null ? void 0 : i.cloneNode(!0));
  }
  hidePreview(e) {
    q(e, this.emojis) && this.events.emit("preview:hide");
  }
  get emojiCount() {
    return this.emojis.length;
  }
}
const Nt = new u(({ classes: s, category: e, pickerId: t, icon: o, i18n: i }) => `
  <section class="${s.emojiCategory}" role="tabpanel" aria-labelledby="${t}-category-${e.key}">
    <h3 data-category="${e.key}" class="${s.categoryName}">
      <i data-icon="${o}"></i>
      ${i.get(`categories.${e.key}`, e.message || e.key)}
    </h3>
    <div data-view="emojis" data-render="sync"></div>
  </section>
`);
class Ot extends he {
  constructor({ category: e, showVariants: t, lazyLoader: o, emojiVersion: i }) {
    super({ category: e, showVariants: t, lazyLoader: o, template: Nt }), this.showVariants = t, this.lazyLoader = o, this.emojiVersion = i;
  }
  initialize() {
    this.uiElements = { ...this.baseUIElements }, super.initialize();
  }
  async render() {
    await this.emojiDataPromise;
    const e = await this.emojiData.getEmojis(this.category, this.emojiVersion);
    return this.emojiContainer = this.viewFactory.create($, {
      emojis: e,
      showVariants: this.showVariants,
      lazyLoader: this.lazyLoader,
      category: this.category.key
    }), super.render({
      category: this.category,
      emojis: this.emojiContainer,
      emojiCount: e.length,
      icon: O[this.category.key]
    });
  }
}
class Ht extends $ {
  constructor({ category: e, emojis: t, preview: o = !0, lazyLoader: i }) {
    super({ category: e, emojis: t, showVariants: !1, preview: o, lazyLoader: i });
  }
  async addOrUpdate(e) {
    const t = this.el.querySelector(`[data-emoji="${e.emoji}"]`);
    t && (this.el.removeChild(t), this.emojis = this.emojis.filter((i) => i !== e));
    const o = this.viewFactory.create(Te, { emoji: e });
    if (this.el.insertBefore(o.renderSync(), this.el.firstChild), this.emojis = [
      e,
      ...this.emojis.filter((i) => i !== e)
    ], this.emojis.length > this.options.maxRecents) {
      this.emojis = this.emojis.slice(0, this.options.maxRecents);
      const i = this.el.childElementCount - this.options.maxRecents;
      for (let r = 0; r < i; r++)
        this.el.lastElementChild && this.el.removeChild(this.el.lastElementChild);
    }
  }
}
const Kt = new u(({ emojiCount: s, classes: e, category: t, pickerId: o, icon: i, i18n: r }) => `
  <section class="${e.emojiCategory}" role="tabpanel" aria-labelledby="${o}-category-${t.key}">
    <h3 data-category="${t.key}" class="${e.categoryName}">
      <i data-icon="${i}"></i>
      ${r.get(`categories.${t.key}`, t.message || t.key)}
    </h3>
    <div data-empty="${s === 0}" class="${e.recentEmojis}">
      <div data-view="emojis" data-render="sync"></div>
    </div>
    <div class="${e.noRecents}">
      ${r.get("recents.none")}
    </div>
  </section>
`, { mode: "async" });
class Ut extends he {
  constructor({ category: e, lazyLoader: t, provider: o }) {
    super({ category: e, showVariants: !1, lazyLoader: t, template: Kt }), this.provider = o;
  }
  initialize() {
    this.uiElements = {
      ...this.baseUIElements,
      recents: c.byClass(ie.recentEmojis)
    }, this.appEvents = {
      "recent:add": this.addRecent
    }, super.initialize();
  }
  async addRecent(e) {
    await this.emojiContainer.addOrUpdate(e), this.ui.recents.dataset.empty = "false";
  }
  async render() {
    var t;
    const e = (t = this.provider) == null ? void 0 : t.getRecents(this.options.maxRecents);
    return this.emojiContainer = this.viewFactory.create(Ht, {
      emojis: e,
      showVariants: !1,
      lazyLoader: this.lazyLoader,
      category: this.category.key
    }), await super.render({
      category: this.category,
      emojis: this.emojiContainer,
      emojiCount: e.length,
      icon: O[this.category.key]
    }), this.el;
  }
}
const qt = new u(({ classes: s, category: e, pickerId: t, icon: o, i18n: i }) => `
  <section class="${s.emojiCategory}" role="tabpanel" aria-labelledby="${t}-category-${e.key}">
    <h3 data-category="${e.key}" class="${s.categoryName}">
      <i data-icon="${o}"></i>
      ${i.get(`categories.${e.key}`, e.message || e.key)}
    </h3>
    <div data-view="emojis" data-render="sync"></div>
  </section>
`);
class Wt extends he {
  constructor({ category: e, lazyLoader: t }) {
    super({ template: qt, showVariants: !1, lazyLoader: t, category: e });
  }
  initialize() {
    this.uiElements = { ...this.baseUIElements }, super.initialize();
  }
  async render() {
    return this.emojiContainer = this.viewFactory.create($, {
      emojis: this.customEmojis,
      showVariants: this.showVariants,
      lazyLoader: this.lazyLoader,
      category: this.category.key
    }), super.render({
      category: this.category,
      emojis: this.emojiContainer,
      emojiCount: this.customEmojis.length,
      icon: O[this.category.key]
    });
  }
}
class Re {
  constructor() {
    this.elements = /* @__PURE__ */ new Map();
  }
  lazyLoad(e, t) {
    return this.elements.set(e, t), e;
  }
  observe(e) {
    if (window.IntersectionObserver) {
      const t = new IntersectionObserver(
        (o) => {
          o.filter((i) => i.intersectionRatio > 0).map((i) => i.target).forEach((i) => {
            const r = this.elements.get(i);
            r == null || r(), t.unobserve(i);
          });
        },
        {
          root: e
        }
      );
      this.elements.forEach((o, i) => {
        t.observe(i);
      });
    } else
      this.elements.forEach((t) => {
        t();
      });
  }
}
const ye = p("emojiArea"), Gt = new u(({ classes: s }) => `
  <div class="${s.emojiArea}">
    <div data-placeholder="emojis"></div>
  </div>
`, { mode: "async" }), Jt = {
  recents: Ut,
  custom: Wt
};
function Zt(s) {
  return Jt[s.key] || Ot;
}
function Yt(s) {
  return !s || s === "button" ? {
    row: "first",
    offset: 0
  } : s;
}
class Qt extends c {
  constructor({ categoryTabs: e, categories: t, emojiVersion: o }) {
    super({ template: Gt, classes: ye }), this.selectedCategory = 0, this.scrollListenerState = "active", this.lazyLoader = new Re(), this.categoryTabs = e, this.categories = t, this.emojiVersion = o, this.handleScroll = He(this.handleScroll.bind(this), 100);
  }
  initialize() {
    this.appEvents = {
      "category:select": this.handleCategorySelect,
      "category:previous": this.focusPreviousCategory,
      "category:next": this.focusNextCategory,
      "focus:change": this.updateFocusedCategory
    }, this.uiElements = { emojis: c.byClass(ye.emojiArea) }, this.uiEvents = [c.uiEvent("scroll", this.handleScroll)], super.initialize();
  }
  get focusableEmoji() {
    return this.el.querySelector('[tabindex="0"]');
  }
  async render() {
    this.emojiCategories = this.categories.map(this.createCategory, this);
    const e = {};
    return this.categories.forEach((t, o) => {
      e[`emojis-${t.key}`] = this.emojiCategories[o];
    }), await super.render({
      emojis: await Promise.all(this.emojiCategories.map((t) => t.render()))
    }), this.lazyLoader.observe(this.el), this.el;
  }
  destroy() {
    super.destroy(), this.emojiCategories.forEach((e) => {
      var t;
      (t = this.observer) == null || t.unobserve(e.el), e.destroy();
    });
  }
  handleCategorySelect(e, t) {
    this.el.style.overflow = "hidden", this.selectCategory(e, t), this.el.style.overflow = "auto";
  }
  createCategory(e) {
    const t = Zt(e);
    return this.viewFactory.create(t, {
      category: e,
      showVariants: !0,
      lazyLoader: this.lazyLoader,
      emojiVersion: this.emojiVersion,
      provider: this.options.recentsProvider
    });
  }
  determineInitialCategory() {
    var e;
    return this.options.initialCategory && this.categories.find((t) => t.key === this.options.initialCategory) ? this.options.initialCategory : (e = this.categories.find((t) => t.key !== "recents")) == null ? void 0 : e.key;
  }
  determineFocusTarget(e) {
    const t = this.emojiCategories.find((o) => o.category.key === e);
    return this.options.initialEmoji && (t == null ? void 0 : t.el.querySelector(`[data-emoji="${this.options.initialEmoji}"]`)) ? this.options.initialEmoji : "button";
  }
  reset(e = !0) {
    this.events.emit("preview:hide");
    const t = this.determineInitialCategory();
    t && (this.selectCategory(t, {
      focus: this.determineFocusTarget(t),
      performFocus: e,
      scroll: "jump"
    }), this.selectedCategory = this.getCategoryIndex(t));
  }
  getCategoryIndex(e) {
    return this.categories.findIndex((t) => t.key === e);
  }
  focusPreviousCategory(e) {
    this.selectedCategory > 0 && this.focusCategory(this.selectedCategory - 1, { row: "last", offset: e != null ? e : this.options.emojisPerRow });
  }
  focusNextCategory(e) {
    this.selectedCategory < this.categories.length - 1 && this.focusCategory(this.selectedCategory + 1, { row: "first", offset: e != null ? e : 0 });
  }
  focusCategory(e, t) {
    this.selectCategory(e, {
      focus: t,
      performFocus: !0
    });
  }
  async selectCategory(e, t = {}) {
    var l;
    this.scrollListenerState = "suspend";
    const { focus: o, performFocus: i, scroll: r } = {
      performFocus: !1,
      ...t
    };
    this.emojiCategories[this.selectedCategory].setActive(!1);
    const a = this.selectedCategory = typeof e == "number" ? e : this.getCategoryIndex(e);
    (l = this.categoryTabs) == null || l.setActiveTab(this.selectedCategory, {
      performFocus: i,
      scroll: o === "button"
    });
    const n = this.emojiCategories[a].el.offsetTop;
    this.emojiCategories[a].setActive(!0, Yt(o), o !== "button" && i), r && (this.el.scrollTop = n), this.scrollListenerState = "resume";
  }
  updateFocusedCategory(e) {
    var t;
    this.categories[this.selectedCategory].key !== e && (this.scrollListenerState = "suspend", this.selectedCategory = this.getCategoryIndex(e), (t = this.categoryTabs) == null || t.setActiveTab(this.selectedCategory, {
      changeFocusable: !1,
      performFocus: !1
    }), this.scrollListenerState = "resume");
  }
  handleScroll() {
    if (this.scrollListenerState === "suspend" || !this.categoryTabs)
      return;
    if (this.scrollListenerState === "resume") {
      this.scrollListenerState = "active";
      return;
    }
    const e = this.el.scrollTop, t = this.el.scrollHeight - this.el.offsetHeight, o = this.emojiCategories.findIndex((r, a) => {
      var n;
      return e < ((n = this.emojiCategories[a + 1]) == null ? void 0 : n.el.offsetTop);
    }), i = {
      changeFocusable: !1,
      performFocus: !1,
      scroll: !1
    };
    e === 0 ? this.categoryTabs.setActiveTab(0, i) : Math.floor(e) === Math.floor(t) || o < 0 ? this.categoryTabs.setActiveTab(this.categories.length - 1, i) : this.categoryTabs.setActiveTab(o, i);
  }
}
const Xt = new u(({ classList: s, classes: e, icon: t, message: o }) => `
<div class="${s}" role="alert">
  <div class="${e.iconContainer}"><i data-size="10x" data-icon="${t}"></i></div>
  <h3 class="${e.title}">${o}</h3>
</div>
`), fe = p("error", "iconContainer", "title");
class re extends c {
  constructor({ message: e, icon: t = "warning", template: o = Xt, className: i }) {
    super({ template: o, classes: fe }), this.message = e, this.icon = t, this.className = i;
  }
  renderSync() {
    const e = [fe.error, this.className].join(" ").trim();
    return super.renderSync({ message: this.message, icon: this.icon, classList: e });
  }
}
const es = new u(({ classList: s, classes: e, icon: t, i18n: o, message: i }) => `
  <div class="${s}" role="alert">
    <div class="${e.icon}"><i data-size="10x" data-icon="${t}"></i></div>
    <h3 class="${e.title}">${i}</h3>
    <button type="button">${o.get("retry")}</button>
  </div>
`), ts = p("dataError");
class ss extends re {
  constructor({ message: e }) {
    super({ message: e, template: es, className: ts.dataError });
  }
  initialize() {
    this.uiElements = { retryButton: "button" }, this.uiEvents = [c.childEvent("retryButton", "click", this.onRetry)], super.initialize();
  }
  async onRetry() {
    this.emojiData ? await this.emojiData.delete() : await this.options.dataStore.deleteDatabase(this.options.locale), this.events.emit("reinitialize");
    const e = await ce(this.options.locale, this.options.dataStore, this.options.messages, this.options.emojiData, this.emojiData);
    this.viewFactory.setEmojiData(e), this.events.emit("data:ready", e);
  }
}
const j = p(
  "preview",
  "previewEmoji",
  "previewName",
  "tagList",
  "tag"
), os = new u(({ classes: s, tag: e }) => `
  <li class="${s.tag}">${e}</li>
`), is = new u(({ classes: s }) => `
  <div class="${s.preview}">
    <div class="${s.previewEmoji}"></div>
    <div class="${s.previewName}"></div>
    <ul class="${s.tagList}"></ul>
  </div>
`);
class rs extends c {
  constructor() {
    super({ template: is, classes: j });
  }
  initialize() {
    this.uiElements = {
      emoji: c.byClass(j.previewEmoji),
      name: c.byClass(j.previewName),
      tagList: c.byClass(j.tagList)
    }, this.appEvents = {
      "preview:show": this.showPreview,
      "preview:hide": this.hidePreview
    }, super.initialize();
  }
  showPreview(e, t) {
    if (w(this.ui.emoji, t), this.ui.name.textContent = e.label, e.tags) {
      this.ui.tagList.style.display = "flex";
      const o = e.tags.map((i) => os.renderSync({ tag: i, classes: j }));
      w(this.ui.tagList, ...o);
    }
  }
  hidePreview() {
    V(this.ui.emoji), V(this.ui.name), V(this.ui.tagList);
  }
}
const as = new u(({ classes: s, i18n: e }) => `
  <button title="${e.get("search.clear")}" class="${s.clearSearchButton}">
    <i data-icon="xmark"></i>
  </button>
`), ns = new u(({ classes: s, i18n: e }) => `
<div class="${s.searchContainer}">
  <input class="${s.searchField}" placeholder="${e.get("search")}">
  <span class="${s.searchAccessory}"></span>
</div>
`, { mode: "async" }), _ = p(
  "searchContainer",
  "searchField",
  "clearButton",
  "searchAccessory",
  "clearSearchButton",
  "notFound"
);
class cs extends c {
  constructor({ categories: e, emojiVersion: t }) {
    super({ template: ns, classes: _ }), this.categories = e.filter((o) => o.key !== "recents"), this.emojiVersion = t, this.search = Ke(this.search.bind(this), 100);
  }
  initialize() {
    this.uiElements = {
      searchField: c.byClass(_.searchField),
      searchAccessory: c.byClass(_.searchAccessory)
    }, this.uiEvents = [
      c.childEvent("searchField", "keydown", this.onKeyDown),
      c.childEvent("searchField", "input", this.onSearchInput)
    ], super.initialize();
  }
  async render() {
    return await super.render(), this.searchIcon = Pe("search"), this.notFoundMessage = this.viewFactory.create(re, {
      message: this.i18n.get("search.notFound"),
      className: _.notFound,
      icon: "sad"
    }), this.notFoundMessage.renderSync(), this.errorMessage = this.viewFactory.create(re, { message: this.i18n.get("search.error") }), this.errorMessage.renderSync(), this.clearSearchButton = as.render({
      classes: _,
      i18n: this.i18n
    }), this.clearSearchButton.addEventListener("click", (e) => this.onClearSearch(e)), this.searchField = this.ui.searchField, this.showSearchIcon(), this.el;
  }
  showSearchIcon() {
    this.showSearchAccessory(this.searchIcon);
  }
  showClearSearchButton() {
    this.showSearchAccessory(this.clearSearchButton);
  }
  showSearchAccessory(e) {
    w(this.ui.searchAccessory, e);
  }
  clear() {
    this.searchField.value = "", this.showSearchIcon();
  }
  focus() {
    this.searchField.focus();
  }
  onClearSearch(e) {
    var t;
    e.stopPropagation(), this.searchField.value = "", (t = this.resultsContainer) == null || t.destroy(), this.resultsContainer = null, this.showSearchIcon(), this.events.emit("content:show"), this.searchField.focus();
  }
  handleResultsKeydown(e) {
    this.resultsContainer && e.key === "Escape" && this.onClearSearch(e);
  }
  onKeyDown(e) {
    var t;
    e.key === "Escape" && this.searchField.value ? this.onClearSearch(e) : (e.key === "Enter" || e.key === "ArrowDown") && this.resultsContainer && (e.preventDefault(), (t = this.resultsContainer.el.querySelector('[tabindex="0"]')) == null || t.focus());
  }
  onSearchInput(e) {
    this.searchField.value ? (this.showClearSearchButton(), this.search()) : this.onClearSearch(e);
  }
  async search() {
    var e;
    if (!!this.searchField.value)
      try {
        const t = await this.emojiData.searchEmojis(
          this.searchField.value,
          this.customEmojis,
          this.emojiVersion,
          this.categories
        );
        if (this.events.emit("preview:hide"), t.length) {
          const o = new Re();
          this.resultsContainer = this.viewFactory.create($, {
            emojis: t,
            fullHeight: !0,
            showVariants: !0,
            lazyLoader: o
          }), this.resultsContainer.renderSync(), (e = this.resultsContainer) != null && e.el && (o.observe(this.resultsContainer.el), this.resultsContainer.setActive(!0, { row: 0, offset: 0 }, !1), this.resultsContainer.el.addEventListener("keydown", (i) => this.handleResultsKeydown(i)), this.events.emit("content:show", this.resultsContainer));
        } else
          this.events.emit("content:show", this.notFoundMessage);
      } catch {
        this.events.emit("content:show", this.errorMessage);
      }
  }
}
const ls = new u(({ classes: s }) => `
  <div class="${s.variantOverlay}">
    <div class="${s.variantPopup}">
      <div data-view="emojis" data-render="sync"></div>
    </div>
  </div>
`), ve = p(
  "variantOverlay",
  "variantPopup"
), J = {
  easing: "ease-in-out",
  duration: 250,
  fill: "both"
}, we = {
  opacity: [0, 1]
}, be = {
  opacity: [0, 1],
  transform: ["scale3d(0.8, 0.8, 0.8)", "scale3d(1, 1, 1)"]
};
class hs extends c {
  constructor({ emoji: e, parent: t }) {
    super({ template: ls, classes: ve, parent: t }), this.focusedEmojiIndex = 0, this.focusTrap = new st(), this.animateShow = () => Promise.all([
      I(this.el, we, J, this.options),
      I(this.ui.popup, be, J, this.options)
    ]), this.emoji = e;
  }
  initialize() {
    this.uiElements = {
      popup: c.byClass(ve.variantPopup)
    }, this.uiEvents = [
      c.uiEvent("click", this.handleClick),
      c.uiEvent("keydown", this.handleKeydown)
    ], super.initialize();
  }
  animateHide() {
    const e = { ...J, direction: "reverse" };
    return Promise.all([
      I(this.el, we, e, this.options),
      I(this.ui.popup, be, e, this.options)
    ]);
  }
  async hide() {
    await this.animateHide(), this.events.emit("variantPopup:hide");
  }
  handleKeydown(e) {
    e.key === "Escape" && (this.hide(), e.stopPropagation());
  }
  handleClick(e) {
    this.ui.popup.contains(e.target) || this.hide();
  }
  getEmoji(e) {
    return this.renderedEmojis[e];
  }
  setFocusedEmoji(e) {
    const t = this.getEmoji(this.focusedEmojiIndex);
    t.tabIndex = -1, this.focusedEmojiIndex = e;
    const o = this.getEmoji(this.focusedEmojiIndex);
    o.tabIndex = 0, o.focus();
  }
  destroy() {
    this.emojiContainer.destroy(), this.focusTrap.deactivate(), super.destroy();
  }
  renderSync() {
    const e = {
      ...this.emoji,
      skins: null
    }, t = (this.emoji.skins || []).map((i) => ({
      ...i,
      label: this.emoji.label,
      tags: this.emoji.tags
    })), o = [e, ...t];
    return this.emojiContainer = this.viewFactory.create($, {
      emojis: o,
      preview: !1
    }), super.renderSync({ emojis: this.emojiContainer }), o.length < this.options.emojisPerRow && this.el.style.setProperty("--emojis-per-row", o.length.toString()), this.el;
  }
  activate() {
    this.emojiContainer.setActive(!0, { row: 0, offset: 0 }, !0), this.focusTrap.activate(this.el);
  }
}
const ds = new u(({ classes: s, i18n: e, category: t, pickerId: o, icon: i }) => `
<li class="${s.categoryTab}">
  <button
    aria-selected="false"
    role="tab"
    class="${s.categoryButton}"
    tabindex="-1"
    title="${e.get(`categories.${t.key}`, t.message || t.key)}"
    type="button"
    data-category="${t.key}"
    id="${o}-category-${t.key}"
  >
    <i data-icon="${i}"></i>
</li>
`), Z = p(
  "categoryTab",
  "categoryTabActive",
  "categoryButton"
);
class ms extends c {
  constructor({ category: e, icon: t }) {
    super({ template: ds, classes: Z }), this.isActive = !1, this.category = e, this.icon = t;
  }
  initialize() {
    this.uiElements = {
      button: c.byClass(Z.categoryButton)
    }, this.uiEvents = [
      c.childEvent("button", "click", this.selectCategory),
      c.childEvent("button", "focus", this.selectCategory)
    ], super.initialize();
  }
  renderSync() {
    return super.renderSync({
      category: this.category,
      icon: this.icon
    }), this.ui.button.ariaSelected = "false", this.el;
  }
  setActive(e, t = {}) {
    const { changeFocusable: o, performFocus: i, scroll: r } = {
      changeFocusable: !0,
      performFocus: !0,
      scroll: !0,
      ...t
    };
    this.el.classList.toggle(Z.categoryTabActive, e), o && (this.ui.button.tabIndex = e ? 0 : -1, this.ui.button.ariaSelected = e.toString()), e && i && (this.ui.button.focus(), r && this.events.emit("category:select", this.category.key, { scroll: "animate", focus: "button", performFocus: !1 })), this.isActive = e;
  }
  selectCategory() {
    this.isActive || this.events.emit("category:select", this.category.key, { scroll: "animate", focus: "button", performFocus: !0 });
  }
}
const us = new u(({ classes: s }) => `
  <div class="${s.categoryButtonsContainer}">
    <ul role="tablist" class="${s.categoryButtons}">
      <div data-placeholder="tabs"></div>
    </ul>
  </div>
`), ps = p("categoryButtons", "categoryButtonsContainer");
class gs extends c {
  constructor({ categories: e }) {
    super({ template: us, classes: ps }), this.activeCategoryIndex = 0, this.categories = e;
  }
  initialize() {
    this.keyBindings = {
      ArrowLeft: this.stepSelectedTab(-1),
      ArrowRight: this.stepSelectedTab(1)
    }, this.uiEvents = [
      c.uiEvent("scroll", this.checkOverflow)
    ], super.initialize();
  }
  checkOverflow() {
    const e = Math.abs(this.el.scrollLeft - (this.el.scrollWidth - this.el.offsetWidth)) > 1, t = this.el.scrollLeft > 0;
    this.el.className = "categoryButtonsContainer", t && e ? this.el.classList.add("has-overflow-both") : t ? this.el.classList.add("has-overflow-left") : e && this.el.classList.add("has-overflow-right");
  }
  renderSync() {
    return this.tabViews = this.categories.map((e) => this.viewFactory.create(ms, { category: e, icon: O[e.key] })), super.renderSync({
      tabs: this.tabViews.map((e) => e.renderSync())
    }), this.el;
  }
  get currentCategory() {
    return this.categories[this.activeCategoryIndex];
  }
  get currentTabView() {
    return this.tabViews[this.activeCategoryIndex];
  }
  setActiveTab(e, t = {}) {
    this.checkOverflow();
    const o = this.currentTabView, i = this.tabViews[e];
    o.setActive(!1, t), i.setActive(!0, t), this.activeCategoryIndex = e;
  }
  getTargetCategory(e) {
    return e < 0 ? this.categories.length - 1 : e >= this.categories.length ? 0 : e;
  }
  stepSelectedTab(e) {
    return () => {
      const t = this.activeCategoryIndex + e;
      this.setActiveTab(this.getTargetCategory(t), {
        changeFocusable: !0,
        performFocus: !0
      });
    };
  }
}
const ys = [
  { version: 15, emoji: String.fromCodePoint(129768) },
  { version: 14, emoji: String.fromCodePoint(128733) },
  { version: 13, emoji: String.fromCodePoint(129729) },
  { version: 12, emoji: String.fromCodePoint(129449) },
  { version: 11, emoji: String.fromCodePoint(129463) },
  { version: 5, emoji: String.fromCodePoint(129322) },
  { version: 4, emoji: String.fromCodePoint(9877) },
  { version: 3, emoji: String.fromCodePoint(129314) },
  { version: 2, emoji: String.fromCodePoint(128488) },
  { version: 1, emoji: String.fromCodePoint(128512) }
];
function fs() {
  var e;
  const s = ys.find((t) => vs(t.emoji));
  return (e = s == null ? void 0 : s.version) != null ? e : 1;
}
function vs(s) {
  const e = document.createElement("canvas").getContext("2d");
  if (e)
    return e.textBaseline = "top", e.font = "32px Arial", e.fillText(s, 0, 0), e.getImageData(16, 16, 1, 1).data[0] !== 0;
}
function Y(s, e) {
  return Array.from({ length: s }, () => e).join("");
}
function ws({ showHeader: s, classes: e }) {
  return s ? `
    <header class="${e.header}">
      <div data-view="search"></div>
      <div data-view="categoryTabs" data-render="sync"></div>
    </header>
  ` : "";
}
function bs(s) {
  const { classes: e, theme: t, className: o = "" } = s;
  return `
    <div class="picmo__picker ${e.picker} ${t} ${o}">
      ${ws(s)}
      <div class="${e.content}">
        <div data-view="emojiArea"></div>
      </div>
      <div data-view="preview"></div>
    </div>
  `;
}
function Cs(s) {
  const { emojiCount: e, classes: t, theme: o, className: i, categoryCount: r } = s, a = ({ showSearch: d, classes: h }) => d ? `
    <div class="${h.searchSkeleton}">
      <div class="${h.searchInput} ${h.placeholder}"></div>
    </div>
  ` : "", n = ({ showCategoryTabs: d, classes: h }) => d ? `
    <div class="${h.categoryTabsSkeleton}">
      ${Y(r, `<div class="${h.placeholder} ${h.categoryTab}"></div>`)}
    </div>
  ` : "", l = ({ showHeader: d, classes: h }) => d ? `
    <header class="${h.headerSkeleton}">
      ${a(s)}
      ${n(s)}
    </header>
  ` : "", m = ({ showPreview: d, classes: h }) => d ? `
    <div class="${h.previewSkeleton}">
      <div class="${h.placeholder} ${h.previewEmoji}"></div>
      <div class="${h.placeholder} ${h.previewName}"></div>
      <ul class="${h.tagList}">
        ${Y(3, `<li class="${h.placeholder} ${h.tag}"></li>`)}
      </ul>
    </div>
  ` : "";
  return `
    <div class="picmo__picker ${t.skeleton} ${t.picker} ${o} ${i}">
      ${l(s)}
      <div class="${t.contentSkeleton}">
        <div class="${t.placeholder} ${t.categoryName}"></div>
        <div class="${t.emojiGrid}">
          ${Y(e, `<div class="${t.placeholder} ${t.emoji}"></div>`)}
        </div>
      </div>
      ${m(s)}
    </div>
  `;
}
const js = new u((s) => s.isLoaded ? bs(s) : Cs(s)), T = p(
  "picker",
  "skeleton",
  "placeholder",
  "searchSkeleton",
  "searchInput",
  "categoryTabsSkeleton",
  "headerSkeleton",
  "categoryTab",
  "contentSkeleton",
  "categoryName",
  "emojiGrid",
  "emoji",
  "previewSkeleton",
  "previewEmoji",
  "previewName",
  "tagList",
  "tag",
  "overlay",
  "content",
  "fullHeight",
  "pluginContainer",
  "header"
), R = {
  emojisPerRow: "--emojis-per-row",
  visibleRows: "--row-count",
  emojiSize: "--emoji-size"
};
class _s extends c {
  constructor() {
    super({ template: js, classes: T }), this.pickerReady = !1, this.externalEvents = new Tt(), this.updaters = {
      styleProperty: (e) => (t) => this.el.style.setProperty(R[e], t.toString()),
      theme: (e) => {
        const t = this.options.theme, o = this.el.closest(`.${t}`);
        this.el.classList.remove(t), o == null || o.classList.remove(t), this.el.classList.add(e), o == null || o.classList.add(e);
      },
      className: (e) => {
        this.options.className && this.el.classList.remove(this.options.className), this.el.classList.add(e);
      },
      emojisPerRow: this.updateStyleProperty.bind(this, "emojisPerRow"),
      emojiSize: this.updateStyleProperty.bind(this, "emojiSize"),
      visibleRows: this.updateStyleProperty.bind(this, "visibleRows")
    };
  }
  initialize() {
    this.uiElements = {
      pickerContent: c.byClass(T.content),
      header: c.byClass(T.header)
    }, this.uiEvents = [
      c.uiEvent("keydown", this.handleKeyDown)
    ], this.appEvents = {
      error: this.onError,
      reinitialize: this.reinitialize,
      "data:ready": this.onDataReady,
      "content:show": this.showContent,
      "variantPopup:hide": this.hideVariantPopup,
      "emoji:select": this.selectEmoji
    }, super.initialize(), this.options.recentsProvider;
  }
  destroy() {
    var e, t;
    super.destroy(), (e = this.search) == null || e.destroy(), this.emojiArea.destroy(), (t = this.categoryTabs) == null || t.destroy(), this.events.removeAll(), this.externalEvents.removeAll();
  }
  clearRecents() {
    this.options.recentsProvider.clear();
  }
  addEventListener(e, t) {
    this.externalEvents.on(e, t);
  }
  removeEventListener(e, t) {
    this.externalEvents.off(e, t);
  }
  initializePickerView() {
    this.pickerReady && (this.showContent(), this.emojiArea.reset(!1));
  }
  handleKeyDown(e) {
    const t = e.ctrlKey || e.metaKey;
    e.key === "s" && t && this.search && (e.preventDefault(), this.search.focus());
  }
  buildChildViews() {
    return this.options.showPreview && (this.preview = this.viewFactory.create(rs)), this.options.showSearch && (this.search = this.viewFactory.create(cs, {
      categories: this.categories,
      emojiVersion: this.emojiVersion
    })), this.options.showCategoryTabs && (this.categoryTabs = this.viewFactory.create(gs, {
      categories: this.categories
    })), this.currentView = this.emojiArea = this.viewFactory.create(Qt, {
      categoryTabs: this.categoryTabs,
      categories: this.categories,
      emojiVersion: this.emojiVersion
    }), [this.preview, this.search, this.emojiArea, this.categoryTabs];
  }
  setStyleProperties() {
    this.options.showSearch || this.el.style.setProperty("--search-height-full", "0px"), this.options.showCategoryTabs || (this.el.style.setProperty("--category-tabs-height", "0px"), this.el.style.setProperty("--category-tabs-offset", "0px")), this.options.showPreview || this.el.style.setProperty("--emoji-preview-height-full", "0px"), Object.keys(R).forEach((e) => {
      this.options[e] && this.el.style.setProperty(R[e], this.options[e].toString());
    });
  }
  updateStyleProperty(e, t) {
    this.el.style.setProperty(R[e], t.toString());
  }
  reinitialize() {
    this.renderSync();
  }
  onError(e) {
    const t = this.viewFactory.createWithOptions({ data: !1 }, ss, { message: this.i18n.get("error.load") }), o = this.el.offsetHeight || 375;
    throw this.el.style.height = `${o}px`, w(this.el, t.renderSync()), e;
  }
  async onDataReady(e) {
    const t = this.el;
    try {
      e ? this.emojiData = e : await this.emojiDataPromise, this.options.emojiVersion === "auto" ? this.emojiVersion = fs() || parseFloat(Ve) : this.emojiVersion = this.options.emojiVersion, this.categories = await this.emojiData.getCategories(this.options);
      const [o, i, r, a] = this.buildChildViews();
      await super.render({
        isLoaded: !0,
        search: i,
        categoryTabs: a,
        emojiArea: r,
        preview: o,
        showHeader: Boolean(this.search || this.categoryTabs),
        theme: this.options.theme,
        className: this.options.className
      }), this.el.style.setProperty("--category-count", this.categories.length.toString()), this.pickerReady = !0, t.replaceWith(this.el), this.setStyleProperties(), this.initializePickerView(), this.setInitialFocus(), this.externalEvents.emit("data:ready");
    } catch (o) {
      this.events.emit("error", o);
    }
  }
  renderSync() {
    var t;
    let e = ((t = this.options.categories) == null ? void 0 : t.length) || 10;
    if (this.options.showRecents && (e += 1), super.renderSync({
      isLoaded: !1,
      theme: this.options.theme,
      className: this.options.className,
      showSearch: this.options.showSearch,
      showPreview: this.options.showPreview,
      showCategoryTabs: this.options.showCategoryTabs,
      showHeader: this.options.showSearch || this.options.showCategoryTabs,
      emojiCount: this.options.emojisPerRow * this.options.visibleRows,
      categoryCount: e
    }), this.el.style.setProperty("--category-count", e.toString()), !this.options.rootElement)
      throw new Error("Picker must be given a root element via the rootElement option");
    return w(this.options.rootElement, this.el), this.setStyleProperties(), this.pickerReady && this.initializePickerView(), this.el;
  }
  getInitialFocusTarget() {
    if (typeof this.options.autoFocus < "u")
      switch (this.options.autoFocus) {
        case "emojis":
          return this.emojiArea.focusableEmoji;
        case "search":
          return this.search;
        case "auto":
          return this.search || this.emojiArea.focusableEmoji;
        default:
          return null;
      }
    if (this.options.autoFocusSearch === !0)
      return console.warn("options.autoFocusSearch is deprecated, please use options.focusTarget instead"), this.search;
  }
  setInitialFocus() {
    var e;
    !this.pickerReady || (e = this.getInitialFocusTarget()) == null || e.focus();
  }
  reset(e = !0) {
    var t;
    this.pickerReady && (this.emojiArea.reset(e), this.showContent(this.emojiArea)), (t = this.search) == null || t.clear(), this.hideVariantPopup();
  }
  showContent(e = this.emojiArea) {
    var t, o;
    e !== this.currentView && (this.currentView !== this.emojiArea && ((t = this.currentView) == null || t.destroy()), this.ui.pickerContent.classList.toggle(T.fullHeight, e !== this.emojiArea), w(this.ui.pickerContent, e.el), this.currentView = e, e === this.emojiArea ? (this.emojiArea.reset(), this.categoryTabs && this.ui.header.appendChild(this.categoryTabs.el)) : (o = this.categoryTabs) == null || o.el.remove());
  }
  hideVariantPopup() {
    var e;
    (e = this.variantPopup) == null || e.destroy();
  }
  isPickerClick(e) {
    var r, a;
    const t = e.target, o = this.el.contains(t), i = (a = (r = this.variantPopup) == null ? void 0 : r.el) == null ? void 0 : a.contains(t);
    return o || i;
  }
  async selectEmoji({ emoji: e }) {
    var t, o;
    ((t = e.skins) == null ? void 0 : t.length) && this.options.showVariants && !this.isVariantPopupOpen ? this.showVariantPopup(e) : (await ((o = this.variantPopup) == null ? void 0 : o.animateHide()), this.events.emit("variantPopup:hide"), await this.emitEmoji(e));
  }
  get isVariantPopupOpen() {
    return this.variantPopup && !this.variantPopup.isDestroyed;
  }
  async showVariantPopup(e) {
    const t = document.activeElement;
    this.events.once("variantPopup:hide", () => {
      t == null || t.focus();
    }), this.variantPopup = this.viewFactory.create(hs, { emoji: e, parent: this.el }), this.el.appendChild(this.variantPopup.renderSync()), this.variantPopup.activate();
  }
  async emitEmoji(e) {
    this.externalEvents.emit("emoji:select", await this.renderer.doEmit(e)), this.options.recentsProvider.addOrUpdateRecent(e, this.options.maxRecents), this.events.emit("recent:add", e);
  }
  updateOptions(e) {
    Object.keys(e).forEach((t) => {
      this.updaters[t](e[t]);
    }), Object.assign(this.options, e);
  }
}
class ks {
  constructor({ events: e, i18n: t, renderer: o, emojiData: i, options: r, customEmojis: a = [], pickerId: n }) {
    this.events = e, this.i18n = t, this.renderer = o, this.emojiData = i, this.options = r, this.customEmojis = a, this.pickerId = n;
  }
  setEmojiData(e) {
    this.emojiData = Promise.resolve(e);
  }
  createWithOptions(e = {}, t, ...o) {
    const i = new t(...o);
    return i.setPickerId(this.pickerId), i.setEvents(this.events), i.setI18n(this.i18n), i.setRenderer(this.renderer), e.data !== !1 && i.setEmojiData(this.emojiData), i.setOptions(this.options), i.setCustomEmojis(this.customEmojis), i.viewFactory = this, i.initialize(), i;
  }
  create(e, ...t) {
    return this.createWithOptions({}, e, ...t);
  }
}
var L;
class xs {
  constructor(e = {}) {
    f(this, L, void 0);
    A(this, L, new Map(Object.entries(e)));
  }
  get(e, t = e) {
    return y(this, L).get(e) || t;
  }
}
L = new WeakMap();
function Es(s, e) {
  e === void 0 && (e = {});
  var t = e.insertAt;
  if (!(!s || typeof document > "u")) {
    var o = document.head || document.getElementsByTagName("head")[0], i = document.createElement("style");
    i.type = "text/css", t === "top" && o.firstChild ? o.insertBefore(i, o.firstChild) : o.appendChild(i), i.styleSheet ? i.styleSheet.cssText = s : i.appendChild(document.createTextNode(s));
  }
}
function Ss() {
  let s = !1;
  return function(t) {
    At.injectStyles && !s && (Es(t), s = !0);
  };
}
const Fs = `.picmo__picker .picmo__icon{width:1.25em;height:1em;fill:currentColor}.picmo__icon-small{font-size:.8em}.picmo__icon-medium{font-size:1em}.picmo__icon-large{font-size:1.25em}.picmo__icon-2x{font-size:2em}.picmo__icon-3x{font-size:3em}.picmo__icon-4x{font-size:4em}.picmo__icon-5x{font-size:5em}.picmo__icon-8x{font-size:8em}.picmo__icon-10x{font-size:10em}.picmo__light,.picmo__auto{color-scheme:light;--accent-color: #4f46e5;--background-color: #f9fafb;--border-color: #cccccc;--category-name-background-color: #f9fafb;--category-name-button-color: #999999;--category-name-text-color: hsl(214, 30%, 50%);--category-tab-active-background-color: rgba(255, 255, 255, .6);--category-tab-active-color: var(--accent-color);--category-tab-color: #666;--category-tab-highlight-background-color: rgba(0, 0, 0, .15);--error-color-dark: hsl(0, 100%, 45%);--error-color: hsl(0, 100%, 40%);--focus-indicator-background-color: hsl(198, 65%, 85%);--focus-indicator-color: #333333;--hover-background-color: #c7d2fe;--placeholder-background-color: #cccccc;--search-background-color: #f9fafb;--search-focus-background-color: #ffffff;--search-icon-color: #999999;--search-placeholder-color: #71717a;--secondary-background-color: #e2e8f0;--secondary-text-color: #666666;--tag-background-color: rgba(162, 190, 245, .3);--text-color: #000000;--variant-popup-background-color: #ffffff}.picmo__dark{color-scheme:dark;--accent-color: #A580F9;--background-color: #333333;--border-color: #666666;--category-name-background-color: #333333;--category-name-button-color: #eeeeee;--category-name-text-color: #ffffff;--category-tab-active-background-color: #000000;--category-tab-active-color: var(--accent-color);--category-tab-color: #cccccc;--category-tab-highlight-background-color: #4A4A4A;--error-color-dark: hsl(0, 7%, 3%);--error-color: hsl(0, 30%, 60%);--focus-indicator-background-color: hsl(0, 0%, 50%);--focus-indicator-color: #999999;--hover-background-color: hsla(0, 0%, 40%, .85);--image-placeholder-color: #ffffff;--placeholder-background-color: #666666;--search-background-color: #71717a;--search-focus-background-color: #52525b;--search-icon-color: #cccccc;--search-placeholder-color: #d4d4d8;--secondary-background-color: #000000;--secondary-text-color: #999999;--tag-background-color: rgba(162, 190, 245, .3);--text-color: #ffffff;--variant-popup-background-color: #333333}@media (prefers-color-scheme: dark){.picmo__auto{color-scheme:dark;--accent-color: #A580F9;--background-color: #333333;--border-color: #666666;--category-name-background-color: #333333;--category-name-button-color: #eeeeee;--category-name-text-color: #ffffff;--category-tab-active-background-color: #000000;--category-tab-active-color: var(--accent-color);--category-tab-color: #cccccc;--category-tab-highlight-background-color: #4A4A4A;--error-color-dark: hsl(0, 7%, 3%);--error-color: hsl(0, 30%, 60%);--focus-indicator-background-color: hsl(0, 0%, 50%);--focus-indicator-color: #999999;--hover-background-color: hsla(0, 0%, 40%, .85);--image-placeholder-color: #ffffff;--placeholder-background-color: #666666;--search-background-color: #71717a;--search-focus-background-color: #52525b;--search-icon-color: #cccccc;--search-placeholder-color: #d4d4d8;--secondary-background-color: #000000;--secondary-text-color: #999999;--tag-background-color: rgba(162, 190, 245, .3);--text-color: #ffffff;--variant-popup-background-color: #333333}}.picmo__picker .picmo__categoryButtonsContainer{overflow:auto;padding:2px 0}.picmo__picker .picmo__categoryButtonsContainer.picmo__has-overflow-right{mask-image:linear-gradient(270deg,rgba(255,255,255,0) 0%,rgba(255,255,255,1) 10%);-webkit-mask-image:linear-gradient(270deg,rgba(255,255,255,0) 0%,rgba(255,255,255,1) 10%)}.picmo__picker .picmo__categoryButtonsContainer.picmo__has-overflow-left{mask-image:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,1) 10%);-webkit-mask-image:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,1) 10%)}.picmo__picker .picmo__categoryButtonsContainer.picmo__has-overflow-both{mask-image:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,1) 10%,rgba(255,255,255,1) 90%,rgba(255,255,255,0) 100%);-webkit-mask-image:linear-gradient(90deg,rgba(255,255,255,0) 0%,rgba(255,255,255,1) 10%,rgba(255,255,255,1) 90%,rgba(255,255,255,0) 100%)}.picmo__picker .picmo__categoryButtons{display:flex;flex-direction:row;gap:var(--tab-gap);margin:0;padding:0 .5em;align-items:center;height:var(--category-tabs-height);box-sizing:border-box;width:100%;justify-content:space-between;position:relative;list-style-type:none;justify-self:center;max-width:min(23.55rem,calc(var(--category-count, 1) * 2.5rem))}.picmo__picker .picmo__categoryButtons .picmo__categoryTab{display:flex;align-items:center;transition:all .1s;width:2em}.picmo__picker .picmo__categoryButtons .picmo__categoryTab.picmo__categoryTabActive .picmo__categoryButton{color:var(--category-tab-active-color);background:linear-gradient(rgba(255,255,255,.75) 0%,rgba(255,255,255,.75) 100%),linear-gradient(var(--category-tab-active-color) 0%,var(--category-tab-active-color) 100%);border:2px solid var(--category-tab-active-color)}.picmo__picker .picmo__categoryButtons .picmo__categoryTab.picmo__categoryTabActive .picmo__categoryButton:hover{background-color:var(--category-tab-active-background-color)}.picmo__picker .picmo__categoryButtons .picmo__categoryTab button.picmo__categoryButton{border-radius:5px;background:transparent;border:2px solid transparent;color:var(--category-tab-color);cursor:pointer;padding:2px;vertical-align:middle;display:flex;align-items:center;justify-content:center;font-size:1.2rem;width:1.6em;height:1.6em;transition:all .1s}.picmo__picker .picmo__categoryButtons .picmo__categoryTab button.picmo__categoryButton:is(img){width:var(--category-tab-size);height:var(--category-tab-size)}.picmo__picker .picmo__categoryButtons .picmo__categoryTab button.picmo__categoryButton:hover{background:var(--category-tab-highlight-background-color)}.picmo__dataError [data-icon]{opacity:.8}@keyframes appear{0%{opacity:0}to{opacity:.8}}@keyframes appear-grow{0%{opacity:0;transform:scale(.8)}to{opacity:.8;transform:scale(1)}}.picmo__picker .picmo__error{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--secondary-text-color)}.picmo__picker .picmo__error .picmo__iconContainer{opacity:.8;animation:appear-grow .25s cubic-bezier(.175,.885,.32,1.275);--color-primary: var(--error-color);--color-secondary: var(--error-color-dark)}.picmo__picker .picmo__error .picmo__title{animation:appear .25s;animation-delay:50ms;animation-fill-mode:both}.picmo__picker .picmo__error button{padding:8px 16px;cursor:pointer;background:var(--background-color);border:1px solid var(--text-color);border-radius:5px;color:var(--text-color)}.picmo__picker .picmo__error button:hover{background:var(--text-color);color:var(--background-color)}.picmo__emojiButton{background:transparent;border:none;border-radius:15px;cursor:pointer;display:flex;font-family:var(--emoji-font);font-size:var(--emoji-size);height:100%;justify-content:center;align-items:center;margin:0;overflow:hidden;padding:0;width:100%}.picmo__emojiButton:hover{background:var(--hover-background-color)}.picmo__emojiButton:focus{border-radius:0;background:var(--focus-indicator-background-color);outline:1px solid var(--focus-indicator-color)}.picmo__picker .picmo__emojiArea{height:var(--emoji-area-height);overflow-y:auto;position:relative}.picmo__picker .picmo__emojiCategory{position:relative}.picmo__picker .picmo__emojiCategory .picmo__categoryName{font-size:.9em;padding:.5rem;margin:0;background:var(--category-name-background-color);color:var(--category-name-text-color);top:0;z-index:1;display:grid;gap:4px;grid-template-columns:auto 1fr auto;align-items:center;line-height:1;box-sizing:border-box;height:var(--category-name-height);justify-content:flex-start;text-transform:uppercase}.picmo__picker .picmo__emojiCategory .picmo__categoryName button{background:transparent;border:none;display:flex;align-items:center;cursor:pointer;color:var(--category-name-button-color)}.picmo__picker .picmo__emojiCategory .picmo__categoryName button:hover{opacity:1}.picmo__picker .picmo__emojiCategory .picmo__noRecents{color:var(--secondary-text-color);grid-column:1 / span var(--emojis-per-row);font-size:.9em;text-align:center;display:flex;align-items:center;justify-content:center;min-height:calc(var(--emoji-size) * var(--emoji-size-multiplier))}.picmo__picker .picmo__emojiCategory .picmo__recentEmojis[data-empty=true]{display:none}:is(.picmo__picker .picmo__emojiCategory) .picmo__recentEmojis[data-empty=false]+div{display:none}.picmo__picker .picmo__emojiContainer{display:grid;justify-content:space-between;gap:1px;padding:0 .5em;grid-template-columns:repeat(var(--emojis-per-row),calc(var(--emoji-size) * var(--emoji-size-multiplier)));grid-auto-rows:calc(var(--emoji-size) * var(--emoji-size-multiplier));align-items:center;justify-items:center}.picmo__picker.picmo__picker{--border-radius: 5px;--emoji-area-height: calc( (var(--row-count) * var(--emoji-size) * var(--emoji-size-multiplier)) + var(--category-name-height) );--content-height: var(--emoji-area-height);--emojis-per-row: 8;--row-count: 6;--emoji-preview-margin: 4px;--emoji-preview-height: calc(var(--emoji-preview-size) + 1em + 1px);--emoji-preview-height-full: calc(var(--emoji-preview-height) + var(--emoji-preview-margin));--emoji-preview-size: 2.75em;--emoji-size: 2rem;--emoji-size-multiplier: 1.3;--content-margin: 8px;--category-tabs-height:calc(1.5em + 9px);--category-tabs-offset: 8px;--category-tab-size: 1.2rem;--category-name-height: 2rem;--category-name-padding-y: 6px;--search-height: 2em;--search-margin: .5em;--search-margin-bottom: 4px;--search-height-full: calc(var(--search-height) + var(--search-margin) + var(--search-margin-bottom));--overlay-background-color: rgba(0, 0, 0, .8);--emoji-font: "Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", "Apple Color Emoji", "Twemoji Mozilla", "Noto Color Emoji", "EmojiOne Color", "Android Emoji";--ui-font: -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;--ui-font-size: 16px;--picker-width: calc(var(--emojis-per-row) * var(--emoji-size) * var(--emoji-size-multiplier) + 2.75rem);--preview-background-color: var(--secondary-background-color);background:var(--background-color);border-radius:var(--border-radius);border:1px solid var(--border-color);font-family:var(--ui-font);font-size:var(--ui-font-size);overflow:hidden;position:relative;width:var(--picker-width);display:grid;gap:8px}.picmo__picker.picmo__picker>*{font-family:var(--ui-font)}.picmo__picker.picmo__skeleton{background:var(--background-color);border-radius:var(--border-radius);border:1px solid var(--border-color);font-family:var(--ui-font);width:var(--picker-width);color:var(--secondary-text-color)}.picmo__picker.picmo__skeleton *{box-sizing:border-box}.picmo__picker.picmo__skeleton .picmo__placeholder{background:var(--placeholder-background-color);position:relative;overflow:hidden}.picmo__picker.picmo__skeleton .picmo__placeholder:after{position:absolute;top:0;right:0;bottom:0;left:0;transform:translate(-100%);background-image:linear-gradient(90deg,rgba(255,255,255,0) 0,rgba(255,255,255,.2) 20%,rgba(255,255,255,.5) 60%,rgba(255,255,255,0) 100%);animation:shine 2s infinite;content:""}.picmo__picker.picmo__skeleton .picmo__headerSkeleton{background-color:var(--secondary-background-color);padding-top:8px;padding-bottom:8px;display:flex;flex-direction:column;overflow:hidden;gap:8px;border-bottom:1px solid var(--border-color);width:var(--picker-width)}.picmo__picker.picmo__skeleton .picmo__searchSkeleton{padding:0 8px;height:var(--search-height)}.picmo__picker.picmo__skeleton .picmo__searchSkeleton .picmo__searchInput{width:100%;height:28px;border-radius:3px}.picmo__picker.picmo__skeleton .picmo__categoryTabsSkeleton{height:var(--category-tabs-height);display:flex;flex-direction:row;align-items:center;justify-self:center;width:calc(2rem * var(--category-count, 1))}.picmo__picker.picmo__skeleton .picmo__categoryTabsSkeleton .picmo__categoryTab{width:25px;height:25px;padding:2px;border-radius:5px;margin:.25em}.picmo__picker.picmo__skeleton .picmo__contentSkeleton{height:var(--content-height);padding-right:8px;opacity:.7}.picmo__picker.picmo__skeleton .picmo__contentSkeleton .picmo__categoryName{width:50%;height:1rem;margin:.5rem;box-sizing:border-box}.picmo__picker.picmo__skeleton .picmo__contentSkeleton .picmo__emojiGrid{display:grid;justify-content:space-between;gap:1px;padding:0 .5em;grid-template-columns:repeat(var(--emojis-per-row),calc(var(--emoji-size) * var(--emoji-size-multiplier)));grid-auto-rows:calc(var(--emoji-size) * var(--emoji-size-multiplier));align-items:center;justify-items:center;width:var(--picker-width)}.picmo__picker.picmo__skeleton .picmo__contentSkeleton .picmo__emojiGrid .picmo__emoji{width:var(--emoji-size);height:var(--emoji-size);border-radius:50%}.picmo__picker.picmo__skeleton .picmo__previewSkeleton{height:var(--emoji-preview-height);border-top:1px solid var(--border-color);display:grid;align-items:center;padding:.5em;gap:6px;grid-template-columns:auto 1fr;grid-template-rows:auto 1fr;grid-template-areas:"emoji name" "emoji tags"}.picmo__picker.picmo__skeleton .picmo__previewSkeleton .picmo__previewEmoji{grid-area:emoji;border-radius:50%;width:var(--emoji-preview-size);height:var(--emoji-preview-size)}.picmo__picker.picmo__skeleton .picmo__previewSkeleton .picmo__previewName{grid-area:name;height:.8em;width:80%}.picmo__picker.picmo__skeleton .picmo__previewSkeleton .picmo__tagList{grid-area:tags;list-style-type:none;display:flex;flex-direction:row;padding:0;margin:0}.picmo__picker.picmo__skeleton .picmo__previewSkeleton .picmo__tagList .picmo__tag{border-radius:3px;padding:2px 8px;margin-right:.25em;height:1em;width:20%}.picmo__overlay{background:rgba(0,0,0,.75);height:100%;left:0;position:fixed;top:0;width:100%;z-index:1000}.picmo__content{position:relative;overflow:hidden;height:var(--content-height)}.picmo__content.picmo__fullHeight{height:calc(var(--content-height) + var(--category-tabs-height) + var(--category-tabs-offset));overflow-y:auto}.picmo__pluginContainer{margin:.5em;display:flex;flex-direction:row}.picmo__header{background-color:var(--secondary-background-color);padding-top:8px;padding-bottom:8px;display:grid;gap:8px;border-bottom:1px solid var(--border-color)}@media (prefers-reduced-motion: reduce){.picmo__placeholder{background:var(--placeholder-background-color);position:relative;overflow:hidden}.picmo__placeholder:after{display:none}}.picmo__picker .picmo__preview{border-top:1px solid var(--border-color);display:grid;align-items:center;gap:6px;grid-template-columns:auto 1fr;grid-template-rows:auto 1fr;grid-template-areas:"emoji name" "emoji tags";height:var(--emoji-preview-height);box-sizing:border-box;padding:.5em;position:relative;background:var(--preview-background-color)}.picmo__picker .picmo__preview .picmo__previewEmoji{grid-area:emoji;font-size:var(--emoji-preview-size);font-family:var(--emoji-font);width:1.25em;display:flex;align-items:center;justify-content:center}.picmo__picker .picmo__preview .picmo__previewName{grid-area:name;color:var(--text-color);font-size:.8em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500}.picmo__picker .picmo__preview .picmo__tagList{grid-area:tags;list-style-type:none;display:flex;flex-direction:row;padding:0;margin:0;font-size:.75em;overflow:hidden}.picmo__picker .picmo__preview .picmo__tag{border-radius:3px;background:var(--tag-background-color);color:var(--text-color);padding:2px 8px;margin-right:.25em;white-space:nowrap}.picmo__picker .picmo__preview .picmo__tag:last-child{margin-right:0}.picmo__picker .picmo__searchContainer{display:flex;height:var(--search-height);box-sizing:border-box;padding:0 8px;position:relative}.picmo__picker .picmo__searchContainer .picmo__searchField{background:var(--search-background-color);border-radius:3px;border:none;box-sizing:border-box;color:var(--text-color);font-size:.9em;outline:none;padding:.5em 2.25em .5em .5em;width:100%}.picmo__picker .picmo__searchContainer .picmo__searchField:focus{background:var(--search-focus-background-color)}.picmo__picker .picmo__searchContainer .picmo__searchField::placeholder{color:var(--search-placeholder-color)}.picmo__picker .picmo__searchContainer .picmo__searchAccessory{color:var(--search-icon-color);height:100%;position:absolute;right:1em;top:0;width:1.25rem;display:flex;align-items:center}.picmo__picker .picmo__searchContainer .picmo__searchAccessory svg{fill:var(--search-icon-color)}.picmo__picker .picmo__searchContainer .picmo__clearButton{border:0;color:var(--search-icon-color);background:transparent;cursor:pointer}.picmo__picker .picmo__searchContainer .picmo__clearSearchButton{cursor:pointer;border:none;background:transparent;color:var(--search-icon-color);font-size:1em;width:100%;height:100%;display:flex;align-items:center;padding:0}.picmo__picker .picmo__searchContainer .picmo__notFound [data-icon]{fill:#f3e265}.picmo__picker .picmo__variantOverlay{background:var(--overlay-background-color);border-radius:5px;display:flex;flex-direction:column;height:100%;justify-content:center;left:0;position:absolute;top:0;width:100%;z-index:1}.picmo__picker .picmo__variantOverlay .picmo__variantPopup{background:var(--variant-popup-background-color);border-radius:5px;margin:.5em;padding:.5em;text-align:center;user-select:none;display:flex;align-items:center;justify-content:center}.picmo__customEmoji{width:1em;height:1em}@keyframes shine{to{transform:translate(100%)}}.picmo__picker .picmo__imagePlaceholder{width:2rem;height:2rem;border-radius:50%}.picmo__placeholder{background:#DDDBDD;position:relative}.picmo__placeholder:after{position:absolute;top:0;right:0;bottom:0;left:0;transform:translate(-100%);background-image:linear-gradient(90deg,rgba(255,255,255,0) 0,rgba(255,255,255,.2) 20%,rgba(255,255,255,.5) 60%,rgba(255,255,255,0) 100%);animation:shine 2s infinite;content:""}
`;
function Ps(s) {
  return ce(s.locale, s.dataStore, s.messages, s.emojiData);
}
let zs = 0, M;
function Ls() {
  return `picmo-${Date.now()}-${zs++}`;
}
const $s = Ss();
function Hs(s) {
  $s(Fs);
  const e = $t(s), t = ((e == null ? void 0 : e.custom) || []).map((n) => ({
    ...n,
    custom: !0,
    tags: ["custom", ...n.tags || []]
  })), o = new It();
  M || (M = Ps(e));
  const i = new xs(e.i18n);
  M.then((n) => {
    o.emit("data:ready", n);
  }).catch((n) => {
    o.emit("error", n);
  });
  const a = new ks({
    events: o,
    i18n: i,
    customEmojis: t,
    renderer: e.renderer,
    options: e,
    emojiData: M,
    pickerId: Ls()
  }).create(_s);
  return a.renderSync(), a;
}
const As = {
  "categories.activities": "Aktivit\xE4ten",
  "categories.animals-nature": "Tiere & Natur",
  "categories.custom": "Benutzerdefiniert",
  "categories.flags": "Flaggen",
  "categories.food-drink": "Essen & Trinken",
  "categories.objects": "Gegenst\xE4nde",
  "categories.people-body": "Mensch & K\xF6rper",
  "categories.recents": "Zuletzt genutzt",
  "categories.smileys-emotion": "Smileys & Emotionen",
  "categories.symbols": "Symbole",
  "categories.travel-places": "Reisen & Orte",
  "error.load": "Emojis wurden nicht geladen",
  "recents.clear": "Zuletzt genutzte Emojis l\xF6schen",
  "recents.none": "Kein Emoji ausgew\xE4hlt.",
  retry: "Erneut versuchen",
  "search.clear": "Suche l\xF6schen",
  "search.error": "Suche erfolglos",
  "search.notFound": "Kein Emoji gefunden",
  search: "Emojis durchsuchen ..."
}, Is = {
  "categories.activities": "Aktiviteetit",
  "categories.animals-nature": "El\xE4imet & luonto",
  "categories.custom": "Mukautettu",
  "categories.flags": "Liput",
  "categories.food-drink": "Ruoka & juoma",
  "categories.objects": "Esineet",
  "categories.people-body": "Ihmiset & keho",
  "categories.recents": "Viimeksi k\xE4ytetty",
  "categories.smileys-emotion": "Hymi\xF6t & tunne",
  "categories.symbols": "Symbolit",
  "categories.travel-places": "Matkustus & paikat",
  "error.load": "Emojien lataaminen ep\xE4onnistui",
  "recents.clear": "Tyhjenn\xE4 viimeksi k\xE4ytetyt emojit",
  "recents.none": "Et ole valinnut viel\xE4 emojia.",
  retry: "Kokeile uudestaan",
  "search.clear": "Tyhjenn\xE4 haku",
  "search.error": "Emojien etsiminen ep\xE4onnistui",
  "search.notFound": "Emojia ei l\xF6ytynyt",
  search: "Etsi emojia..."
}, Ts = {
  "categories.activities": "Activit\xE9s",
  "categories.animals-nature": "Animaux et nature",
  "categories.custom": "Personnalis\xE9",
  "categories.flags": "Drapeaux",
  "categories.food-drink": "Nourriture et boissons",
  "categories.objects": "Objets",
  "categories.people-body": "Personnes et corps",
  "categories.recents": "R\xE9cemment utilis\xE9",
  "categories.smileys-emotion": "Visages et \xE9motions",
  "categories.symbols": "Symboles",
  "categories.travel-places": "Voyages et lieux",
  "error.load": "\xC9chec du chargement des \xE9mojis",
  "recents.clear": "Effacez les \xE9mojis r\xE9cents",
  "recents.none": "Vous n'avez pas encore s\xE9lectionn\xE9 d'\xE9mojis.",
  retry: "Essayez \xE0 nouveau",
  "search.clear": "Effacer la recherche",
  "search.error": "\xC9chec de la recherche d'\xE9mojis",
  "search.notFound": "Aucun \xE9moji trouv\xE9",
  search: "Rechercher des \xE9mojis..."
}, Rs = {
  "categories.activities": "Activiteiten",
  "categories.animals-nature": "Dieren & Natuur",
  "categories.custom": "Aangepast",
  "categories.flags": "Vlaggen",
  "categories.food-drink": "Eten & Drinken",
  "categories.objects": "Voorwerpen",
  "categories.people-body": "Mens & Lichaam",
  "categories.recents": "Laatst gebruikt",
  "categories.smileys-emotion": "Smileys en emoties",
  "categories.symbols": "Symbolen",
  "categories.travel-places": "Reizen & Plaatsen",
  "error.load": "Kan emoji's niet laden",
  "recents.clear": "Wis recente emoji's",
  "recents.none": "Geen emoji geselecteerd.",
  retry: "Probeer het nog eens",
  "search.clear": "Zoekopdracht wissen",
  "search.error": "Zoeken mislukt",
  "search.notFound": "Geen emoji gevonden",
  search: "Zoek emoji..."
}, Ms = {
  "categories.activities": "Aktiviteter",
  "categories.animals-nature": "Dyr & natur",
  "categories.custom": "Tilpasset",
  "categories.flags": "Flagg",
  "categories.food-drink": "Mat & drikke",
  "categories.objects": "Objekter",
  "categories.people-body": "Mennesker & kropp",
  "categories.recents": "Nylig brukte",
  "categories.smileys-emotion": "Smilefjes & f\xF8lelser",
  "categories.symbols": "Symboler",
  "categories.travel-places": "Reise & steder",
  "error.load": "Klarte ikke laste inn emojis",
  "recents.clear": "Fjern nylige emojis",
  "recents.none": "Du har ikke valgt noen emojis enda.",
  retry: "Pr\xF8v igjen",
  "search.clear": "T\xF8m s\xF8k",
  "search.error": "Klarte ikke \xE5 s\xF8ke etter emojis",
  "search.notFound": "Ingen emojis funnet",
  search: "S\xF8k etter emojis..."
}, Vs = {
  "categories.activities": "Aktiviteter",
  "categories.animals-nature": "Djur & natur",
  "categories.custom": "Anpassad",
  "categories.flags": "Flagga",
  "categories.food-drink": "Mat & dryck",
  "categories.objects": "Objekt",
  "categories.people-body": "M\xE4nniskor & kropp",
  "categories.recents": "Nyligen anv\xE4nd",
  "categories.smileys-emotion": "Hum\xF6r & k\xE4nslor",
  "categories.symbols": "Symboler",
  "categories.travel-places": "Resor & platser",
  "error.load": "Det gick inte att ladda emojis",
  "recents.clear": "Ta bort de senaste emojis",
  "recents.none": "Du har inte valt n\xE5gra emojis \xE4n",
  retry: "F\xF6rs\xF6k igen",
  "search.clear": "Tom s\xF6kning",
  "search.error": "Det gick inte att s\xF6ka efter emojis",
  "search.notFound": "Inga emojis hittades",
  search: "S\xF6k efter emojis..."
}, Ks = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  de: As,
  en: ze,
  fi: Is,
  fr: Ts,
  nl: Rs,
  no: Ms,
  sv: Vs
}, Symbol.toStringTag, { value: "Module" }));
class Us extends Ie {
  constructor() {
    super(xe() ? sessionStorage : $e());
  }
}
class qs extends Ae {
  constructor() {
    super(...arguments), this.recents = [];
  }
  clear() {
    this.recents = [];
  }
  getRecents(e) {
    return this.recents.slice(0, e);
  }
  addOrUpdateRecent(e, t) {
    this.recents = [
      e,
      ...this.getRecents(t).filter((o) => o.hexcode !== e.hexcode)
    ].slice(0, t);
  }
}
async function Ws(s, e, t, o) {
  (await ce(s, e, t, o)).close();
}

//# sourceMappingURL=index.js.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _components_BugnoteEnhancer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./components/BugnoteEnhancer */ "./src/components/BugnoteEnhancer.ts");

(function () {
    const bugnoteEnhancer = new _components_BugnoteEnhancer__WEBPACK_IMPORTED_MODULE_0__.BugnoteEnhancer();
    bugnoteEnhancer.init();
})();

})();

/******/ })()
;
//# sourceMappingURL=bundle.js.map