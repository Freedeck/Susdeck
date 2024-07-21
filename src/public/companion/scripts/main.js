import {universal} from '../../scripts/universal.js';
import Sortable from 'sortablejs';
import './global.js';
import './authfulPage.js'; // Only for authenticated pages
const Pages = {};

await universal.init('Companion');

new Sortable(document.querySelector('#keys'), {
  onUpdate: (d) => {
    d.newDraggableIndex = d.newDraggableIndex + (universal.page * universal.config.iconCountPerPage);
    d.oldDraggableIndex = d.oldDraggableIndex + (universal.page * universal.config.iconCountPerPage);

    const ev = universal.page < 0 ? 1 : 0;
    universal.send(universal.events.companion.move_key,
        JSON.stringify({
          name: d.item.innerText,
          item: d.item.getAttribute('data-interaction'),
          newIndex: d.newDraggableIndex + ev,
          oldIndex: d.oldDraggableIndex + ev,
        }));
    universal.page = 0;
  },
  filter: '.unset',
  preventOnFilter: true,
});

/**
 * @name reloadSounds
 * @description Reload all of the sounds in the client's DOM.
 */
function reloadSounds() {
  universal.page = universal.load('page') != '\x9Eée' ? parseInt(universal.load('page')) : 0;
  reloadProfile();
  document.querySelectorAll('#keys > .button').forEach((key) => {
    key.remove();
  });
  document.querySelectorAll('.k').forEach((k) => {
    k.remove();
  });
  document.querySelector('.cpage').innerText = 'Page: ' + (universal.page + 1) + '/' + (Object.keys(Pages).length);
  universal.keySet();
  universal.config.sounds.forEach((sound) => {
    const k = Object.keys(sound)[0];
    const snd = sound[k];
    let keyObject = document.querySelector('.k-' + snd.pos);

    if (snd.pos < ((universal.config.iconCountPerPage) * universal.page)) return;
    if (!keyObject) {
      if (universal.page == 0) return;
      const newPos = snd.pos - (universal.config.iconCountPerPage * universal.page);
      snd.pos = newPos;
      keyObject = document.querySelector('.k-' + snd.pos);
      snd.pos = newPos + (universal.config.iconCountPerPage * universal.page);
    };
    try {
      keyObject.setAttribute('data-interaction', JSON.stringify(snd));
      if (snd.data.icon) keyObject.style.backgroundImage = 'url("' + snd.data.icon + '")';
      if (snd.data.color) keyObject.style.backgroundColor = snd.data.color;
      keyObject.innerText = k;
      keyObject.className = keyObject.className.replace('unset', '');
      keyObject.onclick = (ev) => {
        universal.send(universal.events.keypress, JSON.stringify({event: ev, btn: snd}));
      };

      // check if two sounds share the same pos, if they do make this button color yellow
      const sounds = universal.config.sounds.filter((sound) => {
        const ev = universal.page > 0 ? 1 : 0;
        const k = Object.keys(sound)[0];
        return sound[k].pos == snd.pos + (universal.page * universal.config.iconCountPerPage) + ev;
      });
      if (sounds.length > 1) {
        keyObject.style.background = 'yellow';
      }
    } catch (e) {
    }
  });
  // document.getElementById('keys').style.maxHeight = document.querySelectorAll('.k').length * (10*12)/window.innerWidth + '%';
}

document.querySelector('.toggle-sidebar button').onclick = (ev) => {
  if (document.querySelector('.sidebar').style.display == 'flex') {
    universal.uiSounds.playSound('slide_close');
    document.querySelector('.sidebar').style.animation = 'sidebar-slide-out 0.5s';
    document.querySelector('.sidebar').style.animationFillMode = 'forward';
    document.querySelector('.toggle-sidebar button').style.transform = 'rotate(0deg)';
    document.querySelector('.toggle-sidebar').style.left = '0';
    setTimeout(() => {
      document.querySelector('.sidebar').style.display = 'none';
    }, 500);
  } else {
    universal.uiSounds.playSound('slide_open');
    document.querySelector('.sidebar').style.display = 'flex';
    document.querySelector('.sidebar').style.animation = 'sidebar-slide-in 0.5s';
    document.querySelector('.toggle-sidebar button').style.transform = 'rotate(180deg)';
    document.querySelector('.toggle-sidebar').style.left = 'calc(11.5%)';
  }
};

