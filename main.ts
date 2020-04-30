import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win: BrowserWindow;
app.on('ready', createWindow);
app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

function createWindow() {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow(
    {
      x: 0,
      y: 0,
      width: 1400,
      height: size.height,
      webPreferences: {
        nodeIntegration: true,
        allowRunningInsecureContent: false
      },
    }
  );
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `/dist/index.html`),
      protocol: 'file:',
      slashes: true
    })
  );

  // win.loadURL(`file://${__dirname}/dist/bitcoin/index.html`);

  // win.webContents.openDevTools();

  win.on('closed', () => {
    win = null;
  });
}
try {
  app.allowRendererProcessReuse = true;

  // Para ver el estado de la app
  // app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
      if (win === null) {
          createWindow();
      }
  });

} catch (error) {

}
