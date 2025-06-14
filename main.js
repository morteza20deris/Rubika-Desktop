const { app, BrowserWindow, dialog, Tray, Menu, ipcMain } = require("electron");
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
		icon: path.join(__dirname, "Assets/Rubika_Icon.ico"),
	});

	mainWindow.setMenu(null);
	mainWindow.loadURL("https://m.rubika.ir");

	// Minimize to tray
	mainWindow.on("minimize", (event) => {
		event.preventDefault();
		mainWindow.hide();
	});

	mainWindow.on("close", (event) => {
		if (!app.isQuiting) {
			event.preventDefault();
			mainWindow.hide();
		}
	});

	// Tray
	const trayIconPath = path.join(__dirname, "Assets/Rubika_Icon.ico");
	tray = new Tray(trayIconPath);
	const contextMenu = Menu.buildFromTemplate([
		{
			label: "نمایش برنامه",
			click: () => mainWindow.show(),
		},
		{
			label: "خروج",
			click: () => {
				app.isQuiting = true;
				app.quit();
			},
		},
	]);
	tray.setToolTip("برنامه روبیکا");
	tray.setContextMenu(contextMenu);

	tray.on("click", () => {
		mainWindow.show();
	});

	// Auto updater setup
	autoUpdater.autoDownload = false;
	autoUpdater.checkForUpdates();
}

// IPC: Renderer wants to start update
ipcMain.on("start-update", () => {
	autoUpdater.downloadUpdate();
});

ipcMain.on("install-update", () => {
	app.isQuiting = true;
	autoUpdater.quitAndInstall();
});

// AutoUpdater events
autoUpdater.on("update-available", (info) => {
	console.log("به‌روزرسانی در دسترس است:", info.version);
	mainWindow.webContents.send("update-available", info.version);
});

autoUpdater.on("download-progress", (progressObj) => {
	mainWindow.webContents.send("update-progress", progressObj.percent);
});

autoUpdater.on("update-downloaded", () => {
	mainWindow.webContents.send("update-downloaded");
});

autoUpdater.on("error", (err) => {
	console.error("خطا در به‌روزرسانی:", err);
	mainWindow?.webContents.send("update-error", err.message || err.toString());
});

// App ready
app.whenReady().then(createWindow);

// Prevent full quit on non-macOS
app.on("window-all-closed", (e) => {
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