reloadSounds();

window['button-types'] = [
  {name: 'Sound', type: 'sound'},
  // {name: 'Macro', type: 'macro'}, // Not implemented
  {name: 'Plugin', type: 'plugin'},
];

window.oncontextmenu = function(e) {
  // console.log(e.srcElement)
  if (document.querySelector('.contextMenu')) document.querySelector('.contextMenu').remove();
  if (!e.srcElement.className.includes('button')) return false;
  if (e.srcElement.className.includes('builtin')) return false;
  const custMenu = document.createElement('div');
  custMenu.className = 'contextMenu';
  custMenu.style.top = e.clientY - window.scrollY + 'px';
  custMenu.style.left = e.clientX - window.scrollX + 'px';
  custMenu.style.position = 'absolute';

  const custMenuTitle = document.createElement('div');
  custMenuTitle.innerText = 'Editing ' + (e.srcElement.innerText != '' ? e.srcElement.innerText : 'nothing!');
  custMenuTitle.style.fontWeight = 'bold';
  custMenuTitle.style.marginBottom = '5px';
  custMenu.appendChild(custMenuTitle);

  let custMenuItems = [
    'New Tile',
  ];
  if (e.srcElement.innerText != '') {
    custMenuItems = ['Edit Tile'].concat(custMenuItems);
    custMenuItems.push('Remove Tile');
  } else {
    custMenuItems = ['Copy Tile Here'].concat(custMenuItems);
  }

  custMenuItems = custMenuItems.concat([
    '',
    'New Page',
    'Profile: ' + universal.config.profile,
  ]);

  custMenuItems.forEach((item) => {
    const menuItem = document.createElement('div');
    menuItem.innerText = item;
    menuItem.className = 'menuItem';
    menuItem.onclick = () => {
      // Handle menu item click
      switch (item) {
        case 'New Page':
          Pages[Object.keys(Pages).length] = [];
          universal.page = Object.keys(Pages).length - 1;
          reloadSounds();
          break;
        case '---':
          break;
        case 'Profile: ' + universal.config.profile:
          showPick('Profile', Object.keys(universal.config.profiles).map((profile) => {
            return {name: profile};
          }), (modal, value, feedback, title, button, content) => {
            universal.send(universal.events.companion.set_profile, value.name);
          });
          break;
        case 'Edit Tile':
          // show a modal with the editor
          editTile(e);
          break;
        case 'New Tile':
          showPick('New Tile', window['button-types'], (modal, value, feedback, title, button, content) => {
            const pos = parseInt(
                e.srcElement.className.split(' ')[1].split('-')[1]) +
              (universal.page < 0 ? 1 : 0) +
              ((universal.page > 0 ? (universal.config.iconCountPerPage * universal.page) : 0));
            if (value.type == 'sound') createSound(pos);
            if (value.type == 'plugin') createPlugin(pos);
          });
          break;
        case 'Remove Tile':
          reloadProfile();
          universal.send(universal.events.companion.del_key, JSON.stringify({name: e.srcElement.innerText, item: e.srcElement.getAttribute('data-interaction')}));
          break;
        case 'Copy Tile Here':
          showReplaceGUI(e.srcElement);
          break;
        default:
          break;
      }
    };
    custMenu.appendChild(menuItem);
  });
  document.body.appendChild(custMenu);
  return false; // cancel default menu
};

