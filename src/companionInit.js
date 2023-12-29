const {app, BrowserWindow} = require('electron');
const path = require('path');
app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile(path.resolve('./src/fdconnect.html'));
});



app.on('window-all-closed', (e) => {
  console.log('Exiting Freedeck!');
  process.exit(0);
});
