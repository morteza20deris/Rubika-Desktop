const { app, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");
function createWindow() {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	win.loadURL("https://web.rubika.ir"); // URL of the Rubika web app
	autoUpdater.checkForUpdatesAndNotify();
	win.setMenu(null);
}

app.whenReady().then(createWindow);

autoUpdater.on("update-available", (info) => {
	dialog
		.showMessageBox({
			type: "info",
			buttons: ["Update now", "Later"],
			title: "Update Available",
			message: `Version ${info.version} is available. Do you want to update now?`,
		})
		.then((result) => {
			if (result.response === 0) {
				// 'Update now' button clicked
				// Download the update in the background
				autoUpdater.downloadUpdate();
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
