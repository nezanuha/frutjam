type ArriveFrom = 'right' | 'left' | 'bottom' | 'top';
type TimeoutId = ReturnType<typeof setTimeout> | null;

interface NotificationOptions {
    effect?: string;
    escapeTime?: number;
    arriveTime?: number;
    autoClose?: boolean;
    arriveFrom?: ArriveFrom;
    element?: HTMLElement | null;
}

declare class Notification {
    effect: string;
    escapeTime: number;
    arriveTime: number;
    autoClose: boolean;
    arriveFrom: ArriveFrom;
    element: HTMLElement | null;
    timeoutId: TimeoutId;
    constructor({ effect, escapeTime, arriveTime, autoClose, arriveFrom, element }?: NotificationOptions);
    render(): void;
    init(): void;
    toggleNotification(container: HTMLElement | null, type?: string): void;
}

export { Notification as default };
