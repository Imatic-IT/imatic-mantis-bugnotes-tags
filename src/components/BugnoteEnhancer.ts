import {getSettings, NoteSettings, DEFAULT_SETTINGS} from '../utils/utils';

import {IconManager} from '../utils/IconManager';
import {BugnotesHelper} from "../utils/BugnotesHelper";
import {ReactionIconManager} from "../utils/ReactionIconManager";
import {ImaticEmojiPicker} from "../emojiPicker/ImaticEmojiPicker";

export class BugnoteEnhancer {
    private settings: NoteSettings = DEFAULT_SETTINGS
    private iconManager: IconManager = new IconManager();
    private bugnoteHelper: BugnotesHelper = new BugnotesHelper();
    private reactionIconManager: ReactionIconManager = new ReactionIconManager();
    private imaticEmojiPicker: ImaticEmojiPicker | null = null;
    private highlightedBugnotes: string[] = [];
    private highlightedClass: string = 'highlighted';


    async init() {
        this.imaticEmojiPicker = new ImaticEmojiPicker()
        await this.moveSavedBugnotesButton()
        await this.loadSettings()
        await this.loadHighlightedBugnotes()
        await this.initializeBugnoteUI()
    }

    private async loadSettings(): Promise<void> {
        this.settings = await getSettings();
    }

    private async loadHighlightedBugnotes(): Promise<void> {
        this.highlightedBugnotes = await this.bugnoteHelper.getHighlightedBugnotes();
    }


    private async initializeBugnoteUI(): Promise<void> {
        const bugnotes: HTMLTableCellElement[] | null = this.bugnoteHelper.getBugnotesTableRows();
        if (!bugnotes || bugnotes.length === 0) return;

        requestIdleCallback(async ():Promise<void> => {
            for (const bugnote of bugnotes) {
                await this.processBugnote(bugnote);
            }
            (() => {
                document.querySelectorAll('.hidden-until-ready').forEach(el => el.classList.remove('hidden-until-ready'));
            })();
        });
    }

    private async processBugnote(bugnote: HTMLTableCellElement): Promise<void> {
        const bugnoteId: string = bugnote.parentElement!.id;
        const divWrapper: HTMLDivElement = this.createDivWrapper();
        const div: HTMLDivElement = this.createBugnoteIconsDiv();

        const saveIcon: HTMLElement = this.iconManager.createSaveBugnoteIcon();
        const reactionIcon: HTMLElement = this.iconManager.createReactionOnBugnoteIcon();

        if (this.highlightedBugnotes.includes(bugnoteId)) {
            this.makeBugnoteHighlighted(bugnote);
            saveIcon.classList.add(this.iconManager.saveIconClass);
            saveIcon.classList.remove(this.iconManager.savedIconClass);
        }

        div.append(saveIcon, reactionIcon);
        divWrapper.appendChild(div);
        bugnote.appendChild(divWrapper);

        saveIcon.addEventListener('click', () => this.handleSaveIconClick(bugnote));

        const reactedIconContainer = await this.reactionIconManager.createReactionContainer(bugnoteId);
        bugnote.appendChild(reactedIconContainer);

        reactionIcon.addEventListener('click', (event: MouseEvent) => {
            this.handleReactionIconClick(event ,reactionIcon)
        })

    }

    private handleReactionIconClick(event:MouseEvent, reactionIcon: HTMLElement): void {
        this.imaticEmojiPicker?.showModalOnClick(event,reactionIcon);

        this.imaticEmojiPicker?.setOnEmojiSelect((emoji: string) => {
            this.reactionIconManager.handleEmojiClick(emoji, reactionIcon)
        })
    }

    private createElement<K extends keyof HTMLElementTagNameMap>(tag: K, className: string): HTMLElementTagNameMap[K] {
        const element = document.createElement(tag);
        element.classList.add(className, 'hidden-until-ready');
        return element;
    }

    private createDivWrapper(): HTMLDivElement {
        return this.createElement("div", "bugnote-wrapper");
    }

    private createBugnoteIconsDiv(): HTMLDivElement {
        return this.createElement("div", "bugnote-icons");
    }

    private async handleSaveIconClick(bugnote: HTMLTableCellElement): Promise<void> {
        const bugnoteId = bugnote.parentElement!.id;
        const action = this.getAction(bugnote);

        this.toggleBugnoteHighlight(bugnote, bugnoteId);

        try {
            const response = await fetch(this.settings.url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({bugnoteId: bugnoteId, bugId: this.settings.bugId, action}),
            });

            if (!response.ok) {
                console.error(`Failed ${action} action. Status: ${response.status}. Message: ${await response.text()}`);
            }
        } catch (error) {
            console.error(`Error performing ${action} action.`, error);
        }
    }

    private getAction(bugnote: HTMLTableCellElement): string {
        const isHighlighted = bugnote.parentElement!.classList.contains(this.highlightedClass);
        return isHighlighted ? this.settings.actions.unhighlight : this.settings.actions.highlight;
    }


    private toggleBugnoteHighlight(bugnote: HTMLTableCellElement, bugnoteId: string): void {
        const isHighlighted = bugnote.parentElement!.classList.contains(this.highlightedClass);
        if (isHighlighted) {
            this.highlightedBugnotes = this.highlightedBugnotes.filter(id => id !== bugnoteId);
        } else {
            this.highlightedBugnotes.push(bugnoteId);
        }
        this.makeBugnoteHighlighted(bugnote);
    }

    private makeBugnoteHighlighted(bugnote: HTMLTableCellElement): void {
        this.bugnoteHelper.makeBugnoteHighlighted(bugnote)
        this.iconManager.toggleSaveBugnoteIcon(bugnote)
    }

    private async moveSavedBugnotesButton(): Promise<void> {
        const button = document.querySelector("a[href='#history']");
        const newButton = document.querySelector("#savedBugnotesLinkButton");

        if (button && newButton) {
            const parentElement = button.parentElement;
            if (parentElement) {
                parentElement.append(button, newButton);
            }
        }
    }

}