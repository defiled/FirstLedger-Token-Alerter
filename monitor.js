let previousTokens = new Set();
let refreshCount = 0;
let tokenCount = 0;
let startTime = null;
let refreshInterval = null;
let audio = null;
let monitoringTabId = null;
let isFirstLoad = true;
let chatIdStorage = {
    get: async () => {
        if (chrome.storage) {
            return new Promise((resolve) => {
                chrome.storage.local.get("telegramChatId", (data) => {
                    resolve(data.telegramChatId || "");
                });
            });
        } else {
            return localStorage.getItem("telegramChatId") || "";
        }
    },
    set: async (value) => {
        if (chrome.storage) {
            return new Promise((resolve) => {
                chrome.storage.local.set({ telegramChatId: value }, resolve);
            });
        } else {
            localStorage.setItem("telegramChatId", value);
        }
    },
};

const TELEGRAM_CONFIG = {
    botToken: "7702772482:AAHDaRaNJXKExgotEOH98SRsiPCb9IMDx9g",
};

// DOM elements
const volumeSlider = document.getElementById("volume");
const volumeLevel = document.getElementById("volume-level");
const searchTemplate = document.getElementById("search-template");
const searchPreview = document.getElementById("search-preview");
const alertSoundSelect = document.getElementById("alert-sound");
const startButton = document.getElementById("start-button");
const testSoundButton = document.getElementById("test-sound");
const telegramChatId = document.getElementById("telegram-chat-id");
const testTelegramBtn = document.getElementById("test-telegram");
const telegramStatus = document.getElementById("telegram-status");
const autoSearchToggle = document.getElementById("auto-search");

// Set default search template
searchTemplate.value = "XRP {ticker} twitter";

// Load saved auto-search preference
chrome.storage.local.get("autoSearch", (data) => {
    autoSearchToggle.checked = data.autoSearch !== false; // Default to true if not set
});

// Save auto-search preference when changed
autoSearchToggle.addEventListener("change", (e) => {
    chrome.storage.local.set({ autoSearch: e.target.checked });
});

// Event Listeners
volumeSlider.addEventListener("input", (e) => {
    const volume = e.target.value;
    if (audio) {
        audio.volume = volume / 100;
    }
    volumeLevel.textContent = volume + "%";
});

alertSoundSelect.addEventListener("change", (e) => {
    if (audio) {
        audio.src = chrome.runtime.getURL(e.target.value);
        playTestSound();
    }
});

searchTemplate.addEventListener("input", updateSearchPreview);

testSoundButton.addEventListener("click", () => {
    playTestSound();
});

startButton.addEventListener("click", async () => {
    if (!audio) initializeAudio();

    try {
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
        console.log("Audio test successful");
    } catch (e) {
        console.error("Audio test failed:", e);
        alert(
            "Please click somewhere on the page to enable sound notifications"
        );
        return;
    }

    if (!startTime) {
        startTime = new Date();
        document.getElementById("start-time").textContent =
            startTime.toLocaleTimeString();
        startButton.textContent = "Stop Monitoring";
        isFirstLoad = true;
        startMonitoring();
    } else if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        startButton.textContent = "Resume Monitoring";
    } else {
        startButton.textContent = "Stop Monitoring";
        isFirstLoad = true;
        startMonitoring();
    }
});

async function sendTelegramAlert(tokenName, isTest = false) {
    try {
        // Get the stored chat ID
        const chatId = await chatIdStorage.get();
        if (!chatId) {
            console.log("No Telegram chat ID configured");
            return;
        }

        const message = isTest
            ? "🔔 Test Message: Your Telegram notifications are working!"
            : `🔥 New Token Alert\n\nToken: ${tokenName}\nTime: ${new Date().toLocaleTimeString()}\nSearch: ${searchUrl}`;

        const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;

        console.log("Sending Telegram message to chat:", chatId);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                disable_web_page_preview: false,
            }),
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
            throw new Error(data.description || "Unknown Telegram error");
        }

        return true;
    } catch (e) {
        console.error("Telegram error details:", {
            error: e.message,
            tokenName: tokenName,
        });
        throw e;
    }
}

(async () => {
    const savedChatId = await chatIdStorage.get();
    if (savedChatId) {
        telegramChatId.value = savedChatId;
    }
})();

telegramChatId.addEventListener("change", async () => {
    const chatId = telegramChatId.value.trim();
    await chatIdStorage.set(chatId);
});

// Test Telegram button
testTelegramBtn.addEventListener("click", async () => {
    const chatId = telegramChatId.value.trim();
    if (!chatId) {
        telegramStatus.textContent = "Please enter a chat ID first";
        telegramStatus.style.color = "#f44336";
        return;
    }

    // Save the chat ID first before testing
    await chatIdStorage.set(chatId);

    telegramStatus.textContent = "Sending test message...";
    try {
        await sendTelegramAlert("TEST_MESSAGE", true);
        telegramStatus.textContent = "Test message sent successfully!";
        telegramStatus.style.color = "#4CAF50";
    } catch (e) {
        console.error("Telegram test failed:", e);
        telegramStatus.textContent = `Failed to send: ${e.message}`;
        telegramStatus.style.color = "#f44336";
    }
});

