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
    electron_1.app.on('ready', createWindow);
    electron_1.app.on('activate', function () {
        if (win === null) {
            createWindow();
        }
    });
}
catch (error) {
}
//# sourceMappingURL=main.js.map