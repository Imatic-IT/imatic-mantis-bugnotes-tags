import data from './data.json';
import messages from './messages.json';

export class ImaticEmojiPicker {
    private emojis: { [groupKey: string]: string[] } = {};
    private emojisGroups: { [key: string]: { key: string, message: string, order: number } } = {};
    private modalId: string = 'emojiPickerModal';
    private onEmojiSelectCallback: (emoji: string) => void = () => {
    };

    constructor() {
        this.initializeEmojis();
        this.initializeEmojiGroups();

        this.createModal();
        this.attachEventListeners();
    }

    private initializeEmojis(): void {
        data.forEach((item) => {
            if (item.group !== null && item.group !== undefined) {
                if (!this.emojis[item.group]) {
                    this.emojis[item.group] = [];
                }
                if (!this.emojis[item.group].includes(item.emoji)) {
                    this.emojis[item.group].push(item.emoji);
                }
            }
        });
    }

    public setOnEmojiSelect(callback: (emoji: string) => void): void {
        this.onEmojiSelectCallback = callback;
    }

    private onEmojiSelected(emoji: string): void {
        this.onEmojiSelectCallback(emoji);
        this.closeModal();
    }

    private initializeEmojiGroups(): void {
        messages.groups.forEach((group: { key: string, message: string, order: number }) => {
            this.emojisGroups[group.order] = group;
        });
    }

    private getFirstEmojiFromGroup(groupKey: string): string {
        return this.emojis[groupKey]?.[0] || '';
    }

    private getEmojiGroup(groupKey: string): string {

        return this.emojisGroups[groupKey]?.message.toUpperCase() || 'Unknown';
    }

    private createModal(): void {
        const modalHtml = `
        <div class="modal" id="${this.modalId}" tabindex="-1" role="dialog" aria-labelledby="${this.modalId}Label" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <div class="emoji-filters">
                            ${Object.keys(this.emojis).map(groupKey => `
                                <p class="emoji-filter-btn">
                                    <span class="emoji-filter-link" data-group="${groupKey}">
                                        ${this.getFirstEmojiFromGroup(groupKey)}  
                                    </span>
                                </p>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-body">
                        <div class="emoji-list">
                            ${Object.keys(this.emojis).map(groupKey => `
                                <div class="emoji-group" id="group-${groupKey}">
                                    <p>${this.getEmojiGroup(groupKey)}</p>
                                    <div class="emoji-group-content">
                                        ${this.emojis[groupKey].map(emoji => `
                                            <button class="emoji-btn" data-emoji="${emoji}">${emoji}</button>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.attachFilterClickListeners();
    }


    private attachFilterClickListeners(): void {
        const filters = document.querySelectorAll('.emoji-filter-link');
        filters.forEach(filter => {
            filter.addEventListener('click', (event) => {
                const groupKey = (event.target as HTMLElement).getAttribute('data-group');
                if (groupKey) {
                    const groupElement = document.getElementById(`group-${groupKey}`);
                    if (groupElement) {
                        const parentElement = groupElement.closest('.modal-body') as HTMLElement;
                        if (parentElement) {
                            parentElement.scrollTo({
                                top: (groupElement as HTMLElement).offsetTop - parentElement.offsetTop,
                                behavior: 'smooth',
                            });
                        }
                    }
                }
            });
        });
    }

    private attachEventListeners(): void {
        document.body.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;
            if (target && target.classList.contains('emoji-btn')) {
                const emoji = target.getAttribute('data-emoji');
                if (emoji) {
                    this.onEmojiSelected(emoji);
                }
            }
        });

        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;

            if (target && target.classList.contains('bugnote-reaction-icon')) {
                return;
            }

            const modal = document.getElementById(this.modalId);
            const modalContent = modal?.querySelector('.modal-content');

            if (modal && modalContent) {
                if (!modalContent.contains(target)) {
                    this.closeModal();
                }
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    public showModalOnClick(event: MouseEvent, _reactionIcon: HTMLElement): void {
        const modal = document.getElementById(this.modalId);

        if (modal) {
            const {x, y} = this.calculatePosition(event);

            modal.style.position = 'absolute';
            modal.style.top = `${y}px`;
            modal.style.left = `${x}px`;

            modal.classList.add('show');
        } else {
            console.error(`Modal with ID ${this.modalId} not found.`);
        }
    }

    private closeModal(): void {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }

    private calculatePosition(event: MouseEvent): { x: number, y: number } {
        return {
            x: event.clientX + window.scrollX,
            y: event.clientY + window.scrollY
        };
    }
}
