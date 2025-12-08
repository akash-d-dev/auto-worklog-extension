// SERVER URL
const REFRESH_URL = 'http://localhost:3000/api/refresh-token';

// Listen for web requests to capture the Authorization header
chrome.webRequest.onSendHeaders.addListener(
  (details) => {
    for (let header of details.requestHeaders) {
      if (header.name.toLowerCase() === 'authorization') {
        const token = header.value;
        if (token && token.startsWith('Bearer ')) {
          console.log('Captured Auth Token:', token);
          
          // Save token to storage
          chrome.storage.local.set({ authToken: token }, () => {
            console.log('Token saved to storage');
            // Attempt to refresh token on server (if needed)
            checkAndRefreshToken(token);
          });
        }
        break;
      }
    }
  },
  {
    urls: [
      "https://*.kalvium.community/*"
    ]
  },
  ["requestHeaders"]
);

async function checkAndRefreshToken(token) {
  try {
    const data = await chrome.storage.local.get(['lastTokenRefresh']);
    const lastRefresh = data.lastTokenRefresh;
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // Check if we need to refresh (if never refreshed or > 24 hours ago)
    if (!lastRefresh || (now - lastRefresh > ONE_DAY_MS)) {
      console.log('Attempting to refresh token on server...');
      
      const response = await fetch(REFRESH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ authToken: token })
      });

      if (response.ok) {
        console.log('Token refreshed successfully on server.');
        // Update timestamp
        await chrome.storage.local.set({ lastTokenRefresh: now });
      } else {
        const errData = await response.json();
        console.error('Failed to refresh token:', errData);
        // If 404 (User not found), we might want to ignore or log specific warning
        // that they need to setup the extension popup first.
      }
    } else {
      console.log('Token refresh skipped (already done within 24h).');
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
  }
}
