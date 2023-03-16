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
  loadPage(0)
  setTimeout(() => {
    document.getElementById('console').style.display = 'none'
  }, 1000)
})

socket.on('press-sound', (sound, name) => {
  document.getElementById('now-playing').innerText = 'Now playing '+name
  // eslint-disable-next-line no-undef
  Susaudio.playSound(sound)
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

function loadPage (pageNumber) {
  currentPage = pageNumber
  keyList = []
  const myNode = document.getElementById('keys')
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild)
  }

  const stopall = document.createElement('button')
  stopall.onclick = () => { window.location.reload() }
  stopall.className = 'keypress btxt'
  stopall.innerText = 'Stop All'
  stopall.setAttribute('data-key', 'f19')
  const reloadbtn = document.createElement('button')
  reloadbtn.onclick = () => { window.location.reload() }
  reloadbtn.className = 'btxt'
  reloadbtn.innerText = 'Reload'
  keys.appendChild(stopall)
  keys.appendChild(reloadbtn)

  const allKeypress = document.getElementsByClassName('keypress')
  for (let i = 0; i < allKeypress.length; i++) {
    allKeypress[i].onclick = (ev) => {
      socket.emit('cs-playsound', allKeypress[i].innerText)
    }
  }
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
