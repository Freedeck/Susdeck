/* eslint-disable no-undef */
const keys = document.getElementById('keys');
const Pages = {};
const countOnEachPage = 8;
let currentPage = 0;
let keyList = [];
const klD = [];

// eslint-disable-next-line no-undef
Susaudio.init();

addToHTMLlog('Waiting for host...');

susdeckUniversal.socket.on('server_connected', function () {
  removeFromHTMLlog('Waiting for host...');
  addToHTMLlog('Companion connected!');
  susdeckUniversal.socket.emit('c-connected');
  if (document.getElementById('keys')) loadPage(0);
  setTimeout(() => {
    document.getElementById('console').style.display = 'none';
  }, 1000);
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
      btn.setAttribute('data-key', sound.keys);
    }
    if (sound.key) {
      btn.setAttribute('data-key', sound.key);
      btn.setAttribute('data-uneditable', true);
      key.innerText = sound.key;
    }
    if (sound.path) {
      btn.setAttribute('data-key', sound.path);
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
      document.getElementById('mhe').setAttribute('data-orig-key', allKeypress[i].getAttribute('data-key'));

      if (allKeypress[i].getAttribute('data-multi') && allKeypress[i].getAttribute('data-key')) {
        let i = 0;
        JSON.parse(allKeypress[i].getAttribute('data-key')).forEach(key => {
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
      document.getElementById('newpath').value = allKeypress[i].getAttribute('data-key');

      modal.style.display = 'block';
    };
  }
}

susdeckUniversal.socket.on('press-sound', (sound, name) => {
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
  Sounds.splice(Sounds.indexOf({ name: key.name, key: key.key }), 1);
  susdeckUniversal.socket.emit('c-delete-key', { name: key.name, key: key.key });
}

// eslint-disable-next-line no-unused-vars
function createNewSound () {
  // eslint-disable-next-line no-undef
  Sounds.push({
    name: 'New Key',
    key: 'enter'
  });
  susdeckUniversal.socket.emit('c-newkey', { name: 'New Key', key: 'enter' });
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
  susdeckUniversal.emit('c-info-change', { type: 'key_edit', key, newpath, newname });
  loadPage(0);
}

// eslint-disable-next-line no-unused-vars
function setSet () {
  const soc = document.getElementById('soc').checked;
  const screenSaverActivationTime = document.getElementById('screenSaverActivationTime').value;
  susdeckUniversal.emit('c-info-change', { type: 'ssat_soc', screenSaverActivationTime, soc });
  susdeckUniversal.socket.emit('c-change');
}

susdeckUniversal.socket.on('companion_info', function (screenSaverActivationTime, soc) {
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