/**
 * @name showReplaceGUI
 * @param {HTMLElement} srcElement The element that you want to copy/replace.
 * @description Show the GUI for replacing a button with another from the universal.config.sounds context.
 */
function showReplaceGUI(srcElement) {
  reloadProfile();
  showPick('Copy from:', universal.config.sounds.map((sound) => {
    const k = Object.keys(sound)[0];
    return {name: k, type: sound[k].type};
  }), (modal, value, feedback, title, button, content) => {
    reloadProfile();
    const valueToo = universal.config.sounds.filter((sound) => {
      const k = Object.keys(sound)[0];
      return k == value.name;
    })[0][value.name];
    const pos = parseInt(
        srcElement.className.split(' ')[1].split('-')[1]) +
      (universal.page <= 0 ? 1 : 0) +
      ((universal.page > 0 ? (universal.config.iconCountPerPage * universal.page) : 0));
    // we need to clone value, and change the pos, and uuid, then make a new key.
    universal.send(universal.events.companion.new_key, JSON.stringify({
      [value.name]: {
        type: valueToo.type,
        plugin: valueToo.plugin || 'Freedeck',
        pos,
        uuid: 'fdc.' + Math.random() * 10000000,
        data: valueToo.data,
      },
    }));
    return true;
  });
}

/**
 * Load data into editor
 * @param {*} itm List of data objects (like {a:2,b:2})
 */
function loadData(itm) {
  document.querySelector('#editor-data').innerHTML = '';
  Object.keys(itm).forEach((key) => {
    const elem = document.createElement('input');
    elem.type = 'text';
    elem.placeholder = key;
    elem.value = itm[key];
    elem.className = 'editor-data';
    elem.id = key;
    const label = document.createElement('label');
    label.class = 'editordata-removable';
    label.innerText = key;
    label.appendChild(elem);
    document.querySelector('#editor-data').appendChild(label);
  });
}

document.querySelector('#color').onchange = (e) => {
  document.querySelector('#editor-btn').style.backgroundColor = e.srcElement.value;
  document.querySelector('#color').dataset.has_set = 'true';
  // create data "color"
  const interaction = JSON.parse(document.querySelector('#editor-btn[data-interaction]').getAttribute('data-interaction'));
  interaction.data.color = e.srcElement.value;
  document.querySelector('#editor-btn').setAttribute('data-interaction', JSON.stringify(interaction));
  loadData(interaction.data);
};

/**
 * Edit a tile
 * @param {*} e HTML Element corresponding to the button that we grabbed context from
 */
function editTile(e) {
  universal.uiSounds.playSound('editor_open');
  if (document.querySelector('.toggle-sidebar').style.left != '0px') document.querySelector('.toggle-sidebar button').click();
  if (document.querySelector('.contextMenu')) document.querySelector('.contextMenu').style.display = 'none';
  document.querySelector('#sidebar').style.right = '-20%';
  document.querySelector('#editor').style.display = 'block';
  document.querySelector('#editor-btn').innerText = e.srcElement.innerText;
  document.querySelector('#editor-btn').style.backgroundImage = 'url("' + JSON.parse(e.srcElement.getAttribute('data-interaction')).data.icon + '")';
  document.querySelector('#editor-btn').style.backgroundColor = JSON.parse(e.srcElement.getAttribute('data-interaction')).data.color;
  document.querySelector('#color').value = JSON.parse(e.srcElement.getAttribute('data-interaction')).data.color;
  document.querySelector('#name').value = e.srcElement.innerText;
  document.querySelector('#editor-btn').setAttribute('data-pre-edit', e.srcElement.innerText);
  document.querySelector('#editor-btn').setAttribute('data-interaction', e.srcElement.getAttribute('data-interaction'));
  document.querySelector('#type').value = JSON.parse(e.srcElement.getAttribute('data-interaction')).type;
  document.querySelector('#plugin').value = JSON.parse(e.srcElement.getAttribute('data-interaction')).plugin || 'Freedeck';
  if (JSON.parse(e.srcElement.getAttribute('data-interaction')).type == 'fd.sound') {
    document.querySelector('#upload-sound').style.display = 'flex';
  } else {
    document.querySelector('#upload-sound').style.display = 'none';
  }
  if (JSON.parse(e.srcElement.getAttribute('data-interaction')).data) {
    const itm = JSON.parse(e.srcElement.getAttribute('data-interaction')).data;
    loadData(itm);
  }
  // make it fade in
  document.querySelector('#editor').style.opacity = '0';
  document.querySelector('.toggle-sidebar button').style.display = 'none';
  setTimeout(() => {
    document.querySelector('#editor').style.opacity = '1';
  }, 100);
}

