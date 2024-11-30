import {getSettings, NoteSettings, DEFAULT_SETTINGS} from '../utils/utils';

export class BugnotesHelper {
    private settings: NoteSettings = DEFAULT_SETTINGS

    constructor() {
        this.init()
    }
    private async init() {
        this.settings = await getSettings();
        await this.getHighlightedBugnotes()
    }
    async getHighlightedBugnotes(): Promise<string[]> {
        try {
            const response = await fetch(this.settings.url!, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: this.settings.actions.get_highlights,
                    bugId: this.settings.bugId,
                }),
            })

            if (response.ok) {
                const data = await response.json();
                return data
            } else {
                console.error(`Error fetching issues: ${response.statusText}`);
            }
        } catch (e) {
            console.error(e)
        }
        return []
    }

    getBugnotesTable(): HTMLDivElement | null {
        const elements = document.querySelectorAll('#bugnotes');
        if (elements.length < 2) {
            return elements[0] as HTMLTableElement
        }
        return elements[1] as HTMLTableElement;
    }

    getBugnotesTableRows(): HTMLTableCellElement[] | null {

        const bugnotesTable = this.getBugnotesTable();

        if (!bugnotesTable) {
            return null;
        }

        const tdElements: HTMLTableCellElement[] = Array.from(bugnotesTable.querySelectorAll<HTMLTableCellElement>('.category'))
        if (tdElements.length === 0) {
            return null
        }
        return tdElements;
    }
    makeBugnoteHighlighted(bugnote: HTMLTableCellElement): void {
        bugnote.parentElement!.classList.toggle('highlighted')
    }

}