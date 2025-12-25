// SERVER URL
// const SERVER_URL = 'http://localhost:3000';
const SERVER_URL = 'https://auto-worklog-submission.onrender.com';

// Sync lock to prevent concurrent operations
let syncInProgress = false;
let pendingSync = null;

// LISTEN FOR LONG-LIVED TOKEN FROM app.kalvium.community
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SAVE_BETTER_CREDENTIALS') {
    const newToken = message.token;
    const capturedOn = new Date().toISOString();
    
    console.log('Received token from content script');
    
    // Save token to storage first, then trigger sync
    chrome.storage.local.set({ 
        authToken: newToken,
        authTokenCapturedOn: capturedOn
    }, async () => {
        console.log('Token saved to storage at:', capturedOn);
        
        // Small delay to ensure storage is fully committed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Trigger sync - it will read the LATEST token from storage
        scheduleSync();
    });
  }
});

function scheduleSync() {
  if (syncInProgress) {
    // A sync is running, mark that we need another sync after it completes
    pendingSync = true;
    console.log('Sync in progress, will retry after current sync completes');
    return;
  }
  
  syncLatestTokenToServer();
}

async function syncLatestTokenToServer() {
  syncInProgress = true;
  pendingSync = false;
  
  try {
    // ALWAYS read the CURRENT token from storage right before syncing
    const storageData = await chrome.storage.local.get(['authToken', 'lastSyncedToken']);
    const currentToken = storageData.authToken;
    const lastSyncedToken = storageData.lastSyncedToken;
    
    if (!currentToken) {
      console.log('No token in storage, nothing to sync');
      return;
    }
    
    // Skip if this exact token was already synced
    if (currentToken === lastSyncedToken) {
      console.log('Current token already synced, skipping');
      return;
    }
    
    console.log('Syncing token to server...');
    
    const response = await fetch(`${SERVER_URL}/api/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authToken: currentToken })
    });

    if (response.ok) {
        // Before marking as synced, verify the token hasn't changed during the API call
        const verifyData = await chrome.storage.local.get(['authToken']);
        
        if (verifyData.authToken === currentToken) {
          // Token is still the same, safe to mark as synced
          await chrome.storage.local.set({ 
            lastSyncedToken: currentToken,
            lastServerUpdate: new Date().toISOString()
          });
          console.log('Token synced successfully');
        } else {
          // Token changed during sync, don't mark as synced - let the next sync handle it
          console.log('Token changed during sync, will sync new token');
          pendingSync = true;
        }
    } else {
        const errData = await response.json().catch(() => ({}));
        console.error('Failed to sync token:', errData);
    }

  } catch (error) {
    console.error('Error syncing token:', error);
  } finally {
    syncInProgress = false;
    
    // If a new token arrived while we were syncing, sync again
    if (pendingSync) {
      console.log('Processing pending sync...');
      setTimeout(syncLatestTokenToServer, 200);
    }
  }
}
