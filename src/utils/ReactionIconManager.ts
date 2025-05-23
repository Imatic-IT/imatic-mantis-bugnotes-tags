// TODO: AK JE MOC SROLLTOP TAK NEVIDNO EMOJIPICKER TREBA VALIDACIU < > OD VRCHU A ZMENIT POSITION (slack to má od určitej height to je dole alebo hore )
import {DEFAULT_SETTINGS, getSettings, NoteSettings} from '../utils/utils';
import {Tooltip} from "../service/Tooltip";

interface Reaction {
    id: string;
    bug_id: string;
    bugnote_id: string;
    emoji?: string;
    username?: string;
}

interface ReactionResponse {
    action: 'delete' | 'save';
    username: string;
}

export class ReactionIconManager {
    private settings: NoteSettings = DEFAULT_SETTINGS
    private tooltip: Tooltip = new Tooltip();

    constructor() {
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await this.init();
    }

    private async init(): Promise<void> {
        await this.loadSettings();
    }


    private async loadSettings(): Promise<void> {
        this.settings = await getSettings();
    }

    private groupAndCountReactionsByBugnoteId(reactions: Reaction[]): Record<string, Record<string, {
        count: number;
        reactions: Reaction[];
        usernames: string[];
    }>> {
        return reactions.reduce((acc, reaction) => {
            const bugnoteId = 'c' + reaction.bugnote_id;
            const emoji = reaction.emoji || 'unknown';
            const username = reaction.username || 'unknown';

            acc[bugnoteId] = acc[bugnoteId] || {};
            acc[bugnoteId][emoji] = acc[bugnoteId][emoji] || {count: 0, reactions: [], usernames: []};

            acc[bugnoteId][emoji].count++;
            acc[bugnoteId][emoji].reactions.push(reaction);

            if (!acc[bugnoteId][emoji].usernames.includes(username)) {
                acc[bugnoteId][emoji].usernames.push(username);
            }

            return acc;
        }, {} as Record<string, Record<string, { count: number; reactions: Reaction[]; usernames: string[] }>>);
    }


    private async getAllReactions(): Promise<Reaction[]> {
        try {
            const response = await fetch(this.settings.url, {
                method: 'POST',
                headers: {'Content-Type': 'application-json'},
                body: JSON.stringify({bugId: this.settings.bugId, action: this.settings.actions.get_reactions})
            })

            if (!response.ok) {
                const message: string = `Failed ${this.settings.actions.get_reactions} action. Status: ${response.status}. Message: ${await response.text()}`
                console.error(message);
                throw new Error(message);
            }
            return await response.json() as Reaction[];
        } catch (error) {
            console.error(`Error performing ${this.settings.actions.get_reactions} action.`, error);
            throw error;
        }
    }

    async createReactionContainer(bugnoteId: string): Promise<HTMLElement> {

        const reactions: Reaction[] = await this.getAllReactions();

        const reactionsByBugnote = this.groupAndCountReactionsByBugnoteId(reactions);

        const div: HTMLElement = document.createElement("div");
        div.classList.add('bugnote-reaction-icons', 'bugnote-reaction-icons-' + bugnoteId, 'hidden-until-ready');

        if (!reactionsByBugnote[bugnoteId]) {
            return div;
        }

        for (const [emoji, {count, usernames}] of Object.entries(reactionsByBugnote[bugnoteId])) {
            const reactionButton: HTMLElement = this.createReactionButton(emoji, usernames);
            const span: HTMLSpanElement = this.createElement('span', ['reaction-count']) as HTMLSpanElement;
            span.textContent = count.toString();

            reactionButton.textContent = `${emoji}`;
            reactionButton.dataset.bugnoteId = bugnoteId;
            reactionButton.appendChild(span);
            div.appendChild(reactionButton);
        }
        return div;
    }

    private createButton(text: string): HTMLButtonElement {
        const button: HTMLButtonElement = this.createElement('button', ['reaction-button']) as HTMLButtonElement;
        button.dataset.emoji = text;
        button.textContent = text;
        return button;
    }