function initializeAudio() {
    audio = new Audio(chrome.runtime.getURL(alertSoundSelect.value));
    audio.volume = volumeSlider.value / 100;
}

function playTestSound() {
    if (!audio) initializeAudio();
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch((e) => {
            console.error("Audio play error details:", {
                error: e.name,
                message: e.message,
                code: e.code,
            });
        });
    }
}

function updateSearchPreview() {
    const template = searchTemplate.value;
    searchPreview.textContent = template.replace("{ticker}", "$EXAMPLE");
}

function updateStats() {
    document.getElementById("refresh-count").textContent = refreshCount;
    document.getElementById("token-count").textContent = tokenCount;

    if (startTime) {
        const hoursElapsed = (new Date() - startTime) / (1000 * 60 * 60);
        const tokensPerHour = (tokenCount / hoursElapsed).toFixed(2);
        document.getElementById("tokens-per-hour").textContent = tokensPerHour;
    }
}

async function createMonitoringTab() {
    const tab = await chrome.tabs.create({
        url: "https://firstledger.net/tokens",
        active: false,
    });
    monitoringTabId = tab.id;
    console.log("Created monitoring tab:", tab.id);
    return tab;
}

async function extractTokens() {
    try {
        if (!monitoringTabId) {
            console.error("No monitoring tab found");
            return [];
        }

        const result = await chrome.scripting.executeScript({
            target: { tabId: monitoringTabId },
            func: () => {
                const tokens = [];
                const elements = document.querySelectorAll("a.grid");
                elements.forEach((element) => {
                    const titleDiv = element.querySelector(
                        ".description .title"
                    );
                    if (titleDiv) {
                        tokens.push({ name: titleDiv.textContent.trim() });
                    }
                });
                return tokens;
            },
        });

        return result[0].result;
    } catch (e) {
        console.error("Error extracting tokens:", e);
        return [];
    }
}

async function startMonitoring() {
    if (!monitoringTabId) {
        await createMonitoringTab();
    }

    refreshInterval = setInterval(async () => {
        try {
            await chrome.tabs.reload(monitoringTabId);
            refreshCount++;
            updateStats();

            await new Promise((resolve) => setTimeout(resolve, 1000));

            const tokens = await extractTokens();
            if (Array.isArray(tokens)) {
                checkForNewTokens(tokens);
            }
        } catch (e) {
            console.error("Error in monitoring cycle:", e);
            if (e.message.includes("No tab with id")) {
                monitoringTabId = null;
                await createMonitoringTab();
            }
        }
    }, 3000);
}

async function checkForNewTokens(tokens) {
    if (!Array.isArray(tokens)) {
        console.error("Invalid tokens data in checkForNewTokens:", tokens);
        return;
    }

    tokens.forEach(async (token) => {
        if (!token || !token.name) {
            console.warn("Invalid token object:", token);
            return;
        }

        const tokenKey = token.name;

        if (!previousTokens.has(tokenKey)) {
            if (!isFirstLoad) {
                tokenCount++;
                updateStats();

                if (audio) {
                    audio.currentTime = 0;
                    audio.play().catch((e) => {
                        console.error("Audio play error details:", {
                            error: e.name,
                            message: e.message,
                            code: e.code,
                            state: audio.readyState,
                            audioSrc: audio.src,
                        });
                    });
                }

                if (autoSearchToggle.checked) {
                    const searchQuery = searchTemplate.value.replace(
                        "{ticker}",
                        token.name
                    );

                    window.open(
                        `https://www.google.com/search?q=${encodeURIComponent(
                            searchQuery
                        )}`,
                        "_blank"
                    );
                }

                chrome.runtime.sendMessage({
                    type: "NEW_TOKEN",
                    tokenName: token.name,
                });

                await sendTelegramAlert(token.name);
            }

            previousTokens.add(tokenKey);
        }
    });

    if (isFirstLoad) {
        console.log(
            "Initial token list loaded:",
            previousTokens.size,
            "tokens"
        );
        isFirstLoad = false;
    }
}

// Initialize audio on page load with user gesture
document.addEventListener(
    "click",
    function initAudio() {
        if (!audio) {
            initializeAudio();
            audio
                .play()
                .then(() => {
                    audio.pause();
                    audio.currentTime = 0;
                    document.removeEventListener("click", initAudio);
                })
                .catch(console.error);
        }
    },
    { once: true }
);

function setupCopyButton(elementId) {
    document.getElementById(elementId).addEventListener("click", function () {
        navigator.clipboard.writeText(this.textContent).then(() => {
            const originalText = this.textContent;
            this.textContent = "Copied!";
            setTimeout(() => {
                this.textContent = originalText;
            }, 1000);
        });
    });
}

// Initial setup
setupCopyButton("xrpAddress");
updateSearchPreview();
