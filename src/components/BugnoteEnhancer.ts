import {getSettings, NoteSettings, DEFAULT_SETTINGS} from '../utils/utils';
import 'emoji-picker-element';

import {IconManager} from '../utils/IconManager';
import {BugnotesHelper} from "../utils/BugnotesHelper";
import {ReactionIconManager} from "../utils/ReactionIconManager";

export class BugnoteEnhancer {
    private settings: NoteSettings = DEFAULT_SETTINGS
    private iconManager: IconManager = new IconManager();
    private bugnoteHelper: BugnotesHelper = new BugnotesHelper();
    private reactionIconManager: ReactionIconManager = new ReactionIconManager();
    private highlightedBugnotes: string[] = [];
    private highlightedClass: string = 'highlighted';


     async init() {
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

        // Použitie requestIdleCallback na vykonanie funkcie po tom, ako prehliadač dokončí svoju úlohu
        requestIdleCallback(async () => {
            for (const bugnote of bugnotes) {
                await this.processBugnote(bugnote);
            }
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

        //TODO FIX THIS .... :/
        // await this.delay(200);

        const reactedIconContainer = await this.reactionIconManager.createReactionContainer(bugnoteId);
        bugnote.appendChild(reactedIconContainer);

        this.reactionIconManager.createEmojiPicker(reactionIcon)
    }


    // private  delay(ms: number): Promise<void> {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    // }

    private createElement<K extends keyof HTMLElementTagNameMap>(tag: K, className: string): HTMLElementTagNameMap[K] {
        const element = document.createElement(tag);
        element.classList.add(className);
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