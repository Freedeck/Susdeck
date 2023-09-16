/* eslint-disable no-undef */
const keys = document.querySelector('#keys');
const Pages = {};
let currentPage = pageNumber = universal.load('page') ? universal.load('page') : 0;
let keyList = [];
const klD = [];

universal.socket.on('server_connected', () => {
  universal.socket.emit('c-connected');
  if (document.querySelector('#keys')) {
    loadPage(currentPage);
    setTimeout(() => {
      np();
      bp();
    });
  }
  document.querySelector('#console').style.display = 'none';

  universal.socket.emit('c2s_ver_match');
});

const loadPage = (pageNumber = 0) => {
  autoSort(universal.iconCount);
  currentPage = pageNumber;
  keyList = [];
  const myNode = document.querySelector('#keys');
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild);
  }
  const utils = [
    {
      name: 'Stop All',
      i: 997
    },
    {
      name: 'Reload',
      i: 998
    },
    {
      name: 'Settings',
      i: 997
    }
  ];

  // eslint-disable-next-line no-undef
  i = 0;
  Pages[currentPage].forEach(sound => {
    sound.i = 0;
    keyList.push(sound);
    btn = createButton(sound);
    keys.appendChild(btn);
    i++;
  });

  if (Pages[pageNumber].length > 0) {
    utils.forEach((util) => {
      keyList.push(util);
      btn = createButton(util);
      btn.setAttribute('data-unedit', true);
      keys.appendChild(btn);
    });
  }

  setupAllKeypresses();
};

const setupAllKeypresses = () => {
  const allKeypress = document.getElementsByClassName('keypress');
  for (let i = 0; i < allKeypress.length; i++) {
    allKeypress[i].onclick = (ev) => {
      if (ev.target.getAttribute('data-unedit')) return;
      if (ev.target.style.backgroundImage) document.querySelector('#mcip').style.backgroundImage = ev.target.style.backgroundImage;
      document.querySelector('#mcip').setAttribute('data-orig-icon', ev.target.style.backgroundImage);
      document.querySelector('#mhe').setAttribute('data-orig-name', ev.target.innerText);
      document.querySelector('#mhe').setAttribute('data-orig-key', ev.target.getAttribute('data-keys'));
      document.querySelector('#mcmultikey').innerHTML = '';

      if (ev.target.getAttribute('data-multi') && ev.target.getAttribute('data-keys')) {
        klD.splice(0, klD.length);
        ai = 1;
        ev.target.getAttribute('data-keys').split(',').forEach(key => {
          klD.push(`<label for="newkey">Key ${ai}:</label><input type="text" class="btn-key" value='${key}' data-og-value='${key}' data-key-num="${i}"/>`);
          i++;
          ai++;
        });

        document.querySelector('#npl').style.display = 'none';
        document.querySelector('#newpath').style.display = 'none';

        document.querySelector('#mcmultikey').innerHTML = `${klD.join('\n')}`;
      }

      document.querySelector('#mhe').innerText = 'Editing ' + ev.target.innerText;
      document.querySelector('#newname').value = ev.target.innerText;
      document.querySelector('#newname').setAttribute('data-og-name', ev.target.innerText);
      document.querySelector('#mcsu').style.display = 'none';
      document.querySelector('#uuid').value = ev.target.getAttribute('data-uuid');
      if (ev.target.getAttribute('data-path')) document.querySelector('#newpath').value = ev.target.getAttribute('data-path');
      if (ev.target.getAttribute('data-path')) document.querySelector('#newpath').setAttribute('data-o-path', ev.target.getAttribute('data-path'));
      if (ev.target.getAttribute('data-path')) document.querySelector('#mcsu').style.display = 'block';

      document.querySelector('#mcip').onclick = () => {
        upload('icon', '.png,.jpg,.jpeg,.gif');
      };

      document.querySelector('#mcsu').onclick = () => {
        upload('sounds', '.mp3,.wav,.mp4');
      };

      modal.style.display = 'block';
    };
  }
};

