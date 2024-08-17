const path = require('path');
const {BrowserWindow} = require('electron');
module.exports = (_page='./src/fdconnect.html', _showTitlebar=true, width=800, height=600, isUrl=false) => {
  const mainWindow = new BrowserWindow({
    width,
    height,
    frame: _showTitlebar,
    icon: path.resolve('./assets/logo_big.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // skipTaskbar: true,
  });
  console.log('Here we go!');
  if (!isUrl) mainWindow.loadFile(path.resolve(_page));
  else mainWindow.loadURL(_page);

  return mainWindow;
};
