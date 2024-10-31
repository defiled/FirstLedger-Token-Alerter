let monitorWindow = null;

// Open monitor window when extension icon is clicked
chrome.action.onClicked.addListener(() => {
    if (monitorWindow) {
        // If window exists, focus it
        chrome.windows.update(monitorWindow.id, { focused: true });
    } else {
        // Create new window
        chrome.windows.create(
            {
                url: chrome.runtime.getURL("monitor.html"),
                type: "popup",
                width: 800,
                height: 600,
            },
            (window) => {
                monitorWindow = window;
            }
        );
    }
});

// Track window closure
chrome.windows.onRemoved.addListener((windowId) => {
    if (monitorWindow && monitorWindow.id === windowId) {
        monitorWindow = null;
    }
});

// Handle notifications
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "NEW_TOKEN") {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "New Token Listed!",
            message: `New token found: ${message.tokenName}`,
        });
    }
});