const upload = (path, accept) => {
  // <iframe name="dummyFrame" id="dummyFrame" style="display: none;"></iframe>
  const dummyFrame = document.createElement('iframe');
  dummyFrame.style.display = 'none';
  dummyFrame.id = 'dummyFrame';
  dummyFrame.name = 'dummyFrame';
  const form = document.createElement('form');
  form.method = 'post';
  form.enctype = 'multipart/form-data';
  form.action = '/api/upload/' + path;
  form.target = 'dummyFrame';
  form.style.display = 'none';
  const fileUpload = document.createElement('input');
  fileUpload.type = 'file';
  fileUpload.name = 'file';
  fileUpload.accept = accept;
  fileUpload.style.display = 'none';
  form.appendChild(fileUpload);
  fileUpload.click();
  fileUpload.onchange = () => {
    form.submit();
    setTimeout(() => {
      content = dummyFrame.contentDocument;
      const data = JSON.parse(content.querySelector('pre').innerText);
      if (path === 'icon') {
        document.querySelector('#mcip').setAttribute('data-new-icon', data.newName);
        document.querySelector('#mcip').style.backgroundImage = 'url("../assets/icons/' + data.newName + '")';
      } else {
        document.querySelector('#newpath').value = data.newName;
      }
      document.querySelector('#mcset').addEventListener('click', (ev) => {
        form.remove();
        fileUpload.remove();
        document.querySelector('#mcset').disabled = false;
        setTimeout(() => {
          dummyFrame.remove();
          document.querySelector('#mcset').disabled = false;
        }, 500);
      });
    }, 250);
  };
  document.body.append(form);
  document.body.appendChild(dummyFrame);
};

// eslint-disable-next-line no-unused-vars
const DeleteKey = (key) => {
  // eslint-disable-next-line no-undef
  Sounds.splice(Sounds.indexOf({ name: key.name }), 1);
  universal.socket.emit('c-delete-key', { name: key.name });
};

const createButton = (sound) => {
  const btn = document.createElement('button');
  const key = document.createElement('p');
  btn.className = 'keypress white-txt';
  if (sound.keys) {
    btn.setAttribute('data-multi', true);
    btn.setAttribute('data-keys', JSON.parse(sound.keys).join(','));
    key.innerText = sound.keys;
  }
  if (sound.unedit) {
    btn.setAttribute('data-unedit', true);
  }
  if (sound.path) {
    btn.setAttribute('data-path', sound.path);
  }
  if (sound.icon) {
    btn.style.backgroundImage = "url('../assets/icons/" + sound.icon + "')";
  }
  btn.setAttribute('data-uuid', sound.uuid);
  btn.setAttribute('data-i', sound.i);
  btn.innerText = sound.name;
  return btn;
};

// eslint-disable-next-line no-unused-vars
const createNewSound = () => {
  // eslint-disable-next-line no-undef
  const newDialog = document.createElement('dialog');
  const newForm = document.createElement('form');

  const cancelBtn = document.createElement('button');
  cancelBtn.innerText = 'Cancel';
  cancelBtn.value = 'cancel';
  cancelBtn.formMethod = 'dialog';
  const confirmBtn = document.createElement('button');
  confirmBtn.value = 'default';
  confirmBtn.innerText = 'Confirm';

  const nMessage = document.createElement('p');
  const nLabel = document.createElement('label');
  nLabel.innerText = 'Type of button?';
  const nSel = document.createElement('select');
  const nOptionSoundDefault = document.createElement('option');
  nOptionSoundDefault.innerText = 'Sound';
  nOptionSoundDefault.value = 'default';
  const nOptionKeybind = document.createElement('option');
  nOptionKeybind.innerText = 'Keybind';

  nSel.appendChild(nOptionSoundDefault);
  nSel.appendChild(nOptionKeybind);
  nLabel.appendChild(nSel);
  nMessage.appendChild(nLabel);
  newForm.appendChild(nMessage);
  newDialog.appendChild(newForm);
  newDialog.appendChild(cancelBtn);
  newDialog.appendChild(confirmBtn);
  document.body.appendChild(newDialog);
  newDialog.showModal();
  nSel.addEventListener('change', (e) => {
    confirmBtn.value = nSel.value;
  });
  cancelBtn.addEventListener('click', (e) => {
    newDialog.remove();
  });
  confirmBtn.addEventListener('click', (event) => {
    event.preventDefault(); // We don't want to submit this fake form
    newDialog.close(nSel.value); // Have to send the select box value here.
    console.log(nSel.value);
    myUuid = 'CA-' + Math.random().toString().substring(2, 6);
    const JSONData = {
      name: 'New Key',
      uuid: myUuid
    };
    if (nSel.value === 'default') JSONData.path = 'unnamed.mp3';
    if (nSel.value === 'Keybind') JSONData.keys = JSON.stringify(['A', 'B']);
    Sounds.push(JSONData);
    universal.socket.emit('c-newkey', JSONData);
    keyList.push(JSONData);
    btn = createButton(JSONData);
    keys.appendChild(btn);
    setupAllKeypresses(true);
    btn.click();
    btn.remove();
  });
};

