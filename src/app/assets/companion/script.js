// eslint-disable-next-line no-undef
const socket = io()
const keys = document.getElementById('keys')
let keyList = []

addToHTMLlog('Waiting for host...')

socket.on('server_connected', function () {
  removeFromHTMLlog('Waiting for host...')
  addToHTMLlog('Companion connected!')
  socket.emit('im companion')
  loadPage(0)
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

const Pages = {}
const countOnEachPage = 8
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

function loadPage (pageNumber) {
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
      document.getElementById('selected').innerHTML = `<h2>${allKeypress[i].innerText}</h2>
      <h2>Presses ${allKeypress[i].getAttribute('data-key').replace(/{/g, '').replace(/}/g, ' ')}`
    }
  }
}
