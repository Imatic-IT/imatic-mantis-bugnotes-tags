import { getSettings, NoteSettings, DEFAULT_SETTINGS } from './utils';

export class CollapseHelper {
    private settings: NoteSettings = DEFAULT_SETTINGS;

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        this.settings = await getSettings();
    }

    async getCollapsedBugnotes(): Promise<string[]> {
        try {
            const response = await fetch(this.settings.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: this.settings.actions.get_collapsed,
                    bugId: this.settings.bugId,
                    csrfToken: this.settings.csrfToken,
                }),
            });
            if (response.ok) {
                return await response.json();
            }
            console.error(`Error fetching collapsed bugnotes: ${response.statusText}`);
        } catch (e) {
            console.error(e);
        }
        return [];
    }

    async getFoldMode(): Promise<boolean> {
        try {
            const response = await fetch(this.settings.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: this.settings.actions.get_fold_mode,
                    bugId: this.settings.bugId,
                    csrfToken: this.settings.csrfToken,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                return data.enabled === true;
            }
            console.error(`Error fetching fold mode: ${response.statusText}`);
        } catch (e) {
            console.error(e);
        }
        return false;
    }

    async setFoldMode(enabled: boolean): Promise<boolean> {
        try {
            const response = await fetch(this.settings.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: this.settings.actions.set_fold_mode,
                    bugId: this.settings.bugId,
                    enabled,
                    csrfToken: this.settings.csrfToken,
                }),
            });
            return response.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async collapse(bugnoteId: string): Promise<boolean> {
        try {
            const response = await fetch(this.settings.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: this.settings.actions.collapse,
                    bugnoteId,
                    bugId: this.settings.bugId,
                    csrfToken: this.settings.csrfToken,
                }),
            });
            return response.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async uncollapse(bugnoteId: string): Promise<boolean> {
        try {
            const response = await fetch(this.settings.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: this.settings.actions.uncollapse,
                    bugnoteId,
                    bugId: this.settings.bugId,
                    csrfToken: this.settings.csrfToken,
                }),
            });
            return response.ok;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}