/**
 * @name createSound
 * @param {Number} pos The position of the new sound key.
 * @description Create a new sound key.
 */
function createSound(pos) {
  showEditModal('New Sound Tile', 'Enter a name for the new tile', (modal, value, feedback, title, button, input, content) => {
    if (value.length < 1) {
      feedback.innerText = 'Please enter a name for the tile';
      return false;
    }
    reloadProfile();
    universal.send(universal.events.companion.new_key, JSON.stringify({
      [value]: {
        type: 'fd.sound',
        pos,
        uuid: 'fdc.' + Math.random() * 10000000,
        data: {file: 'Unset.mp3', path: '/sounds/'},
      },
    }));
    return true;
  });
}

/**
 * @name createPlugin
 * @param {Number} pos The position of the new plugin key.
 * @description Create a new plugin key.
 */
function createPlugin(pos) {
  showPick('New Plugin Tile', universal._tyc.keys(), (modala, valuea, feedbacka, titlea, buttona, contenta) => {
    showEditModal('New Plugin Tile', 'Enter a name for the new tile', (modal, value, feedback, title, button, input, content) => {
      if (value.length < 1) {
        feedback.innerText = 'Please enter a name for the tile';
        return false;
      }
      reloadProfile();
      universal.send(universal.events.companion.new_key, JSON.stringify({
        [value]: {
          type: valuea.type,
          pos,
          uuid: 'fdc.' + Math.random() * 10000000,
          plugin: valuea.name,
          data: valuea.templateData,
        },
      }));
    });
    return true;
  });
}


document.querySelector('#upload-sound').onclick = () => {
  upload('audio/*,video/*', (data) => {
    reloadProfile();
    const previousInteractionData = JSON.parse(document.querySelector('#editor-btn[data-interaction]').getAttribute('data-interaction'));
    previousInteractionData.data.file = data.newName;
    document.querySelector('#editor-btn[data-interaction]').setAttribute('data-interaction', JSON.stringify(previousInteractionData));
    document.querySelector('#file.editor-data').value = data.newName;
    document.querySelector('#path.editor-data').value = '/sounds/';
  });
};

document.querySelector('#upload-icon').onclick = (e) => {
  upload('image/*', (data) => {
    reloadProfile();
    const previousInteractionData = JSON.parse(document.querySelector('#editor-btn[data-interaction]').getAttribute('data-interaction'));
    previousInteractionData.data.icon = '/us-icons/' + data.newName;
    document.querySelector('#editor-btn').style.backgroundImage = `url("${'/us-icons/' + data.newName}")`;
    loadData(previousInteractionData.data);
  }, 'icon');
};

const upload = (accept, callback, type = 'sound') => {
  // <iframe name="dummyFrame" id="dummyFrame" style="display: none;"></iframe>
  const dummyFrame = document.createElement('iframe');
  dummyFrame.style.display = 'none';
  dummyFrame.id = 'dummyFrame';
  dummyFrame.name = 'dummyFrame';
  const form = document.createElement('form');
  form.method = 'post';
  form.enctype = 'multipart/form-data';
  form.action = '/fd/api/upload/' + type;
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
    setTimeout(() => { // Form parse wait
      const content = dummyFrame.contentDocument;
      const data = JSON.parse(content.querySelector('pre').innerText);
      callback(data);
      form.remove();
      fileUpload.remove();
      setTimeout(() => { // Let data process
        dummyFrame.remove();
      }, 500);
    }, 250);
  };
  document.body.append(form);
  document.body.appendChild(dummyFrame);
};

