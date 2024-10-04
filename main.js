const { app, BrowserWindow, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"), // Link to the preload script
			nodeIntegration: false,
			contextIsolation: true,
		},
	});

	mainWindow.loadURL("https://web.rubika.ir"); // URL of the Rubika web app

	// Set autoDownload to false to prevent automatic downloads
	autoUpdater.autoDownload = false;

	// Check for updates without automatic notification
	autoUpdater.checkForUpdates();
	// mainWindow.setMenu(null);

	autoUpdater.on("download-progress", (progressObj) => {
		const { percent } = progressObj; // Get the download percentage
		console.log(`Download progress: ${percent}%`); // Log the progress

		// Send the download progress to the renderer process
		mainWindow.webContents.send("update-progress", percent);
	});

	autoUpdater.on("update-available", (info) => {
		console.log("Update is Available");

		// Show a dialog to ask the user whether they want to update now or later
		dialog
			.showMessageBox(mainWindow, {
				type: "info",
				buttons: ["Update now", "Later"],
				title: "Update Available",
				message: `Version ${info.version} is available. Do you want to update now?`,
			})
			.then((result) => {
				if (result.response === 0) {
					// 'Update now' selected
					// Explicitly start downloading the update
					autoUpdater.downloadUpdate();
				} else {
					// 'Later' selected, do nothing
					console.log("User chose to update later.");
				}
			});
	});

	autoUpdater.on("update-downloaded", () => {
		dialog
			.showMessageBox({
				type: "info",
				buttons: ["Install now", "Later"],
				title: "Update Ready",
				message:
					"An update has been downloaded. Would you like to install it now?",
			})
			.then((result) => {
				if (result.response === 0) {
					// 'Install now' button clicked
					autoUpdater.quitAndInstall(); // Quit and install the update
				}
			});
	});

	autoUpdater.on("error", (err) => {
		console.error("Error during update:", err);
	});
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
