import type { ArriveFrom, TimeoutId } from './types';

export interface NotificationOptions {
    effect?: string;
    escapeTime?: number;
    arriveTime?: number;
    autoClose?: boolean;
    arriveFrom?: ArriveFrom; // Use the ArriveFrom type here
    element?: HTMLElement | null;
}

// Define your Config interface or type with index signature for effects
export interface NotificationConfig {
    arriveFrom: {
        right: string;
        left: string;
        bottom: string;
        top: string;
    };
    effects: {
        [key: string]: string; // Index signature for effects
    };
}