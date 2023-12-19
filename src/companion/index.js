const electron = require('electron');
const path = require('path');

const {
  app,
  BrowserWindow
} = electron;

const createWindow = () => {
  const window = new BrowserWindow({
    minWidth: 675,
    minHeight: 750,
    width: 840,
    height: 750,
    frame: false
  });
  window.setIcon(require('path').join(__dirname, './companion.png'));
  window.loadFile(path.resolve('./src/companion/connector.html'));
};

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', (ev) => {
  if (process.platform !== 'darwin') {
    app.quit();
    console.log('Electron shutdown found; stopping');
    process.exit(0);
  }
});