document.querySelector('#editor-close').onclick = () => {
  universal.uiSounds.playSound('int_no');
  document.querySelector('#editor').style.opacity = '0';
  document.querySelector('#sidebar').style.right = '5px';
  document.querySelector('.toggle-sidebar button').style.display = 'block';
  if (document.querySelector('.toggle-sidebar').style.left == '0px') document.querySelector('.toggle-sidebar button').click();
  setTimeout(() => {
    document.querySelector('#editor').style.display = 'none';
    document.querySelector('#color').value = '#000000';
    document.querySelector('#color').dataset.has_set = 'false';
    document.querySelector('#editor-btn').style.backgroundColor = '';
  }, 500);
};

document.querySelector('#editor-save').onclick = () => {
  const name = document.querySelector('#name').value;
  const interaction = JSON.parse(document.querySelector('#editor-btn[data-interaction]').getAttribute('data-interaction'));
  document.querySelectorAll('.editor-data').forEach((input) => {
    interaction.data[input.id] = input.value;
  });
  universal.send(universal.events.companion.edit_key, JSON.stringify({
    name: name,
    oldName: document.querySelector('#editor-btn[data-interaction]').getAttribute('data-pre-edit'),
    interaction: interaction,
  }));

  document.querySelector('#editor').style.opacity = '0';
  setTimeout(() => {
    document.querySelector('#editor').style.display = 'none';
  }, 500);
};

/**
 * Create a text input modal.
 * @param {String} title The title of the modal
 * @param {String} content The placeholder text for the input
 * @param {void} callback What to do when submitted
 */
function showEditModal(title, content, callback) {
  const modal = document.createElement('div');
  modal.className = 'modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modalContent';

  const modalClose = document.createElement('button');
  modalClose.innerText = 'Close';
  modalClose.onclick = () => {
    modal.remove();
  };
  modalClose.style.position = 'absolute';
  modalClose.style.top = '0';
  modalClose.style.right = '0';
  modalClose.style.margin = '20px';
  modalContent.appendChild(modalClose);

  const modalTitle = document.createElement('h2');
  modalTitle.innerText = title;
  modalTitle.style.marginBottom = '20px';
  modalContent.appendChild(modalTitle);

  const modalFeedback = document.createElement('div');
  modalFeedback.className = 'modalFeedback';
  modalFeedback.style.color = 'red';
  modalFeedback.style.marginBottom = '20px';
  modalContent.appendChild(modalFeedback);

  const modalInput = document.createElement('input');
  modalInput.type = 'text';
  modalInput.placeholder = content;
  modalInput.style.marginBottom = '20px';
  modalContent.appendChild(modalInput);

  const modalButton = document.createElement('button');
  modalButton.innerText = 'Save';
  modalButton.onclick = () => {
    const returned = callback(modal, modalInput.value, modalFeedback, modalTitle, modalButton, modalInput, modalContent);
    if (returned === false) return;
    modal.remove();
  };
  modalContent.appendChild(modalButton);

  modal.appendChild(modalContent);

  document.body.appendChild(modal);
}

/**
 * Create a list picker modal.
 * @param {String} title The title of the modal
 * @param {Array} listContent The content of the list
 * @param {void} callback What to do when submitted
 */
