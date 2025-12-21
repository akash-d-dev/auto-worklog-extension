// Content script
console.log("Auto Worklog Extension Content Script Active");

// Only run on the dashboard where the session API exists
if (location.hostname === 'app.kalvium.community') {
    
    // Proactively fetch the session data
    fetch('/api/auth/session')
        .then(response => {
            if (response.ok) return response.json();
            return null;
        })
        .then(data => {
            // Check if we got the "Golden Ticket" (Token + User ID)
            if (data && data.accessToken) {
                console.log('Auto Worklog: Success! Found Long-Lived Token.');

                // Send Token to background.js
                chrome.runtime.sendMessage({ 
                    type: 'SAVE_BETTER_CREDENTIALS', 
                    token: data.accessToken
                });
            }
        })
        .catch(err => {
            console.log('Auto Worklog: Could not fetch session (User might not be logged in).');
        });
}

