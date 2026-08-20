export class IconManager {

    saveIconClass: string = 'fa-bookmark'
    savedIconClass: string = 'fa-bookmark-o'

    toggleSaveBugnoteIcon(bugnote: HTMLTableCellElement): void {
        const i: HTMLElement | null = bugnote.querySelector('.bugnote-save-icon');

        if (i) {
            if (i.classList.contains(this.saveIconClass)) {
                i.classList.replace(this.saveIconClass, this.savedIconClass);
            } else {
                i.classList.replace(this.savedIconClass, this.saveIconClass);
            }
        }
    }

    createSaveBugnoteIcon(): HTMLElement {
        const i: HTMLElement = document.createElement("i")
        i.classList.add('bugnote-icon', 'bugnote-save-icon', 'fa', this.savedIconClass)
        return i;
    }

    createReactionOnBugnoteIcon(): HTMLElement {
        const i: HTMLElement = document.createElement("i")
        i.classList.add('bugnote-icon', 'fa', 'fa-smile-o', 'bugnote-reaction-icon')
        return i;
    }

    createCollapseBugnoteIcon(): HTMLElement {
        const i = document.createElement('i');
        i.classList.add('bugnote-icon', 'bugnote-collapse-icon', 'fa', 'fa-chevron-down');
        return i;
    }

    toggleCollapseIcon(bugnote: HTMLTableCellElement, isCollapsed: boolean): void {
        const icon = bugnote.querySelector('.bugnote-collapse-icon');
        if (!icon) return;
        if (isCollapsed) {
            icon.classList.replace('fa-chevron-down', 'fa-chevron-right');
        } else {
            icon.classList.replace('fa-chevron-right', 'fa-chevron-down');
        }
    }
}