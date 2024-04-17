import { NotificationConfig } from "./interfaces";

export const config: NotificationConfig = {
    arriveFrom: {
        right: 'translate-x-full',
        left: '-translate-x-full',
        bottom: 'translate-y-full',
        top: '-translate-y-full',
    },
    effects: {
        slide: 'duration-300',
        fade: 'opacity-0 duration-300',
    },
};