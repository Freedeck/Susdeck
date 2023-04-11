/* eslint-disable no-unused-vars, no-undef */
const socket = io()
const keys = document.getElementById('keys')
const Pages = {}
const q = []
const countOnEachPage = 8

addToHTMLlog('Waiting for host...')
Susaudio.init()

susdeckUniversal.socket.on('server_connected', function (ssatt, socs) {
  removeFromHTMLlog('Waiting for host...')
  addToHTMLlog('Companion connected!')
  socket.emit('im companion')
  setTimeout(() => {
    document.getElementById('console').style.display = 'none'
    if (susdeckUniversal.isInDebug === true) {
      // eslint-disable-next-line no-undef
      sounds.forEach(function (s) {
        // eslint-disable-next-line no-undef
        document.getElementById('keys').innerHTML += `<div><h3>${s.name}</h3><h4>${soundDir + s.path}</h4></div>`
      })
    }
  }, 1000)
})

setInterval(() => {
  q.splice(0, q.length)
  // eslint-disable-next-line no-undef
  Susaudio._player.queue.forEach(audio => {
    if (audio.isSusaudioFB) return
    if (!audio.isNotVB) return
    q.push(audio.saName)
  })
  document.getElementById('now-playing').innerText = 'Playing: ' + q.join(', ')
}, 250)

function volChanged () {
  const volumeSlider = document.getElementById('out-vol')
  Susaudio._player.queue.forEach(audio => {
    Susaudio._player.volume = volumeSlider.value
    audio.volume = Susaudio._player.volume
  })
}

function pbrChanged () {
  const volumeSlider = document.getElementById('out-pbr')
  Susaudio._player.queue.forEach(audio => {
    Susaudio._player.pitch = volumeSlider.value
    audio.playbackRate = Susaudio._player.pitch
  })
}

susdeckUniversal.socket.on('press-sound', (sound, name) => {
  if (sound.includes('--Stop_all')) {
    // eslint-disable-next-line no-undef
    Susaudio.stopAll()
    return
  }
  // eslint-disable-next-line no-undef
  Susaudio.playSound(sound, name)
  Susaudio.playSound(sound, name, true)
  susdeckUniversal.socket.emit('c2s_log', '[COMPANIONSB] Playing ' + name)
})

function addToHTMLlog (text) {
  const txt = document.createElement('h2')
  txt.id = text
  txt.innerText = text
  susdeckUniversal.socket.emit('c2s_log', '[COMPANIONSB] ' + text)
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