function showPick(title, listContent, callback) {
  const modal = document.createElement('div');
  modal.className = 'modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modalContent';

  const modalClose = document.createElement('button');
  modalClose.innerText = 'Close';
  modalClose.onclick = () => {
    modal.remove();
  };
  modalClose.style.position = 'absolute';
  modalClose.style.top = '0';
  modalClose.style.right = '0';
  modalClose.style.margin = '20px';
  modalContent.appendChild(modalClose);

  const modalTitle = document.createElement('h2');
  modalTitle.innerText = title;
  modalTitle.style.marginBottom = '20px';
  modalContent.appendChild(modalTitle);

  const modalFeedback = document.createElement('div');
  modalFeedback.className = 'modalFeedback';
  modalFeedback.style.color = 'red';
  modalFeedback.style.marginBottom = '20px';
  modalContent.appendChild(modalFeedback);

  const modalList = document.createElement('select');
  modalList.className = 'modalList';
  modalList.style.marginBottom = '20px';
  modalContent.appendChild(modalList);

  listContent.forEach((item) => {
    const modalItem = document.createElement('option');
    modalItem.className = 'modalItem';
    modalItem.setAttribute('value', JSON.stringify(item));
    modalItem.innerText = item.name;
    modalList.appendChild(modalItem);
  });


  const modalButton = document.createElement('button');
  modalButton.innerText = 'Save';
  modalButton.onclick = () => {
    const selectedItem = modalList.options[modalList.selectedIndex];
    const returned = callback(modal, JSON.parse(selectedItem.getAttribute('value')), modalFeedback, modalTitle, modalButton, modalContent);
    if (returned === false) return;
    modal.remove();
  };
  modalContent.appendChild(modalButton);

  modal.appendChild(modalContent);

  document.body.appendChild(modal);
}

window.onclick = function(e) {
  if (e.srcElement.className != 'contextMenu') {
    if (document.querySelector('.contextMenu')) document.querySelector('.contextMenu').remove();
  }
};

/**
 * @name reloadProfile
 * @description Reload the current profile
 */
function reloadProfile() {
  universal.config.sounds = universal.config.profiles[universal.config.profile];
  for (let i = 0; i < (universal.config.sounds.length / universal.config.iconCountPerPage); i++) {
    Pages[i] = true;
  }
}
reloadProfile();

document.querySelector('#pg-left').addEventListener('click', () => {
  if (Pages[universal.page - 1]) {
    universal.page--;
    universal.save('page', universal.page);
    universal.uiSounds.playSound('page_down');
    reloadSounds();
  }
});

document.querySelector('#pg-right').addEventListener('click', () => {
  if (Pages[universal.page + 1]) {
    universal.page++;
    universal.save('page', universal.page);
    universal.uiSounds.playSound('page_up');
    reloadSounds();
  }
});

document.addEventListener('keydown', (ev) => {
  if (ev.key == 'ArrowLeft') {
    if (Pages[universal.page - 1]) {
      universal.page--;
      universal.save('page', universal.page);
      universal.uiSounds.playSound('page_down');
      reloadSounds();
    }
  }
  if (ev.key == 'ArrowRight') {
    if (Pages[universal.page + 1]) {
      universal.page++;
      universal.save('page', universal.page);
      universal.uiSounds.playSound('page_up');
      reloadSounds();
    }
  }
});

const profileTxt = document.createElement('h2');
profileTxt.innerHTML = 'Profile:&nbsp<i>' + universal.config.profile + '</i>';
// document.body.appendChild(profileTxt);

const profileSelect = document.createElement('select');
const profileAdd = document.querySelector('#pf-add');
profileAdd.innerText = 'New Profile';

Object.keys(universal.config.profiles).forEach((profile) => {
  const option = document.createElement('option');
  option.innerText = profile;
  option.setAttribute('value', profile);
  profileSelect.appendChild(option);
});

profileAdd.onclick = () => {
  showEditModal('New Profile', 'Enter a name for the new profile', (modal, value, feedback, title, button, input, content) => {
    if (value.length < 1) {
      feedback.innerText = 'Please enter a name for the profile';
      return false;
    }
    universal.page = 0;
    universal.save('page', universal.page);
    universal.send(universal.events.companion.add_profile, value);
    return true;
  });
};

