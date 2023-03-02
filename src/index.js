const ex = require('express')
const bodyParser = require('body-parser')
const app = ex()
const httpLib = require('http')
const http = new httpLib.Server(app)
const rob = require('robotjs')
const fs = require('fs')
const io = require('socket.io')(http)
const port = process.env.PORT || 3000
const getNetworkInterfaces = require('./network')

const loginList = []
const sessions = []
const events = new Map()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/', ex.static('./src/app'))

app.get('/sounds.js', (e, r) => { r.sendFile(path.join(__dirname, '\\sounds.js')) })

console.log('Initializing: Adding your sounds to the app')

// Section Start: Sound config
// SoundOnPress, ScreenSaverActivationTime, Sounds
const soundFile = require('./sounds')
const path = require('path')
// Section End: Sound config

fs.readdirSync('./src/events').forEach(function (file) {
  if (file.includes('companion')) return
  file = 'events/' + file
  const query = require('./' + file)
  events.set(query.event, { callback: query.callback, event: query.event })
  console.log('Added event', query.event)
})

io.on('connection', function (socket) {
  console.log('Connected to client @ ' + new Date())
  setTimeout(function () {
    socket.emit('server_connected')
    console.log('Sent user connection success message')
  }, 150)
  socket.on('keypress', function (keys) {
    if (keys.includes('{')) {
      keys.split('{').forEach(function (key) {
        if (key === '') { return }
        key = key.split('}')[0]
        rob.keyToggle(key, 'down')
        setTimeout(function () {
          rob.keyToggle(key, 'up')
        }, 150)
      })
    } else {
      rob.keyTap(keys)
    }
  })
  socket.on('c-change', function () { io.emit('c-change') })
  events.forEach(function (event) {
    socket.on(event.event, function (args) {
      const callback = event.callback(socket, args, loginList)
      if (!callback) { return }
      if (callback.startsWith('ValidateSession:')) {
        const person = callback.split(':')[1]
        sessions.push(person)
      }
      if (callback.startsWith('c-change')) {
        io.emit('c-change')
      }
    })
  })
  socket.on('keepalive', () => { socket.emit('keepalive') })
  socket.on('Authenticated', function (sessionID) {
    console.log('Recieved ' + sessionID, ', checking..')
    if (sessions.includes(sessionID)) {
      console.log(sessionID, 'is valid!')
      socket.emit('greenlight')
    } else {
      console.log(sessionID, 'is invalid, kicking out user..')
      socket.emit('banish')
    }
  })
  socket.on('im companion', () => {
    console.log('Companion is connected to server')
    socket.emit('hic', soundFile.ScreenSaverActivationTime, soundFile.SoundOnPress)
  })
})

module.exports = loginList

http.listen(port, function () {
  console.log('Susdeck Host is running - starting Companion')
  require('child_process').exec('npx electron src/companion')
  if (getNetworkInterfaces().Ethernet) { console.log('Go to ' + getNetworkInterfaces().Ethernet[0] + ':3000 on your mobile device ') }
  if (getNetworkInterfaces()['Wi-Fi']) { console.log('Go to ' + getNetworkInterfaces()['Wi-Fi'][0] + ':3000 on your mobile device ') }
})
