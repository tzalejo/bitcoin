"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = require("path");
var url = require("url");
var win;
electron_1.app.on('ready', createWindow);
electron_1.app.on('activate', function () {
    if (win === null) {
        createWindow();
    }
});
function createWindow() {
    var electronScreen = electron_1.screen;
    var size = electronScreen.getPrimaryDisplay().workAreaSize;
    win = new electron_1.BrowserWindow({
        x: 0,
        y: 0,
        width: 1400,
        height: size.height,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: false
        },
    });
    win.loadURL(url.format({
        pathname: path.join(__dirname, "/dist/index.html"),
        protocol: 'file:',
        slashes: true
    }));
    // win.loadURL(`file://${__dirname}/dist/bitcoin/index.html`);
    // win.webContents.openDevTools();
    win.on('closed', function () {
        win = null;
    });
}
try {
    electron_1.app.allowRendererProcessReuse = true;
    // Para ver el estado de la app
    // app.on('ready', createWindow);
    // Quit when all windows are closed.
    electron_1.app.on('window-all-closed', function () {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            electron_1.app.quit();
        }
    });
    electron_1.app.on('activate', function () {
        if (win === null) {
            createWindow();
        }
    });
}
catch (error) {
}
//# sourceMappingURL=main.js.map