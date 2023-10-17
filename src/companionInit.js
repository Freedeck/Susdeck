import { app, BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | null = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
        nodeIntegration: false,
        },
    });

    mainWindow.loadFile(`file://${__dirname}/public/companion/index.html`).then(r => console.log(r));
});
