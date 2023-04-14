const ex = require('express')
const path = require('path')
const httpLib = require('http')

const app = ex()
const httpServer = new httpLib.Server(app)
const io = require('socket.io')(httpServer)

const getNetworkInterfaces = require('./util/network')
const sockApiInit = require('./api/init')

const port = process.env.PORT || 3000

sockApiInit(io, app) // Socket API initialize

app.use('/', ex.static('./src/app')) // Initialize HTTP routes for main web app directory

app.get('/sounds.js', (req, res) => { res.sendFile(path.join(__dirname, '\\settings\\sounds.js')) }) // Make sounds.js accessible from apps
app.get('/soundboard.js', (req, res) => { res.sendFile(path.join(__dirname, '\\settings\\soundboard.js')) }) // Make soundboard.js accessible from apps

httpServer.listen(port, () => {
  console.log('Susdeck Web Host is starting - starting Companion')
  require('child_process').exec('npx electron src/companion') // Start Companion on another process
  if (getNetworkInterfaces().Ethernet) { console.log('Go to ' + getNetworkInterfaces().Ethernet[0] + ':3000 on your mobile device ') }
  if (getNetworkInterfaces()['Wi-Fi']) { console.log('Go to ' + getNetworkInterfaces()['Wi-Fi'][0] + ':3000 on your mobile device ') }
})
