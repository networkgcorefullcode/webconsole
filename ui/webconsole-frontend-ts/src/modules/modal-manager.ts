export class ModalManager {
    private modalElement: HTMLElement | null;

    constructor(modalId: string) {
        this.modalElement = document.getElementById(modalId);
    }

    openModal(): void {
        if (this.modalElement) {
            this.modalElement.classList.add('is-active');
        }
    }

    closeModal(): void {
        if (this.modalElement) {
            this.modalElement.classList.remove('is-active');
        }
    }

    setModalContent(content: string): void {
        if (this.modalElement) {
            const contentElement = this.modalElement.querySelector('.modal-content');
            if (contentElement) {
                contentElement.innerHTML = content;
            }
        }
    }

    onConfirm(callback: () => void): void {
        const confirmButton = this.modalElement?.querySelector('.modal-confirm');
        if (confirmButton) {
            confirmButton.addEventListener('click', () => {
                callback();
                this.closeModal();
            });
        }
    }

    onCancel(callback: () => void): void {
        const cancelButton = this.modalElement?.querySelector('.modal-cancel');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                callback();
                this.closeModal();
            });
        }
    }
}