/*
* Notification
* @version: 0.0.2
* @author: Nezanuha
* @license: Licensed under MIT
* Copyright 2023 Nezanuha
*/

import { NotificationOptions } from './interfaces';
import type { ArriveFrom, TimeoutId } from './types';
import "./styles.css"
import { config } from './config';

export default class Notification {
    effect: string;
    escapeTime: number;
    arriveTime: number;
    autoClose: boolean;
    arriveFrom: ArriveFrom;
    element: HTMLElement | null;
    timeoutId: TimeoutId;

    constructor({ effect = 'fade', escapeTime = 3000, arriveTime = 200, autoClose = true, arriveFrom = 'right', element = null }: NotificationOptions = {}) {
        this.effect = effect;
        this.arriveTime = arriveTime;
        this.autoClose = autoClose;
        this.arriveFrom = arriveFrom;
        this.escapeTime = escapeTime;
        this.element = element;
        this.timeoutId = null; // Initialize timeout ID as null
        this.render();
        this.init();
    }

    render() {
        if (typeof this.element === 'string') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = this.element;
            this.element = tempDiv.firstChild as HTMLElement;
            this.element.setAttribute("data-fj", "user-element");
        }
    
        // Inside the render method of the Notification class
        if (this.element instanceof HTMLElement) {
            let container = document.querySelector<HTMLElement>("[data-fj='notification']");
            if (!container) {
                container = document.createElement('div');
                container.setAttribute('data-fj', 'notification');
                document.querySelector("body")?.insertAdjacentElement('beforeend', container);
            }

            // Check if the element being appended is not the same as the container itself
            if (this.element !== container) {
                container.appendChild(this.element);
            }


            if (this.effect == 'slide') {
                const arriveFromClass = config.arriveFrom[this.arriveFrom];
                this.element.classList.add(arriveFromClass, 'duration-300');
            } else {
                this.element.classList.add('opacity-0', 'duration-300');
            }
        } else {
            console.error("No element provided. Element must be either an HTMLElement or a string representing raw HTML.");
        }
        
    
        this.timeoutId = setTimeout(() => {
            this.toggleNotification(this.element); // Pass the current element to toggleNotification
            this.timeoutId = null;
        }, this.arriveTime);
    
        if (this.autoClose === true) {
            this.timeoutId = setTimeout(() => {
                this.toggleNotification(this.element, 'close'); // Pass the current element to toggleNotification
                this.timeoutId = null;
            }, this.escapeTime);
        }
    }

    init() {
        const handleClick = (e: MouseEvent) => {
            const self = e.target as HTMLElement;
            const userElement = self.closest<HTMLElement>("[data-fj='user-element']");
            if (userElement) {
                this.toggleNotification(userElement, 'close');
            }
    
            if (this.timeoutId !== null) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
        };
    
        // Add event listeners only once for all toggle buttons
        const toggleButtons = document.querySelectorAll<HTMLElement>("[data-fj='toggle-btn']");
        toggleButtons.forEach(button => {
            // Check if the event listener is already added before adding it again
            if (!button.dataset.clickEventAdded) {
                button.dataset.clickEventAdded = "true"; // Set a flag to indicate that the event listener is added
                button.addEventListener("click", handleClick);
            }
        });
    }

    toggleNotification(container: HTMLElement | null, type?: string) {
        if (container instanceof HTMLElement) {
            if (this.effect == 'slide') {
                const arriveFromClass = config.arriveFrom[this.arriveFrom];
                container.classList.toggle(arriveFromClass, !container.classList.contains(arriveFromClass));
            } else {
                container.classList.toggle("opacity-0", !container.classList.contains("opacity-0"));
            }
            if (type === 'close') {
                setTimeout(() => {
                    container.remove();
                }, 300);
            }
        } else {
            console.error("Container is null or not an HTMLElement.");
        }
    }     
}
