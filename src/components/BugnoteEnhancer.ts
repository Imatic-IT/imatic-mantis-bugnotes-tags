import {getSettings, NoteSettings, DEFAULT_SETTINGS} from '../utils/utils';

import {IconManager} from '../utils/IconManager';
import {BugnotesHelper} from "../utils/BugnotesHelper";
import {CollapseHelper} from "../utils/CollapseHelper";
import {ReactionIconManager} from "../utils/ReactionIconManager";
import {ImaticEmojiPicker} from "../emojiPicker/ImaticEmojiPicker";

export class BugnoteEnhancer {
    private settings: NoteSettings = DEFAULT_SETTINGS
    private iconManager: IconManager = new IconManager();
    private bugnoteHelper: BugnotesHelper = new BugnotesHelper();
    private collapseHelper: CollapseHelper = new CollapseHelper();
    private reactionIconManager: ReactionIconManager = new ReactionIconManager();
    private imaticEmojiPicker: ImaticEmojiPicker | null = null;
    private highlightedBugnotes: string[] = [];
    private collapsedBugnotes: string[] = [];
    private foldModeEnabled: boolean = false;
    private highlightedClass: string = 'highlighted';


    async init() {
        this.imaticEmojiPicker = new ImaticEmojiPicker()
        await this.moveSavedBugnotesButton()
        await this.loadSettings()
        await this.loadHighlightedBugnotes()
        await this.loadCollapsedBugnotes()
        await this.loadFoldMode()
        await this.initializeBugnoteUI()
        this.renderFoldToggleButton()
        if (this.foldModeEnabled) {
            this.applyFoldMode(true)
        }
    }

    private async loadSettings(): Promise<void> {
        this.settings = await getSettings();
    }

    private async loadHighlightedBugnotes(): Promise<void> {
        this.highlightedBugnotes = await this.bugnoteHelper.getHighlightedBugnotes();
    }

    private async loadCollapsedBugnotes(): Promise<void> {
        this.collapsedBugnotes = await this.collapseHelper.getCollapsedBugnotes();
    }

    private async loadFoldMode(): Promise<void> {
        this.foldModeEnabled = await this.collapseHelper.getFoldMode();
    }

    private async initializeBugnoteUI(): Promise<void> {
        const bugnotes: HTMLTableCellElement[] | null = this.bugnoteHelper.getBugnotesTableRows();
        if (!bugnotes || bugnotes.length === 0) return;

        const groupedReactions = await this.reactionIconManager.getGroupedReactions();

        for (const bugnote of bugnotes) {
            this.processBugnote(bugnote, groupedReactions);
        }

        document
            .querySelectorAll('.hidden-until-ready')
            .forEach(el => el.classList.remove('hidden-until-ready'));
    }

    private processBugnote(
        bugnote: HTMLTableCellElement,
        groupedReactions: Record<string, Record<string, { count: number; usernames: string[] }>>
    ): void {

        const bugnoteId = bugnote.parentElement!.id;
        const row = bugnote.parentElement as HTMLTableRowElement;

        const divWrapper = this.createDivWrapper();
        const div = this.createBugnoteIconsDiv();

        const saveIcon = this.iconManager.createSaveBugnoteIcon();
        const reactionIcon = this.iconManager.createReactionOnBugnoteIcon();
        const collapseIcon = this.iconManager.createCollapseBugnoteIcon();

        if (this.highlightedBugnotes.includes(bugnoteId)) {
            this.makeBugnoteHighlighted(bugnote);
            saveIcon.classList.add(this.iconManager.saveIconClass);
            saveIcon.classList.remove(this.iconManager.savedIconClass);
        }

        div.append(saveIcon, reactionIcon, collapseIcon);
        divWrapper.appendChild(div);

        const reactionContainer = this.createReactionContainerFromMap(
            bugnoteId,
            groupedReactions
        );

        bugnote.append(divWrapper, reactionContainer);

        const noteCell = row.querySelector<HTMLTableCellElement>('.bugnote-note');
        if (noteCell) {
            const noodle = this.buildNoodleSummary(bugnote);
            noteCell.appendChild(noodle);

            if (this.collapsedBugnotes.includes(bugnoteId)) {
                row.classList.add('collapsed');
                this.iconManager.toggleCollapseIcon(bugnote, true);
            }

            noodle.addEventListener('click', () =>
                this.handleCollapseToggle(bugnote, bugnoteId, row)
            );
        }

        saveIcon.addEventListener('click', () =>
            this.handleSaveIconClick(bugnote)
        );

        reactionIcon.addEventListener('click', (event: MouseEvent) =>
            this.handleReactionIconClick(event, reactionIcon)
        );

        collapseIcon.addEventListener('click', () =>
            this.handleCollapseToggle(bugnote, bugnoteId, row)
        );
    }

