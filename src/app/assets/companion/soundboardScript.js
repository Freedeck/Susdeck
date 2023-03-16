/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-undef
const socket = io()
const keys = document.getElementById('keys')
const Pages = {}
const q = []
const countOnEachPage = 8

addToHTMLlog('Waiting for host...')

socket.on('server_connected', function (ssatt, socs) {
  removeFromHTMLlog('Waiting for host...')
  addToHTMLlog('Companion connected!')
  socket.emit('im companion')
  setTimeout(() => {
    document.getElementById('console').style.display = 'none'
  }, 1000)
})

setInterval(() => {
  q.splice(0, q.length)
  // eslint-disable-next-line no-undef
  Susaudio._player.queue.forEach(audio => {
    q.push(audio.saName)
  })
  document.getElementById('now-playing').innerText = 'Playing: ' + q.join(', ')
}, 250)

socket.on('press-sound', (sound, name) => {
  if (sound.includes('--Stop_all')) {
    // eslint-disable-next-line no-undef
    Susaudio.stopAll()
    return
  }
  // eslint-disable-next-line no-undef
  Susaudio.playSound(sound, name)
})

// eslint-disable-next-line no-undef
sounds.forEach(function (s) {
  // eslint-disable-next-line no-undef
  document.getElementById('keys').innerHTML += `<div><h3>${s.name}</h3><h4>${soundDir + s.path}</h4></div>`
})

function addToHTMLlog (text) {
  const txt = document.createElement('h2')
  txt.id = text
  txt.innerText = text
  document.getElementById('console').appendChild(txt)
}

function removeFromHTMLlog (text) {
  document.getElementById('console').removeChild(document.getElementById(text))
}

socket.on('c-change', () => { window.location.replace(window.location.href) })

function openNav () {
  document.getElementById('mySidenav').style.width = '250px'
  document.getElementById('main').style.marginLeft = '250px'
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav () {
  document.getElementById('mySidenav').style.width = '0'
  document.getElementById('main').style.marginLeft = '0'
}