    private createElement(tag: string, classList: string[] = []): HTMLElement {
        const element: HTMLElement = document.createElement(tag);
        element.classList.add(...classList);
        return element;
    }

    private createReactionButton(reaction: string, usernames: string[]): HTMLElement {
        const button: HTMLButtonElement = this.createButton(reaction)
        const tooltip: HTMLDivElement = this.tooltip.createTooltip()

        button.textContent = reaction
        button.appendChild(tooltip)

        button.addEventListener("click", () => {
            this.handleEmojiClick(reaction, button);
        })

        this.tooltip.attachTooltipModalEvents(button, usernames);

        return button
    }

    async handleEmojiClick(emoji: string, button: HTMLElement): Promise<void> {
        const bugnoteId = this.getBugnoteId(button);
        const response: ReactionResponse = await this.saveReaction(emoji, bugnoteId);

        const reactionIcons = document.querySelector(`.bugnote-reaction-icons-${bugnoteId}`);
        if (!reactionIcons) {
            return;
        }

        const existingButton = reactionIcons.querySelector(`[data-emoji="${emoji}"]`);

        if (!existingButton) {

            const newButton = this.createReactionButton(emoji, [response.username]);

            const span: HTMLSpanElement = this.createElement('span', ['reaction-count']) as HTMLSpanElement;
            span.textContent = '1';
            newButton.appendChild(span);

            reactionIcons.appendChild(newButton);
        } else if (response?.action) {
            this.updateReactionCount(existingButton as HTMLElement, response);
        }
    }

    private updateReactionCount(button: HTMLElement, response: ReactionResponse): void {
        const span: HTMLSpanElement | null = button.querySelector('.reaction-count');

        if (span) {
            const currentCount = parseInt(span.textContent || '0');
            const newCount = this.calculateNewCount(currentCount, response.action);

            if (response.action === 'delete') {
                this.tooltip.removeUserFromTooltipModal(button, response.username);
            } else if (response.action === 'save') {
                this.tooltip.addUserToTooltipModal(button, response.username);
            }
            this.updateButtonOrRemove(button, newCount, span);
        }
    }

    private calculateNewCount(currentCount: number, action: string): number {
        return action === 'delete' ? currentCount - 1 : currentCount + 1;
    }

    private updateButtonOrRemove(button: HTMLElement, newCount: number, span: HTMLSpanElement): void {
        if (newCount === 0) {
            button.remove();
        } else {
            span.textContent = newCount.toString();
        }
    }

    private getBugnoteId(button: HTMLElement): string {
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


    private async saveReaction(emoji: string, bugnoteId: string): Promise<ReactionResponse> {
        try {
            const response = await this.sendReactionRequest(emoji, bugnoteId);

            if (!response.ok) {
                const message: string = `Failed ${this.settings.actions.reaction} action. Status: ${response.status}. Message: ${await response.text()}`;
                console.error(message);
                throw new Error(message);
            }

            const responseText = await response.text();
            try {
                const parsedResponse = JSON.parse(responseText);

                const action: 'delete' | 'save' = parsedResponse.action === 'delete' || parsedResponse.action === 'save'
                    ? parsedResponse.action
                    : 'save';

                return {
                    action: action,
                    username: parsedResponse.username
                };
            } catch (jsonError) {
                console.error('Failed to parse server response as JSON:', jsonError);
                throw new Error(`Invalid JSON response: ${responseText}`);
            }
        } catch (error) {
            console.error(`Error performing ${this.settings.actions.reaction} action.`, error);
            throw error;
        }
    }

    private async sendReactionRequest(emoji: string, bugnoteId: string): Promise<Response> {
        return fetch(this.settings.url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                bugnoteId,
                bugId: this.settings.bugId,
                emoji,
                action: this.settings.actions.reaction,
            }),
        });
    }
}