    private buildNoodleSummary(bugnote: HTMLTableCellElement): HTMLElement {
        const row = bugnote.parentElement as HTMLTableRowElement;

        const authorEl = bugnote.querySelector('a');
        const author = authorEl?.textContent?.trim() || '';

        const dateEl = bugnote.querySelector('.small.lighter');
        const dateMatch = dateEl?.textContent?.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
        const dateText = dateMatch ? dateMatch[0] : '';

        const noteCell = row.querySelector<HTMLElement>('.bugnote-note');
        let preview = '';
        if (noteCell) {
            const tmp = document.createElement('div');
            tmp.innerHTML = noteCell.innerHTML;
            // remove the noodle itself if already inserted
            tmp.querySelector('.bugnote-collapsed-summary')?.remove();
            preview = (tmp.textContent || '').replace(/\s+/g, ' ').trim();
            if (preview.length > 100) {
                preview = preview.substring(0, 100) + '…';
            }
        }

        const summary = document.createElement('div');
        summary.classList.add('bugnote-collapsed-summary');

        const authorSpan = document.createElement('span');
        authorSpan.classList.add('author');
        authorSpan.textContent = author;

        const sep1 = document.createElement('span');
        sep1.classList.add('sep');
        sep1.textContent = '·';

        const dateSpan = document.createElement('span');
        dateSpan.classList.add('date');
        dateSpan.textContent = dateText;

        const sep2 = document.createElement('span');
        sep2.classList.add('sep');
        sep2.textContent = '·';

        const previewSpan = document.createElement('span');
        previewSpan.classList.add('preview');
        previewSpan.textContent = preview;

        summary.append(authorSpan, sep1, dateSpan, sep2, previewSpan);
        return summary;
    }

    private async handleCollapseToggle(
        bugnote: HTMLTableCellElement,
        bugnoteId: string,
        row: HTMLTableRowElement
    ): Promise<void> {
        const wasCollapsed = row.classList.contains('collapsed');
        this.setCollapsedState(bugnote, row, bugnoteId, !wasCollapsed);

        const success = wasCollapsed
            ? await this.collapseHelper.uncollapse(bugnoteId)
            : await this.collapseHelper.collapse(bugnoteId);

        if (!success) {
            this.setCollapsedState(bugnote, row, bugnoteId, wasCollapsed);
        }
    }

    private setCollapsedState(
        bugnote: HTMLTableCellElement,
        row: HTMLTableRowElement,
        bugnoteId: string,
        collapsed: boolean
    ): void {
        row.classList.toggle('collapsed', collapsed);
        this.iconManager.toggleCollapseIcon(bugnote, collapsed);

        if (collapsed) {
            if (!this.collapsedBugnotes.includes(bugnoteId)) {
                this.collapsedBugnotes.push(bugnoteId);
            }
        } else {
            this.collapsedBugnotes = this.collapsedBugnotes.filter(id => id !== bugnoteId);
        }
    }

    // --- Group fold toggle ---

    private renderFoldToggleButton(): void {
        const toolbar = document.querySelector<HTMLElement>('#bugnotes .widget-toolbar');
        if (!toolbar) return;

        const btn = document.createElement('a');
        btn.id = 'foldUnsavedButton';
        btn.className = 'btn btn-primary btn-white btn-round btn-sm';
        btn.style.cursor = 'pointer';

        const updateButton = (enabled: boolean) => {
            const labelFold = this.settings.lang?.fold_unsaved || 'Hide unsaved';
            const labelShow = this.settings.lang?.show_all || 'Show all';
            const iconClass = enabled ? 'fa-expand' : 'fa-compress';
            btn.innerHTML = `<i class="fa ${iconClass}"></i> ${enabled ? labelShow : labelFold}`;
        };

        updateButton(this.foldModeEnabled);

        btn.addEventListener('click', async () => {
            const newState = !this.foldModeEnabled;
            this.foldModeEnabled = newState;
            this.applyFoldMode(newState);
            updateButton(newState);

            const success = await this.collapseHelper.setFoldMode(newState);
            if (!success) {
                this.foldModeEnabled = !newState;
                this.applyFoldMode(this.foldModeEnabled);
                updateButton(this.foldModeEnabled);
            }
        });

        toolbar.insertAdjacentElement('afterbegin', btn);
    }

