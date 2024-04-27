
/*
* Tabs
* @version: 0.0.2
* @author: Nezanuha
* @license: Licensed under MIT
* Copyright 2024 Nezanuha
*/

import { TabOptions } from "./types";

export default class Tabs {
    private tabs: HTMLElement[];
    private tabContents: HTMLElement[];
    private options: TabOptions;

    constructor(options?: TabOptions) {
        this.tabs = Array.from(document.querySelectorAll('.tab'));
        this.tabContents = Array.from(document.querySelectorAll('.tab-content'));
        this.options = options || {};

        this.init();
        this.handleInitialTabState();
    }

    private init() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.toggleTab(tab));
        });
    }

    private toggleTab(selectedTab: HTMLElement) {
        const tabId = selectedTab.dataset.tab;

        if (!tabId || selectedTab.classList.contains('disabled')) return;

        this.tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        selectedTab.classList.add('active');

        this.tabContents.forEach(content => {
            if (content.id === tabId) {
                content.style.display = 'block';
                this.animateTab(content);
                if (this.options.onTabActive) {
                    this.options.onTabActive(tabId);
                }
            } else {
                content.style.display = 'none';
            }
        });
    }

    private animateTab(content: HTMLElement) {
        // Implement your animation logic here
        content.style.opacity = '0';
        setTimeout(() => {
            content.style.opacity = '1';
        }, 300);
    }

    private handleInitialTabState() {
        if (this.options.disableTabs === 'all') {
            this.disableAllTabs();
        } else if (Array.isArray(this.options.disableTabs)) {
            this.disableTabs(this.options.disableTabs);
        } else if (this.options.enableTabs === 'all') {
            this.enableAllTabs();
        } else if (Array.isArray(this.options.enableTabs)) {
            this.enableTabs(this.options.enableTabs);
        }
    }

    private disableAllTabs() {
        this.tabs.forEach(tab => {
            tab.classList.add('disabled');
        });
    }

    private enableAllTabs() {
        this.tabs.forEach(tab => {
            tab.classList.remove('disabled');
        });
    }

    enableTabs(tabIds?: string[] | 'all') {
        if (tabIds === 'all') {
            this.enableAllTabs();
        } else if (Array.isArray(tabIds)) {
            tabIds.forEach(tabId => {
                const tab = this.tabs.find(tab => tab.dataset.tab === tabId);
                if (tab) {
                    tab.classList.remove('disabled');
                }
            });
        }
    }

    disableTabs(tabIds?: string[] | 'all') {
        if (tabIds === 'all') {
            this.disableAllTabs();
        } else if (Array.isArray(tabIds)) {
            tabIds.forEach(tabId => {
                const tab = this.tabs.find(tab => tab.dataset.tab === tabId);
                if (tab) {
                    tab.classList.add('disabled');
                }
            });
        }
    }
}