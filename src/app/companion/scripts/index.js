/* eslint-disable no-undef */
const keys = document.getElementById('keys');
const Pages = {};
const countOnEachPage = 8;
let currentPage = 0;
let keyList = [];
const klD = [];

addToHTMLlog('Waiting for host...');

universal.socket.on('server_connected', function () {
  removeFromHTMLlog('Waiting for host...');
  addToHTMLlog('Companion connected!');
  universal.socket.emit('c-connected');
  if (document.getElementById('keys')) loadPage(0);
  document.getElementById('console').style.display = 'none';
});

function removeFromHTMLlog (text) {
  document.getElementById('console').removeChild(document.getElementById(text));
}

function loadPage (pageNumber) {
  autoSort();
  currentPage = pageNumber;
  keyList = [];
  const myNode = document.getElementById('keys');
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild);
  }
  // eslint-disable-next-line no-undef
  Pages[pageNumber].forEach(sound => {
    keyList.push(sound);
    const btn = document.createElement('button');
    const key = document.createElement('p');
    btn.className = 'keypress white-txt';
    if (sound.keys) {
      btn.setAttribute('data-multi', true);
      btn.setAttribute('data-keys', sound.keys);
      key.innerText = sound.keys;
    }
    if (sound.path) {
      btn.setAttribute('data-path', sound.path);
    }
    if (sound.icon) {
      btn.style.backgroundImage = "url('../assets/icons/" + sound.icon + "')";
    }
    btn.innerText = sound.name;
    keys.appendChild(btn);
  });

  const allKeypress = document.getElementsByClassName('keypress');
  for (let i = 0; i < allKeypress.length; i++) {
    allKeypress[i].onclick = (ev) => {
      document.getElementById('mcip').style.backgroundImage = allKeypress[i].style.backgroundImage;
      document.getElementById('mhe').setAttribute('data-orig-name', allKeypress[i].innerText);
      document.getElementById('mhe').setAttribute('data-orig-key', allKeypress[i].getAttribute('data-keys'));

      if (allKeypress[i].getAttribute('data-multi') && allKeypress[i].getAttribute('data-keys')) {
        let i = 0;
        JSON.parse(allKeypress[i].getAttribute('data-keys')).forEach(key => {
          klD.push(`<label for="newkey">Key:</label><input type="text" value='${key}' data-key-num="${i}" disabled/>`);
          i++;
        });

        document.getElementById('mhe').innerText = 'Editing ' + allKeypress[i].innerText + ' - Multi Key Macro';
        document.getElementById('newname').value = allKeypress[i].innerText;

        document.getElementById('npl').style.display = 'none';
        document.getElementById('newpath').style.display = 'none';

        document.getElementById('mcmultikey').innerHTML = `${klD.join('\n')}`;

        modal.style.display = 'block';
        return;
      }

      document.getElementById('mhe').innerText = 'Editing ' + allKeypress[i].innerText;
      document.getElementById('newname').value = allKeypress[i].innerText;
      document.getElementById('newpath').value = allKeypress[i].getAttribute('data-path');

      modal.style.display = 'block';
    };
  }
}

universal.socket.on('press-sound', (sound, name) => {
  if (sound.includes('--Stop_all')) {
    // eslint-disable-next-line no-undef
    Susaudio.stopAll();
    return;
  }
  // eslint-disable-next-line no-undef
  Susaudio.playSound(sound, name);
});

// eslint-disable-next-line no-unused-vars
function DeleteKey (key) {
  // eslint-disable-next-line no-undef
  Sounds.splice(Sounds.indexOf({ name: key.name }), 1);
  universal.socket.emit('c-delete-key', { name: key.name });
}

// eslint-disable-next-line no-unused-vars
function createNewSound () {
  // eslint-disable-next-line no-undef
  Sounds.push({
    name: 'New Key',
    path: 'unnamed.mp3'
  });
  universal.socket.emit('c-newkey', { name: 'New Key', path: 'unnamed.mp3' });
  loadPage(0);
}

// Get the modal
const modal = document.getElementById('myModal');
// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

if (document.getElementById('screenSaverActivationTime')) {
  document.getElementById('screenSaverActivationTime').oninput = () => {
    document.getElementById('amt').innerText = document.getElementById('screenSaverActivationTime').value + ' seconds';
  };
}

// eslint-disable-next-line no-unused-vars
function changeInfo (key) {
  const newpath = document.getElementById('newpath').value;
  const newname = document.getElementById('newname').value;
  universal.emit('c-info-change', { type: 'key_edit', key, newpath, newname });
  loadPage(0);
}

// eslint-disable-next-line no-unused-vars
function setSet () {
  const soc = document.getElementById('soc').checked;
  const screenSaverActivationTime = document.getElementById('screenSaverActivationTime').value;
  universal.emit('c-info-change', { type: 'ssat_soc', screenSaverActivationTime, soc });
  universal.socket.emit('c-change');
}

universal.socket.on('companion_info', function (screenSaverActivationTime, soc) {
  if (document.getElementById('screenSaverActivationTime')) {
    document.getElementById('soc').checked = soc;
    document.getElementById('screenSaverActivationTime').value = screenSaverActivationTime;
    document.getElementById('amt').innerText = document.getElementById('screenSaverActivationTime').value + ' seconds';
  };
});

function autoSort () {
  // eslint-disable-next-line no-undef
  const pagesAmount = Sounds.length / countOnEachPage;
  for (let i = 0; i < pagesAmount; i++) {
    Pages[i] = [];
  }
  let pageCounter = 0;
  let index = 0;
  // eslint-disable-next-line no-undef
  Sounds.forEach(sound => {
    Pages[pageCounter].push(sound);
    if (index === countOnEachPage) {
      pageCounter++;
      index = 0;
    }
    index++;
  });
}

// eslint-disable-next-line no-unused-vars
function np () {
  if (Pages[currentPage + 1]) {
    loadPage(currentPage + 1);
  }
}

// eslint-disable-next-line no-unused-vars
function bp () {
  if (Pages[currentPage - 1]) {
    loadPage(currentPage - 1);
  }
}
