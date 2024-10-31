# FirstLedger Token Monitor

A Chrome extension that monitors FirstLedger for new token listings and provides instant notifications through browser alerts, sound notifications, and Telegram messages.

## Features

-   Real-time monitoring of FirstLedger token listings
-   Customizable search query generation
-   Instant Telegram notifications
-   Configurable audio alerts
-   Statistical tracking of token listings
-   Auto-open Google search results (toggleable)

## Installation

1. Clone this repository or download the ZIP
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the folder containing the extension files

## Setup

### Basic Setup

1. After installation, you'll see the FirstLedger Monitor icon in your Chrome extensions
2. Click the extension icon to open the monitoring interface
3. Configure your preferred search template, alert sound, and volume.

### Telegram Notifications Setup

1. Open Telegram and search for `@fl_new_token_bot`
2. Start a chat with the bot by clicking "Start" or sending any message
3. Search for `@userinfobot` in Telegram
4. Send any message to @userinfobot
5. Copy the ID number it sends you
6. Paste this ID into the "Telegram chat ID" field in the extension
7. Click "Test Telegram" to verify notifications are working

## Configuration Options

### Search Settings

-   Customize search template using `{ticker}` as placeholder for token names
-   Toggle auto-opening of search results
-   Default template: "XRP {ticker} twitter"

### Alert Settings

-   Choose from multiple alert sounds
-   Adjust volume
-   Test sound before monitoring

### Statistics

-   View total refreshes
-   Track new tokens found
-   Monitor tokens per hour
-   See monitoring start time

## Usage

1. Configure your preferred settings
2. Click "Start Monitoring" to begin
3. The extension will:
    - Monitor FirstLedger for new tokens
    - Play sound alerts for new tokens
    - Send Telegram notifications
    - Open search results (if enabled)
    - Track statistics

## Support Development ☕

If you find this extension useful, tips are appreciated:

-   XRP Address: `rwnYLUsoBQX3ECa1A5bSKLdbPoHKnqf63J`
-   Memo: `3776576156`

## Troubleshooting

### No Sound Alerts

-   Click anywhere on the page to enable sound
-   Make sure volume is turned up
-   Test sound using the "Test Sound" button

### No Telegram Notifications

-   Verify you've messaged the bot first
-   Check your chat ID is correct
-   Use the "Test Telegram" button to verify setup

### Search Not Opening

-   Check if auto-open search is enabled
-   Verify your search template is correct

## Updates

To update the extension:

1. Pull the latest changes from GitHub
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension
4. Or remove and re-load the extension using "Load unpacked"

## Files Included

-   manifest.json (Extension configuration)
-   monitor.html (Main interface)
-   monitor.js (Core functionality)
-   background.js (Background processes)
-   icon.png (Extension icon)
-   level-up.wav (Default alert sound)
-   Additional sound files (ding.wav, alert.wav)

## Development

Feel free to fork and modify. To contribute:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
