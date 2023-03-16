/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-undef
const socket = io()
const keys = document.getElementById('keys')
const Pages = {}
const countOnEachPage = 8
let currentPage = 0
let keyList = []

addToHTMLlog('Waiting for host...')

socket.on('server_connected', function (ssatt, socs) {
  removeFromHTMLlog('Waiting for host...')
  addToHTMLlog('Companion connected!')
  socket.emit('im companion')
  setTimeout(() => {
    document.getElementById('console').style.display = 'none'
  }, 1000)
})

socket.on('press-sound', (sound, name) => {
  document.getElementById('now-playing').innerText = 'Now playing ' + name
  if (sound.includes('--Stop_all')) {
    // eslint-disable-next-line no-undef
    Susaudio.stopAll()
  }
  // eslint-disable-next-line no-undef
  Susaudio.playSound(sound)
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

function DeleteKey (key) {
  // eslint-disable-next-line no-undef
  Sounds.splice(Sounds.indexOf({ name: key.name, key: key.key }), 1)
  socket.emit('c-delkey', { name: key.name, key: key.key })
}

function createNewSound () {
  // eslint-disable-next-line no-undef
  loadPage(0)
}

// Get the modal
const modal = document.getElementById('myModal')
// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = 'none'
  }
}

function Changeifo (key) {
  const newkey = document.getElementById('newkey').value
  const newname = document.getElementById('newname').value
  socket.emit('c-info-change', `SETKEY:${key}:${newkey}:${newname}`)
  loadPage(0)
}

function setSet () {
  const soc = document.getElementById('soc').checked
  const ssat = document.getElementById('ssat').value
  socket.emit('c-info-change', 'SSAT:' + ssat + ',SOC:' + soc)
  socket.emit('c-change')
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
