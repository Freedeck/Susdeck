const ex = require('express')
const path = require('path')
const httpLib = require('http')
const rob = require('robotjs')
const fs = require('fs')
const app = ex()
const http = new httpLib.Server(app)
const io = require('socket.io')(http)
const debug = require('./cliUtil')
const sbc = require('./soundboard')

const port = process.env.PORT || 3000
const getNetworkInterfaces = require('./network')
const loginList = []
const sessions = []
const events = new Map()

app.use('/', ex.static('./src/app'))

app.get('/sounds.js', (e, r) => { r.sendFile(path.join(__dirname, '\\sounds.js')) })
app.get('/soundboard.js', (e, r) => { r.sendFile(path.join(__dirname, '\\soundboard.js')) })

debug.log('Adding events to app')

fs.readdirSync('./src/events').forEach(function (file) {
  if (file === 'companion') {
    fs.readdirSync('./src/events/companion').forEach(cEvent => {
      cEvent = 'events/companion/' + cEvent
      const query = require('./' + cEvent)
      events.set(query.event, { callback: query.callback, event: query.event })
      debug.log('Added companion event ' + query.event + ' from file ' + cEvent)
    })
  }
  if (file === 'c2s') {
    fs.readdirSync('./src/events/c2s').forEach(cEvent => {
      cEvent = 'events/c2s/' + cEvent
      const query = require('./' + cEvent)
      events.set(query.event, { callback: query.callback, event: query.event })
      debug.log('Added c2s event ' + query.event + ' from file ' + cEvent)
    })
  }
})

io.on('connection', function (socket) {
  console.log('Connected to client @ ' + new Date())
  setTimeout(function () {
    socket.emit('server_connected')
    debug.log('Sent user connection success message')
  }, 150)
  socket.on('keypress', function (keyInput) {
    debug.log(JSON.stringify(keyInput))
    if (keyInput.name) {
      sbc.sounds.forEach(sound => {
        if (sound.name === keyInput.name) {
          io.emit('press-sound', sbc.soundDir + sound.path, sound.name)
        }
      })
      return
    }
    const keys = keyInput.keys
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
    socket.on(event.event, async function (args) {
      if (event.async) {
        await event.callback(socket, args, loginList)
      } else {
        const callback = event.callback(socket, args, loginList)
        if (!callback || typeof callback !== 'string') { return }
        if (callback.startsWith('ValidateSession:')) {
          const person = callback.split(':')[1]
          sessions.push(person)
        }
        if (callback.startsWith('c-change')) {
          io.emit('c-change')
        }
      }
    })
  })
  socket.on('keepalive', () => { socket.emit('keepalive') })
  socket.on('Authenticated', function (sessionID) {
    console.log('Recieved ' + sessionID, ', checking..')
    if (sessions.includes(sessionID)) {
      debug.log(sessionID + ' is valid!')
      socket.emit('greenlight')
    } else {
      debug.log(sessionID + ' is invalid, kicking out user..')
      socket.emit('banish')
    }
  })
  socket.on('im companion', () => {
    debug.log('Companion is connected to server')
    delete require.cache[require.resolve('./sounds.js')]
    const soundFile = require('./sounds')
    socket.emit('hic', soundFile.ScreenSaverActivationTime, soundFile.SoundOnPress)
  })
})

module.exports = loginList

http.listen(port, function () {
  console.log('Susdeck is started!')
  if (process.argv[2] !== '-nocompanion') { console.log('Susdeck Host is running - starting Companion'); require('child_process').exec('npx electron src/companion') }
  if (getNetworkInterfaces().Ethernet) { console.log('Go to ' + getNetworkInterfaces().Ethernet[0] + ':3000 on your mobile device ') }
  if (getNetworkInterfaces()['Wi-Fi']) { console.log('Go to ' + getNetworkInterfaces()['Wi-Fi'][0] + ':3000 on your mobile device ') }
})
