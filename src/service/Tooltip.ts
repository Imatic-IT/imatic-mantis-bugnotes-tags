export class Tooltip {

    createTooltip(): HTMLDivElement {
        return this.createElement('div', ['reaction-tooltip']) as HTMLDivElement;
    }

    private createElement(tag: string, classList: string[] = []): HTMLElement {
        const element: HTMLElement = document.createElement(tag);
        element.classList.add(...classList);
        return element;
    }


    attachTooltipModalEvents(button: HTMLButtonElement, names: string[]): void {
        button.addEventListener("mouseover", () => {
            let modal = document.querySelector(".reaction-modal") as HTMLDivElement;
            if (!modal) {
                modal = this.createElement('div', ['reaction-modal']) as HTMLDivElement;
                document.body.appendChild(modal);
            }

            const rect: DOMRect = button.getBoundingClientRect();
            modal.style.position = "fixed";
            modal.style.top = `${rect.top - modal.offsetHeight}px`;
            modal.style.left = `${rect.left + button.offsetWidth / 2}px`;

            const currentNames = button.dataset.names ? JSON.parse(button.dataset.names) : names;
            modal.textContent = currentNames.join(", ");
        });

        button.addEventListener("mouseout", () => {
            const modal: Element | null = document.querySelector(".reaction-modal");
            modal?.remove();
        });
        button.dataset.names = JSON.stringify(names);
    }

    addUserToTooltipModal(button: HTMLElement, name: string): void {
        const modal: HTMLDivElement | null = document.querySelector(".reaction-modal");
        if (!modal) {
            return;
        }
        const names: string[] = button.dataset.names ? JSON.parse(button.dataset.names) : [];
        names.push(name);

        button.dataset.names = JSON.stringify(names);
        modal.textContent = names.join(", ");
    }

    removeUserFromTooltipModal(button: HTMLElement, name: string): void {
        const modal: HTMLDivElement | null = document.querySelector(".reaction-modal");
        if (!modal) {
            return;
        }
        const names: string[] = button.dataset.names ? JSON.parse(button.dataset.names) : [];
        const index: number = names.indexOf(name);
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