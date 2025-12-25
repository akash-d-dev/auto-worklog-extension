# Auto Worklog Submitter for Kalvium

**Auto Worklog Submitter** is a Chrome extension designed to automate the daily routine of submitting worklogs on the Kalvium Community platform.

Instead of manually navigating to the portal every evening, this extension captures your authentication session, allows you to pre-define a pool of tasks, and works with a backend service to automatically submit your log daily at **7:00 PM**. You will receive an email notification confirming success or detailing any errors.

## 🚀 Features

* **Zero-Touch Token Sync**: Automatically captures your Auth Token when you visit `app.kalvium.community`. No manual copy-pasting required.
* **Smart Automation**: Runs a backend job daily at 7:00 PM to submit your log.
* **Task Randomization**: You provide a list of tasks (e.g., "Debugging", "Frontend UI", "API Integration"). The system randomly selects one each day to ensure variety in your logs.
* **Context Aware**: Supports different working modes:
* Working Remotely
* Working from Class
* Working On-site (Company Location).


* **Email Reports**: Receive daily status emails.
* **Success**: Confirms the task submitted.
* **Failure**: Alerts you if the token expired (401) or if you already submitted (404).

<img width="421" height="609" alt="image" src="https://github.com/user-attachments/assets/ff86e834-50d0-42b3-9acc-18ccab26fdb5" />
<img width="428" height="610" alt="image" src="https://github.com/user-attachments/assets/af5fc1e8-1bb7-44d3-bc91-1a66692ceebd" />

## 🛠️ How It Works

1. **Token Capture**: The extension injects a content script into `app.kalvium.community`. When you log in, it detects the valid session and securely saves the `accessToken`.
2. **Configuration**: You use the extension popup to set your "Work Mode" and add a list of tasks.
3. **Synchronization**: Clicking "Save & Activate" sends your Token, Work Mode, and Tasks to the backend server.
4. **Execution**: The backend server runs a cron job daily. It retrieves your user profile, picks a random task, and submits a `PUT` request to the Kalvium Student API.

## 📥 Installation

Since this is a custom extension, you will need to load it into Chrome manually (Developer Mode).

1. **Clone or Download** this repository to your computer.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Toggle **Developer mode** in the top right corner.
4. Click **Load unpacked** in the top left.
5. Select the folder containing the `manifest.json` file from this repository.

## 📖 Usage Guide

### 1. Initial Setup

1. Click the **Auto Worklog** extension icon in your browser toolbar.
2. You will likely see a status: `Auth Token: Not Found`.
3. Click the link in the extension to open [app.kalvium.community](https://app.kalvium.community/livebooks?semester=1).
4. **Log in** to your Kalvium account. The extension icon should now indicate that the token is captured.

### 2. Configure Tasks

1. Open the extension popup again.
2. **Status** should now show green: `Auth Token: Captured`.
3. Select your **Working Mode** (e.g., Remote or On-site).
4. **Add Tasks**: Enter descriptions of your daily work.
* *Tip: Add multiple variations (e.g., "Fixed UI bugs," "Backend API optimization," "Team meeting") so the logs don't look identical every day.*


5. Click **Save & Activate**.

### 3. Monitoring

* You will receive an email every evening regarding the status of your submission.
* If your token expires (usually after ~30 days), the email will alert you to "Unauthorized (401)". Simply visit the Kalvium dashboard again to auto-refresh the token.

### Error Handling

If the submission fails, the backend analyzes the error code:

* **400**: Bad Request (Data issue).
* **401**: Token Expired (Login to Kalvium to fix).
* **404**: Worklog period not started or already submitted.
* **500**: Kalvium Server Error.

## ⚠️ Disclaimer

This tool is intended to simplify the logging process for routine tasks. Please ensure you manually verify your logs occasionally and keep your task list updated to accurately reflect your actual work. The developer is not responsible for missed logs due to server downtime or changed API endpoints.

---

**Developed by Akash Singh**
