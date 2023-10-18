const { app, BrowserWindow } = require('electron');
app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
        },
    });

    mainWindow.loadURL(`http://localhost:5754/companion/index.html`).then(r => console.log(r));
});