    private applyFoldMode(enabled: boolean): void {
        const table = this.bugnoteHelper.getBugnotesTable();
        if (!table) return;

        // Remove existing placeholders and restore hidden rows
        table.querySelectorAll('.bugnote-fold-placeholder').forEach(el => el.remove());
        table.querySelectorAll<HTMLTableRowElement>('[data-fold-hidden]').forEach(row => {
            row.removeAttribute('data-fold-hidden');
            (row as HTMLElement).style.display = '';
        });

        if (!enabled) return;

        const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>('tr.bugnote'));
        let currentRun: HTMLTableRowElement[] = [];

        const flushRun = () => {
            if (currentRun.length === 0) return;
            const count = currentRun.length;

            const placeholder = document.createElement('tr');
            placeholder.classList.add('bugnote-fold-placeholder');

            const langStr = this.settings.lang?.n_notes_hidden || '%d notes hidden — click to expand';
            const text = langStr.replace('%d', count.toString());

            const td = document.createElement('td');
            td.setAttribute('colspan', '99');
            td.textContent = text;
            placeholder.appendChild(td);

            placeholder.dataset.hiddenIds = currentRun.map(r => r.id).join(',');

            currentRun.forEach(row => {
                row.dataset.foldHidden = 'true';
                row.style.display = 'none';
            });

            currentRun[0].parentElement!.insertBefore(placeholder, currentRun[0]);

            placeholder.addEventListener('click', () =>
                this.expandFoldPlaceholder(placeholder)
            );

            currentRun = [];
        };

        const anchorId = window.location.hash.slice(1);

        for (const row of rows) {
            const isPinned = this.highlightedBugnotes.includes(row.id)
                || (anchorId !== '' && row.id === anchorId);
            if (isPinned) {
                flushRun();
            } else {
                currentRun.push(row);
            }
        }
        flushRun();
    }

    private expandFoldPlaceholder(placeholder: HTMLTableRowElement): void {
        const table = this.bugnoteHelper.getBugnotesTable();
        if (!table) return;

        const hiddenIds = placeholder.dataset.hiddenIds?.split(',') || [];
        hiddenIds.forEach(id => {
            const row = table.querySelector<HTMLTableRowElement>(`#${CSS.escape(id)}`);
            if (row) {
                row.removeAttribute('data-fold-hidden');
                row.style.display = '';
            }
        });

        placeholder.remove();
    }

    // --- Reactions ---

    private createReactionContainerFromMap(
        bugnoteId: string,
        groupedReactions: Record<string, Record<string, { count: number; usernames: string[] }>>
    ): HTMLElement {

        const div = document.createElement("div");
        div.classList.add(
            'bugnote-reaction-icons',
            'bugnote-reaction-icons-' + bugnoteId
        );

        const reactionsForNote = groupedReactions[bugnoteId];
        if (!reactionsForNote) return div;

        for (const [emoji, { count, usernames }] of Object.entries(reactionsForNote)) {

            const button = this.reactionIconManager.createReactionButton(
                emoji,
                usernames
            );

            const span = document.createElement('span');
            span.classList.add('reaction-count');
            span.textContent = count.toString();

            button.appendChild(span);
            div.appendChild(button);
        }

        return div;
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
                body: JSON.stringify({bugnoteId: bugnoteId, bugId: this.settings.bugId, action, csrfToken: this.settings.csrfToken}),
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
        const button = document.querySelector("a[href$='#bugnotes']");
        const newButton = document.querySelector("#savedBugnotesLinkButton");

        if (button && newButton) {
            const parentElement = button.parentElement;
            if (parentElement) {
                parentElement.append(button, newButton);
            }
        }
    }

}
