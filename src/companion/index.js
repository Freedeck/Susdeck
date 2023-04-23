const electron = require('electron');
const settings = require('../../Settings');

const {
  app,
  BrowserWindow
} = electron;

function createWindow () {
  const window = new BrowserWindow({
    width: 1280,
    height: 720
  });
  window.setIcon(require('path').join(__dirname, './companion.png'));
  window.loadURL('http://localhost:' + settings.Port + '/companion');
}

app.whenReady().then(() => {
  createWindow();
});
