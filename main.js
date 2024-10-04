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

autoUpdater.on("update-available", () => {
	console.log("Update available.");
});

autoUpdater.on("update-downloaded", () => {
	console.log("Update downloaded; will install now.");
	autoUpdater.quitAndInstall(); // Automatically installs the update
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