// Get the modal
const modal = document.querySelector('#myModal');
// When the user clicks anywhere outside of the modal, close it
window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

if (document.querySelector('#screenSaverActivationTime')) {
  document.querySelector('#screenSaverActivationTime').oninput = () => {
    document.querySelector('#amt').innerText = document.querySelector('#screenSaverActivationTime').value + ' seconds';
  };
}

// eslint-disable-next-line no-unused-vars
const changeInfo = (key) => {
  const oldpath = document.querySelector('#newpath').getAttribute('data-o-path');
  const newpath = document.querySelector('#newpath').value;
  const keys = document.querySelectorAll('.btn-key');
  const oldIcon = document.querySelector('#mcip').getAttribute('data-orig-icon');
  const icon = document.querySelector('#mcip').getAttribute('data-new-icon');
  const keysArr = [];
  const ogValues = [];
  keys.forEach(k => {
    keysArr.push(k.value);
    ogValues.push(k.getAttribute('data-og-value'));
  });
  const newname = document.querySelector('#newname').value;
  const uuid = document.querySelector('#uuid').value;
  const name = document.querySelector('#newname').getAttribute('data-og-name');
  universal.emit('c-info-change', { type: 'key_edit', uuid, oldIcon, icon, key, keysArr, ogValues, oldpath, newpath, newname, name });
  loadPage();
}

// eslint-disable-next-line no-unused-vars
const setSet = () => {
  const screenSaverActivationTime = document.querySelector('#screenSaverActivationTime').value;
  universal.emit('c-info-change', { type: 'screenSaver_soc', screenSaverActivationTime });
  universal.socket.emit('c-change');
};

universal.socket.on('companion_info', (screenSaverActivationTime) => {
  if (document.querySelector('#screenSaverActivationTime')) {
    document.querySelector('#screenSaverActivationTime').value = screenSaverActivationTime;
    document.querySelector('#amt').innerText = document.querySelector('#screenSaverActivationTime').value + ' seconds';
  };
});

const autoSort = (countOnEP) => {
  let pagesAmount = Math.ceil(Sounds.length / universal.iconCount);
  let pageCounter = 0;
  let index = 0;
  pagesAmount = Math.ceil(Sounds.length / countOnEP); // Set the amount of pages
  for (let i = 0; i < pagesAmount; i++) {
    Pages[i] = []; // Loop through and clear each page
  }

  pageCounter = 0; // Start on page 0
  index = 0; // Alongside sound 0

  Sounds.forEach(sound => { // Loop through each sound
    Pages[pageCounter].push(sound); // Add it to a page
    if (index === countOnEP) { // However, if we reach the max icon count for the screen,
      pageCounter++; // Increment the page
      index = 0; // And reset the sound amount counter
      return;
    }
    index++; // Increment sound index/amount
  });
};

// eslint-disable-next-line no-unused-vars
const np = () => {
  if (Pages[currentPage + 1] && Pages[currentPage + 1].length !== 0) {
    loadPage(currentPage + 1);
  }
};

// eslint-disable-next-line no-unused-vars
const bp = () => {
  if (Pages[currentPage - 1] && Pages[currentPage - 1].length !== 0) {
    loadPage(currentPage - 1);
  }
};
