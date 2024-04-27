type TabOptions = {
    disableTabs?: string[] | 'all'; // Array of tab IDs to disable or 'all' to disable all tabs
    enableTabs?: string[] | 'all'; // Array of tab IDs to enable or 'all' to enable all tabs
    onTabActive?: (tabId: string) => void;
};

export type { TabOptions }