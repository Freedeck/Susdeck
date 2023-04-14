const ex = require('express')
const path = require('path')
const httpLib = require('http')
const io = require('socket.io')(http);

const app = ex()
const http = new httpLib.Server(app)

const getNetworkInterfaces = require('./util/network')
const sock_api_init = require('./api/init')

const port = process.env.PORT || 3000

sock_api_init(io, app); // Socket API initialize

app.use('/', ex.static('./src/app')) // Initialize HTTP routes for main web app directory

app.get('/sounds.js', (req, res) => { res.sendFile(path.join(__dirname, '\\settings\\sounds.js')) }) // Make sounds.js accessible from apps
app.get('/soundboard.js', (req, res) => { res.sendFile(path.join(__dirname, '\\settings\\soundboard.js')) }) // Make soundboard.js accessible from apps

http.listen(port, () => {
  console.log('Susdeck Web Host is starting - starting Companion')
  require('child_process').exec('npx electron src/companion') // Start Companion on another process
  if (getNetworkInterfaces().Ethernet) { console.log('Go to ' + getNetworkInterfaces().Ethernet[0] + ':3000 on your mobile device ') }
  if (getNetworkInterfaces()['Wi-Fi']) { console.log('Go to ' + getNetworkInterfaces()['Wi-Fi'][0] + ':3000 on your mobile device ') }
})
