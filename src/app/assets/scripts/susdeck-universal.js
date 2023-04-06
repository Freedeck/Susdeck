/* eslint-disable no-undef */
const susdeckUniversal = {
  screensaverStatus: false,
  themes: {
    // Built-in themes.
    Default: [
      { 'template-columns': 'repeat(4,1fr)' },
      { 'background-size': '400% 400%' },
      { 'font-family': 'Inter' }
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
  hasConnected: false
}

susdeckUniversal.socket.on('server_connected', () => {
  susdeckUniversal.hasConnected = true
  if (!susdeckUniversal.hasConnected) { socket.emit('Reloadme') }
})

fetch('/api/dbg')
  .then(data =>
    data.json())
  .then(data => {
    susdeckUniversal.isInDebug = data.status
  })

const rootElem = document.querySelector(':root')

// because theming is cool
if (!localStorage.getItem('sd-theme')) {
  localStorage.setItem('sd-theme', JSON.stringify(susdeckUniversal.themes.Default))
}

const userTheme = JSON.parse(localStorage.getItem('sd-theme'))

// Setup the user's theme
userTheme.forEach(property => {
  Object.keys(property).forEach(key => {
    rootElem.style.setProperty(`--sd-${key}`, property[key])
  })
})

if (typeof ScreenSaverActivationTime === 'number') {
  setInterval(function () { userAlive = false }, ScreenSaverActivationTime * 1000)

  setInterval(function () {
    if (!userAlive && !susdeckUniversal.screensaverStatus) {
      keys.style.opacity = '0.125'
    }
  }, ScreenSaverActivationTime * 1000 + 600)

  setInterval(function () {
    if (!userAlive) {
      keys.style.opacity = '0'
      screensaverStatus = true
    }
  }, ScreenSaverActivationTime * 1000 + 2 * 1000)
}

document.body.onload = () => {
  const footer = document.createElement('footer')
  footer.innerHTML = '<h3>Checking if Susdeck is in debug mode - this shouldn\'t be visible.</h3>'
  document.body.appendChild(footer)
  setTimeout(() => {
    if (susdeckUniversal.isInDebug) {
      footer.innerHTML = '<h3>Susdeck is in debug mode</h3>'
    } else {
      footer.style.display = 'none'
    }
  }, 150)
}
