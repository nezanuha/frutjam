export { default as Notification } from './notification.js';
export { default as TelephoneInput } from './telephoneInput.js';

declare class Popover {
    autoPopup: boolean;
    popupTime: number;
    timeoutId: number | null;
    constructor({ autoPopup, popupTime }?: {
        autoPopup?: boolean;
        popupTime?: number;
    });
    action(): void;
    togglePopover(popoverContent: HTMLElement): void;
}

export { Popover };
