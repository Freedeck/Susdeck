const path = require("node:path");
const { BrowserWindow, ipcMain } = require("electron");
module.exports = (
	_page = "webui/client/fdconnect.html",
	_showTitlebar = true,
	width = 800,
	height = 600,
	isUrl = false,
) => {
	const mainWindow = new BrowserWindow({
		width,
		height,
		frame: _showTitlebar,
		icon: path.resolve("./assets/logo_big.ico"),
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.resolve("src/appPreload.js")
		},
		// skipTaskbar: true,
	});
	ipcMain.handle("resize-splash", (ev) => {
		mainWindow.setSize(420, 525)
		mainWindow.center();
	})
	ipcMain.handle("resize", (ev) => {
		mainWindow.setSize(1400, 850)
		mainWindow.center();
	})
	console.log("Here we go!");
	if (!isUrl) mainWindow.loadFile(path.resolve(_page));
	else mainWindow.loadURL(_page);

	return mainWindow;
};
