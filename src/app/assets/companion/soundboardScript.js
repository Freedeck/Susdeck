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

socket.on('press-sound', (sound) => {
  document.getElementById('audio').src = sound
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
  autosort()
  currentPage = pageNumber
  keyList = []
  const myNode = document.getElementById('keys')
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild)
  }
  // eslint-disable-next-line no-undef
  Pages[pageNumber].forEach(sound => {
    keyList.push(sound)
    const btn = document.createElement('button')
    const key = document.createElement('p')
    btn.className = 'keypress btxt'
    if (sound.keys) {
      btn.setAttribute('data-multi', true)
    }
    if (sound.key) {
      btn.setAttribute('data-key', sound.key)
      key.innerText = sound.key
    } else {
      let txt = ''
      sound.keys.forEach(key => {
        txt += `{${key}}`
      })
      key.innerText += txt
      btn.setAttribute('data-key', txt)
    }
    if (sound.icon) {
      btn.style.backgroundImage = "url('../icons/" + sound.icon + "')"
    }
    btn.innerText = sound.name
    keys.appendChild(btn)
  })

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

document.getElementById('ssat').oninput = () => {
  document.getElementById('amt').innerText = document.getElementById('ssat').value + ' seconds'
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

socket.on('hic', function (ssat, soc) {
  console.log(ssat)
  document.getElementById('soc').checked = soc
  document.getElementById('ssat').value = ssat
  document.getElementById('amt').innerText = document.getElementById('ssat').value + ' seconds'
})

function autosort () {
  // eslint-disable-next-line no-undef
  const pagesAmount = Sounds.length / countOnEachPage
  for (let i = 0; i < pagesAmount; i++) {
    Pages[i] = []
  }
  let pageCounter = 0
  let index = 0
  // eslint-disable-next-line no-undef
  Sounds.forEach(sound => {
    Pages[pageCounter].push(sound)
    if (index === countOnEachPage) {
      pageCounter++
      index = 0
    }
    index++
  })
}

function np () {
  if (Pages[currentPage + 1]) {
    loadPage(currentPage + 1)
  }
}

function bp () {
  if (Pages[currentPage - 1]) {
    loadPage(currentPage - 1)
  }
}

function openNav () {
  document.getElementById('mySidenav').style.width = '250px'
  document.getElementById('main').style.marginLeft = '250px'
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav () {
  document.getElementById('mySidenav').style.width = '0'
  document.getElementById('main').style.marginLeft = '0'
}
