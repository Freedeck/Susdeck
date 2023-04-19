const electron = require('electron');

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
  window.loadURL('http://localhost:3000/companion');
}

app.whenReady().then(() => {
  createWindow();
});
