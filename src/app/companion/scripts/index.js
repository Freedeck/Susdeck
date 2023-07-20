/* eslint-disable no-undef */
const keys = document.querySelector('#keys');
const Pages = {};
const countOnEachPage = 8;
let currentPage = pageNumber = universal.load('page') ? universal.load('page') : 0;
let keyList = [];
const klD = [];

universal.socket.on('server_connected', () => {
  universal.socket.emit('c-connected');
  if (document.querySelector('#keys')) loadPage();
  document.querySelector('#console').style.display = 'none';
});

function loadPage (pageNumber = 0) {
  autoSort();
  currentPage = pageNumber;
  keyList = [];
  const myNode = document.querySelector('#keys');
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild);
  }
  // eslint-disable-next-line no-undef
  Pages[currentPage].forEach(sound => {
    keyList.push(sound);
    const btn = document.createElement('button');
    const key = document.createElement('p');
    btn.className = 'keypress white-txt';
    if (sound.keys) {
      btn.setAttribute('data-multi', true);
      btn.setAttribute('data-keys', JSON.parse(sound.keys).join(','));
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
      if (ev.target.style.backgroundImage) document.querySelector('#mcip').style.backgroundImage = ev.target.style.backgroundImage;
      document.querySelector('#mcip').setAttribute('data-orig-icon', ev.target.style.backgroundImage);
      document.querySelector('#mhe').setAttribute('data-orig-name', ev.target.innerText);
      document.querySelector('#mhe').setAttribute('data-orig-key', ev.target.getAttribute('data-keys'));
      document.querySelector('#mcmultikey').innerHTML = '';

      if (ev.target.getAttribute('data-multi') && ev.target.getAttribute('data-keys')) {
        klD.splice(0, klD.length);
        ev.target.getAttribute('data-keys').split(',').forEach(key => {
          klD.push(`<label for="newkey">Key:</label><input type="text" class="btn-key" value='${key}' data-og-value='${key}' data-key-num="${i}"/>`);
          i++;
        });

        document.querySelector('#npl').style.display = 'none';
        document.querySelector('#newpath').style.display = 'none';

        document.querySelector('#mcmultikey').innerHTML = `${klD.join('\n')}`;
      }

      document.querySelector('#mhe').innerText = 'Editing ' + ev.target.innerText;
      document.querySelector('#newname').value = ev.target.innerText;
      document.querySelector('#newname').setAttribute('data-og-name', ev.target.innerText);
      if (ev.target.getAttribute('data-path')) document.querySelector('#newpath').value = ev.target.getAttribute('data-path');
      if (ev.target.getAttribute('data-path')) document.querySelector('#newpath').setAttribute('data-o-path', ev.target.getAttribute('data-path'));

      document.querySelector('#mcip').onclick = () => {
        // <iframe name="dummyframe" id="dummyframe" style="display: none;"></iframe>
        const dummyframe = document.createElement('iframe');
        dummyframe.style.display = 'none';
        dummyframe.id = 'dummyframe';
        dummyframe.name = 'dummyframe';
        const form = document.createElement('form');
        form.method = 'post';
        form.enctype = 'multipart/form-data';
        form.action = '/api/upload/icon';
        form.target = 'dummyframe';
        const fileupload = document.createElement('input');
        fileupload.type = 'file';
        fileupload.name = 'file';
        fileupload.accept = '.png,.jpg,.jpeg,.gif';
        form.appendChild(fileupload);
        fileupload.click();
        fileupload.onchange = () => {
          form.submit();
          setTimeout(() => {
            content = dummyframe.contentDocument;
            const data = JSON.parse(content.querySelector('pre').innerText);
            document.querySelector('#mcip').setAttribute('data-new-icon', data.newName);
            document.querySelector('#mcip').style.backgroundImage = 'url("../assets/icons/' + data.newName + '")';
          }, 250);
        };
        document.body.append(form);
        document.body.appendChild(dummyframe);
      };

      modal.style.display = 'block';
    };
  }
}

// eslint-disable-next-line no-unused-vars
function DeleteKey (key) {
  // eslint-disable-next-line no-undef
  Sounds.splice(Sounds.indexOf({ name: key.name }), 1);
  universal.socket.emit('c-delete-key', { name: key.name });
}

// eslint-disable-next-line no-unused-vars
function createNewSound () {
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
    const JSONData = {
      name: 'New Key'
    };
    if (nSel.value === 'default') JSONData.path = 'unnamed.mp3';
    if (nSel.value === 'Keybind') JSONData.keys = JSON.stringify(['A', 'B']);
    Sounds.push(JSONData);
    universal.socket.emit('c-newkey', JSONData);
    loadPage(currentPage);
  });
}

// Get the modal
const modal = document.querySelector('#myModal');
// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
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
function changeInfo (key) {
  const oldpath = document.querySelector('#newpath').getAttribute('data-o-path');
  const newpath = document.querySelector('#newpath').value;
  const keys = document.querySelectorAll('.btn-key');
  const oldicon = document.querySelector('#mcip').getAttribute('data-orig-icon');
  const icon = document.querySelector('#mcip').getAttribute('data-new-icon');
  const keysArr = [];
  const ogValues = [];
  keys.forEach(k => {
    keysArr.push(k.value);
    ogValues.push(k.getAttribute('data-og-value'));
  });
  const newname = document.querySelector('#newname').value;
  const name = document.querySelector('#newname').getAttribute('data-og-name');
  universal.emit('c-info-change', { type: 'key_edit', oldicon, icon, key, keysArr, ogValues, oldpath, newpath, newname, name });
  loadPage();
}

// eslint-disable-next-line no-unused-vars
function setSet () {
  const soc = document.querySelector('#soc').checked;
  const screenSaverActivationTime = document.querySelector('#screenSaverActivationTime').value;
  universal.emit('c-info-change', { type: 'ssat_soc', screenSaverActivationTime, soc });
  universal.socket.emit('c-change');
}

universal.socket.on('companion_info', function (screenSaverActivationTime, soc) {
  if (document.querySelector('#screenSaverActivationTime')) {
    document.querySelector('#soc').checked = soc;
    document.querySelector('#screenSaverActivationTime').value = screenSaverActivationTime;
    document.querySelector('#amt').innerText = document.querySelector('#screenSaverActivationTime').value + ' seconds';
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
