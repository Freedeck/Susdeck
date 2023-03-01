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

  window.loadFile('app/index.html')
}

app.whenReady().then(() => {
  createWindow()
})
