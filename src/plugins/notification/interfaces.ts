import type { ArriveFrom, TimeoutId } from './types';

export interface NotificationOptions {
    effect?: string;
    escapeTime?: number;
    arriveTime?: number;
    autoClose?: boolean;
    arriveFrom?: ArriveFrom;
    element?: HTMLElement | null;
}

export interface NotificationConfig {
    arriveFrom: {
        right: string;
        left: string;
        bottom: string;
        top: string;
    };
    effects: {
        [key: string]: string;
    };
}