const { app, BrowserWindow, dialog, Tray, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

let mainWindow;
let tray = null;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: false,
			contextIsolation: true,
		},
		icon: path.join(__dirname, "Assets/Rubika_Icon.ico"), // Optional: Add your app icon
	});

	mainWindow.setMenu(null);

	mainWindow.loadURL("https://m.rubika.ir");

	// Handle window close -> hide to tray
	mainWindow.on('minimize', (event) => {
		event.preventDefault();
		mainWindow.hide();
	});

	mainWindow.on('close', (event) => {
		if (!app.isQuiting) {
			event.preventDefault();
			mainWindow.hide();
		}
	});


	// === Tray Setup ===
	const trayIconPath = path.join(__dirname, "Assets/Rubika_Icon.ico"); // Replace with your tray icon
	tray = new Tray(trayIconPath);
	const contextMenu = Menu.buildFromTemplate([
		{
			label: "Show App",
			click: () => {
				mainWindow.show();
			},
		},
		{
			label: "Quit",
			click: () => {
				app.isQuiting = true;
				app.quit();
			},
		},
	]);
	tray.setToolTip("Rubika App");
	tray.setContextMenu(contextMenu);

	tray.on("click", () => {
		mainWindow.show();
	});

	// === Auto Updater ===
	autoUpdater.autoDownload = false;
	autoUpdater.checkForUpdates();

	autoUpdater.on("download-progress", (progressObj) => {
		const { percent } = progressObj;
		console.log(`Download progress: ${percent}%`);
		mainWindow.webContents.send("update-progress", percent);
	});

	autoUpdater.on("update-available", (info) => {
		console.log("Update is Available");

		dialog
			.showMessageBox(mainWindow, {
				type: "info",
				buttons: ["Update now", "Later"],
				title: "Update Available",
				message: `Version ${info.version} is available. Do you want to update now?`,
			})
			.then((result) => {
				if (result.response === 0) {
					autoUpdater.downloadUpdate();
				} else {
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
					autoUpdater.quitAndInstall();
				}
			});
	});

	autoUpdater.on("error", (err) => {
		console.error("Error during update:", err);
	});
}

app.whenReady().then(createWindow);

app.on("window-all-closed", (e) => {
	// Prevent quitting on non-macOS (keep in tray)
	if (process.platform !== "darwin") {
		e.preventDefault();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	} else {
		mainWindow.show();
	}
});
