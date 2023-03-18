/* eslint-disable no-undef */
const susdeckUniversal = {
  themes: {
    // Built-in themes.
    Default: [
      { 'template-columns': 'repeat(4,1fr)' },
      { 'font-family': 'Inter' }
    ]
  },
  socket: io(),
  isInDebug: false,
  hasConnected: false
}

susdeckUniversal.socket.on('server_connected', () => {
  if (susdeckUniversal.hasConnected) { socket.emit('Reloadme') }
  susdeckUniversal.hasConnected = true
})
fetch('/api/dbg')
  .then(data =>
    data.json())
  .then(data => {
    susdeckUniversal.isInDebug = true
  })

const rootElem = document.querySelector(':root')

// because theming is cool
if (!localStorage.getItem('sd-theme')) {
  localStorage.setItem('sd-theme', JSON.stringify(susdeckUniversal.themes.Default))
}
localStorage.setItem('sd-theme', JSON.stringify(susdeckUniversal.themes.Default))

const userTheme = JSON.parse(localStorage.getItem('sd-theme'))

// Setup the user's theme
userTheme.forEach(property => {
  Object.keys(property).forEach(key => {
    rootElem.style.setProperty(`--sd-${key}`, property[key])
  })
})

document.body.onload = () => {
  const footer = document.createElement('footer')
  footer.innerHTML = '<h3>Please wait</h3>'
  document.body.appendChild(footer)
  setTimeout(() => {
    if (susdeckUniversal.isInDebug) {
      footer.innerHTML = '<h3>Susdeck is in debug mode</h3>'
    } else {
      footer.style.display = 'none'
    }
  }, 150)
}
