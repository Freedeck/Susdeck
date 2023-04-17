/* eslint-disable no-undef */
const susdeckUniversal = {
  screensaverStatus: false,
  themes: {
    // Built-in themes.
    Dark: [
      { 'template-columns': 'repeat(4,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Rubik' },
      { background: '45deg, rgba(59, 59, 59, 1) 0%, rgba(87, 87, 87, 1) 33%, rgba(59, 59, 59, 1) 66%, rgba(87, 87, 87, 1) 100%' }
    ],
    Blue: [
      { 'template-columns': 'repeat(4,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Inter' },
      { background: '45deg, rgba(0, 183, 255, 1) 0%, rgba(33, 192, 255, 1) 33%, rgba(0, 183, 255, 1) 66%, rgba(33, 192, 255, 1) 100%' }
    ],
    Default: [
      { 'template-columns': 'repeat(4,1fr)' },
      { 'bac  kground-size': '400% 400%' },
      { 'font-family': 'Inter' },
      { background: '45deg, rgba(255, 0, 89, 1) 0%, rgba(0, 179, 255, 1) 33%, rgba(255, 0, 89, 1) 66%, rgba(0, 179, 255, 1) 100%' }
    ]
  },
  retrieveSession: function () {
    return atob(localStorage.getItem('_sdsession'))
  },
  createTempHWID: function () {
    return Math.random().toString().substring(2, 5)
  },
  save: function (name, value) {
    localStorage.setItem('_sd' + name, value)
  },
  load: function (name) {
    return localStorage.getItem('_sd' + name)
  },
  socket: io(),
  connectionOn: function (event, callback) {
    susdeckUniversal.socket.on(event, callback)
  },
  isInDebug: false,
  isDevBranch: false,
  debugStat: 'Debug',
  hasConnected: false
}

susdeckUniversal.socket.on('server_connected', (stype) => {
  susdeckUniversal.hasConnected = true
  if (!susdeckUniversal.hasConnected) { socket.emit('c-client-reload') }
})

susdeckUniversal.socket.on('set-theme', (theme) => {
  susdeckUniversal.save('theme', theme)
  const userTheme = susdeckUniversal.themes[susdeckUniversal.load('theme')]

  userTheme.forEach(property => {
    Object.keys(property).forEach(key => {
      rootElem.style.setProperty(`--sd-${key}`, property[key])
    })
  })
})

fetch('/api/dbg')
  .then(data =>
    data.json())
  .then(data => {
    susdeckUniversal.isInDebug = data.status
    susdeckUniversal.debugStat = data.msg
  })

const rootElem = document.querySelector(':root')

// because theming is cool
if (!susdeckUniversal.load('theme')) {
  susdeckUniversal.save('theme', 'Default')
}

// Setup the user's theme
const userTheme = susdeckUniversal.themes[susdeckUniversal.load('theme')]

userTheme.forEach(property => {
  Object.keys(property).forEach(key => {
    rootElem.style.setProperty(`--sd-${key}`, property[key])
  })
})

if (typeof ScreenSaverActivationTime === 'number' && keys) {
  setInterval(function () { userAlive = false }, ScreenSaverActivationTime * 1000)

  setInterval(function () {
    if (!userAlive) {
      keys.style.opacity = '0'
      screensaverStatus = true
    }
  }, ScreenSaverActivationTime * 1000 + 2 * 1000)
}

document.body.onload = () => {
  const footer = document.createElement('footer')
  footer.style.display = 'none'
  document.body.appendChild(footer)
  setTimeout(() => {
    if (!susdeckUniversal.isInDebug) return
    footer.innerHTML = '<h3>In ' + susdeckUniversal.debugStat + ' Mode</h3>'
    footer.style.display = 'block'
  }, 12)
}
