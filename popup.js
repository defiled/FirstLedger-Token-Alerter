document.getElementById("initAudio").addEventListener("click", async () => {
    const audio = document.getElementById("testSound");

    try {
        await audio.play();
        chrome.storage.local.set({ audioInitialized: true });
        window.close(); // Close popup after initialization
    } catch (e) {
        console.error("Audio init error:", e);
    }
});