profileSelect.value = universal.config.profile;

profileSelect.onchange = () => {
  universal.send(universal.events.companion.set_profile, profileSelect.value);
};

document.querySelector('#es-profiles').appendChild(profileSelect);

const profileDupe = document.querySelector('#pf-dupe');
profileDupe.innerText = 'Duplicate Profile';

profileDupe.onclick = () => {
  showEditModal('Duplicate Profile', 'Enter a name for the new profile', (modal, value, feedback, title, button, input, content) => {
    if (value.length < 1) {
      feedback.innerText = 'Please enter a name for the profile';
      return false;
    }
    universal.send(universal.events.companion.dup_profile, value);
    return true;
  });
};

universal.on(universal.events.user_mobile_conn, (isConn) => {
  if (isConn) document.querySelector('.mobd').style.display = 'none';
  else document.querySelector('.mobd').style.display = 'flex';
});

if (universal._information.mobileConnected) document.querySelector('.mobd').style.display = 'none';

if (universal.load('pitch')) document.querySelector('#pitch').value = universal.load('pitch');

if (universal.load('has_setup') == 'false') {
  window.location.href = '/companion/settings.html?err=ns0f';
}

// get url params
const urlParams = new URLSearchParams(window.location.search);
const err = urlParams.get('err');
if (err) {
  switch (err) {
    case 'last-step':
      universal.sendToast('Initiating connection help wizard');
      universal.connHelpWizard();
      break;
  }
}

/**
 * @name getAudioOutputDevices
 * @description Get the audio output devices.
 * @param {Boolean} isCable If we're looking for VB-Cable instances or Monitor
 * @return {Object[]}
 */
async function getAudioOutputDevices(isCable=false) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const audioOutputs = devices
      .filter((device) => device.kind === 'audiooutput' && (isCable ? device.label.includes('VB-Audio') : !device.label.includes('VB-Audio')))
      .map((device) => ({name: device.label || 'Unknown Audio Output', value: device.deviceId}));
  return audioOutputs;
}


const embeddedSettingsAudio = document.querySelector('#es-audio');
const embeddedSettingsClient = document.querySelector('#es-client');

getAudioOutputDevices().then(async (audioOutputs) => {
  const select = await universal.embedded_settings.createSelect(
      'Monitor',
      'es-monitor',
      audioOutputs.map((device) => (device.value)),
      audioOutputs.map((device) => (device.name)),
      universal.load('monitor.sink'),
      (ev) => {
        universal.save('monitor.sink', ev.target.value);
        console.log('Pitch set to ' + ev.target.value);
      },
  );
  embeddedSettingsAudio.appendChild(select);
});

getAudioOutputDevices(true).then(async (audioOutputs) => {
  const select = await universal.embedded_settings.createSelect(
      'VB-Cable',
      'es-cable',
      audioOutputs.map((device) => (device.value)),
      audioOutputs.map((device) => (device.name)),
      universal.load('vb.sink'),
      (ev) => {
        universal.save('vb.sink', ev.target.value);
        console.log('Cable set to ' + ev.target.value);
      },
  );
  embeddedSettingsAudio.appendChild(select);
});

const playbackModes = [
  {label: 'Stop Previous', value: 'stop_prev'},
  {label: 'Play Over', value: 'play_over'},
];

const playbackModeSetting = await universal.embedded_settings.createSelect(
    'Playback Mode',
    'es-playback',
    playbackModes.map((mode) => mode.value),
    playbackModes.map((mode) => mode.label),
    universal.load('playback-mode'),
    (ev) => {
      universal.save('playback-mode', ev.target.value);
      console.log('Playback mode set to ' + ev.target.value);
    },
);

embeddedSettingsClient.appendChild(playbackModeSetting);
