const electron = require('electron')

const {
  app,
  BrowserWindow
} = electron

function createWindow () {
  const window = new BrowserWindow({
    width: 1280,
    height: 720
  })

  window.loadURL('http://localhost:3000/assets/companion/index.html')
}

app.whenReady().then(() => {
  createWindow()
})
