// Listen for messages from the monitoring page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "GET_TOKENS") {
        console.log("Content script received GET_TOKENS request");

        const tokens = [];
        const tokenElements = document.querySelectorAll("a.grid");

        console.log("Found token elements:", tokenElements.length);

        tokenElements.forEach((element) => {
            const titleDiv = element.querySelector(".description .title");
            const tokenName = titleDiv ? titleDiv.textContent.trim() : "";

            if (tokenName) {
                tokens.push({
                    name: tokenName,
                    // Add a test token for development
                    isTest: false, //tokenName === "$TEST123",
                });
                console.log("Found token:", tokenName);
            }
        });

        // Add a test token if none exist (for development)
        if (tokens.length === 0) {
            tokens.push({ name: "$TEST123", isTest: true });
        }

        console.log("Sending tokens response:", tokens);
        sendResponse({ tokens: tokens });
        return true; // Important: keeps the message channel open for async response
    }
});

// Inject a test token every 10 seconds for development
setInterval(() => {
    const testToken = { name: "$TEST123", isTest: true };
    document.dispatchEvent(
        new CustomEvent("newTestToken", { detail: testToken })
    );
}, 10000);
