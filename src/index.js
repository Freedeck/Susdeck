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
  events.forEach(function (event) {
    socket.on(event.event, function (args) {
      const callback = event.callback(socket, args, loginList)
      if (!callback) { return }
      if (callback.startsWith('ValidateSession:')) {
        const person = callback.split(':')[1]
        sessions.push(person)
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
})

module.exports = loginList

http.listen(port, function () {
  console.log('Susdeck Host is running!')
  if (getNetworkInterfaces().Ethernet) { console.log('Go to ' + getNetworkInterfaces().Ethernet[0] + ':3000 on your mobile device ') }
  if (getNetworkInterfaces()['Wi-Fi']) { console.log('Go to ' + getNetworkInterfaces()['Wi-Fi'][0] + ':3000 on your mobile device ') }
})
