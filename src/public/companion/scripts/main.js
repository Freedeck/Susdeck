import {universal} from '../../scripts/universal.js';
import './Sortable.min.js';
const Pages = {};

await universal.init('Companion');

new Sortable(document.querySelector('#keys'), {
  onUpdate: (d) => {
    if (universal.page == 0) {
      universal.page = 1;
    } else {
      d.newDraggableIndex = d.newDraggableIndex + (universal.page * universal.config.iconCountPerPage);
      d.oldDraggableIndex = d.oldDraggableIndex + (universal.page * universal.config.iconCountPerPage);
    }

    universal.send(universal.events.companion.move_key,
        JSON.stringify({
          name: d.item.innerText,
          item: d.item.getAttribute('data-interaction'),
          newIndex: d.newDraggableIndex,
          oldIndex: d.oldDraggableIndex*universal.page}));
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
  reloadProfile();
  document.querySelectorAll('#keys > .button').forEach((key) => {
    key.remove();
  });
  universal.keySet();
  universal.config.sounds.forEach((sound) => {
    const k = Object.keys(sound)[0];
    const snd = sound[k];
    let keyObject = document.querySelector('.k-' + snd.pos);

    if (snd.pos < ((universal.config.iconCountPerPage) * universal.page)) return;
    if (!keyObject) {
      if (universal.page == 0) return;
      const newPos = Math.abs(snd.pos - (universal.config.iconCountPerPage * universal.page)) - 1;
      snd.pos = newPos;
      keyObject = document.querySelector('.k-' + snd.pos);
    };
    try {
      keyObject.setAttribute('data-interaction', JSON.stringify(snd));
      keyObject.innerText = k;
      keyObject.className = keyObject.className.replace('unset', '');
      keyObject.onclick = (ev) => {
        universal.send(universal.events.keypress, JSON.stringify({event: ev, btn: snd}));
      };
    } catch (e) {
    }
  });
}
reloadSounds();

window['button-types'] = [
  {name: 'Sound', type: 'sound'},
  {name: 'Macro', type: 'macro'},
  {name: 'Plugin', type: 'plugin'},
];

window.oncontextmenu = function(e) {
  // console.log(e.srcElement)
  if (document.querySelector('.contextMenu')) document.querySelector('.contextMenu').remove();
  if (!e.srcElement.className.includes('button')) return false;
  if (e.srcElement.className.includes('builtin')) return false;
  const custMenu = document.createElement('div');
  custMenu.className = 'contextMenu';
  custMenu.style.top = e.clientY + 'px';
  custMenu.style.left = e.clientX + 'px';
  custMenu.style.position = 'absolute';

  const custMenuTitle = document.createElement('div');
  custMenuTitle.innerText = 'Editing ' + (e.srcElement.innerText != '' ? e.srcElement.innerText : 'nothing!');
  custMenuTitle.style.fontWeight = 'bold';
  custMenuTitle.style.marginBottom = '5px';
  custMenu.appendChild(custMenuTitle);

  let custMenuItems = [
    'New Key',
  ];
  if (e.srcElement.innerText != '') {
    custMenuItems = ['Open Studio'].concat(custMenuItems);
    custMenuItems.push('Remove Key');
  } else {
    custMenuItems = ['Copy Key Here'].concat(custMenuItems);
  }

  custMenuItems.forEach((item) => {
    const menuItem = document.createElement('div');
    menuItem.innerText = item;
    menuItem.className = 'menuItem';
    menuItem.onclick = () => {
      // Handle menu item click
      switch (item) {
        case 'Open Studio':
          // show a modal with the editor
          document.querySelector('.contextMenu').style.display = 'none';
          document.querySelector('#editor').style.display = 'block';
          document.querySelector('#editor-btn').innerText = e.srcElement.innerText;
          document.querySelector('#name').value = e.srcElement.innerText;
          document.querySelector('#editor-btn').setAttribute('data-pre-edit', e.srcElement.innerText);
          document.querySelector('#editor-btn').setAttribute('data-interaction', e.srcElement.getAttribute('data-interaction'));
          document.querySelector('#type').value = JSON.parse(e.srcElement.getAttribute('data-interaction')).type;
          document.querySelector('#plugin').value = JSON.parse(e.srcElement.getAttribute('data-interaction')).plugin || 'Freedeck';
          if (JSON.parse(e.srcElement.getAttribute('data-interaction')).type == 'fd.sound') {
            document.querySelector('#sound-file').value = JSON.parse(e.srcElement.getAttribute('data-interaction')).data.file || 'Unset.mp3';
            document.querySelector('#sound-file').style.display = 'block';
            document.querySelector('#upload-sound').style.display = 'flex';
          }
          // make it fade in
          document.querySelector('#editor').style.opacity = '0';
          setTimeout(() => {
            document.querySelector('#editor').style.opacity = '1';
          }, 100);
          break;
        case 'New Key':
          showPick('New Key', window['button-types'], (modal, value, feedback, title, button, content) => {
            let pos = parseInt(e.srcElement.className.split(' ')[1].split('-')[1]);
            if (universal.page > 0) {
              pos += universal.config.iconCountPerPage;
              if (universal.page > 0) pos *= universal.page;
            }
            if (value.type == 'sound') createSound(pos);
            if (value.type == 'plugin') createPlugin(pos);
          });
          break;
        case 'Remove Key':
          reloadProfile();
          universal.send(universal.events.companion.del_key, JSON.stringify({name: e.srcElement.innerText, item: e.srcElement.getAttribute('data-interaction')}));
          break;
        case 'Copy Key Here':
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
    // we need to clone value, and change the pos, and uuid, then make a new key.
    universal.send(universal.events.companion.new_key, JSON.stringify({
      [value.name]: {
        type: valueToo.type,
        plugin: valueToo.plugin || 'Freedeck',
        pos: parseInt(srcElement.className.split(' ')[1].split('-')[1]),
        uuid: 'fdc.'+Math.random() * 10000000,
        data: valueToo.data,
      },
    }));
    return true;
  });
}

/**
 * @name createSound
 * @param {Number} pos The position of the new sound key.
 * @description Create a new sound key.
 */
function createSound(pos) {
  showEditModal('New Sound Key', 'Enter a name for the new key', (modal, value, feedback, title, button, input, content) => {
    if (value.length < 1) {
      feedback.innerText = 'Please enter a name for the key';
      return false;
    }
    reloadProfile();
    universal.send(universal.events.companion.new_key, JSON.stringify({
      [value]: {
        type: 'fd.sound',
        pos,
        uuid: 'fdc.'+Math.random() * 10000000,
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
  showPick('New Plugin Key', universal._tyc.keys(), (modala, valuea, feedbacka, titlea, buttona, contenta) => {
    showEditModal('New Plugin Key', 'Enter a name for the new key', (modal, value, feedback, title, button, input, content) => {
      if (value.length < 1) {
        feedback.innerText = 'Please enter a name for the key';
        return false;
      }
      reloadProfile();
      universal.send(universal.events.companion.new_key, JSON.stringify({
        [value]: {
          type: valuea.type,
          pos,
          uuid: 'fdc.'+Math.random() * 10000000,
          plugin: valuea.name,
          data: { },
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
    document.querySelector('#sound-file').value = data.newName;
  });
};

const upload = (accept, callback) => {
  // <iframe name="dummyFrame" id="dummyFrame" style="display: none;"></iframe>
  const dummyFrame = document.createElement('iframe');
  dummyFrame.style.display = 'none';
  dummyFrame.id = 'dummyFrame';
  dummyFrame.name = 'dummyFrame';
  const form = document.createElement('form');
  form.method = 'post';
  form.enctype = 'multipart/form-data';
  form.action = '/fd/api/upload/';
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
  document.querySelector('#editor').style.opacity = '0';
  setTimeout(() => {
    document.querySelector('#sound-file').style.display = 'none';
    document.querySelector('#editor').style.display = 'none';
    document.querySelector('#upload-sound').style.display = 'none';
  }, 500);
};

document.querySelector('#editor-save').onclick = () => {
  const name = document.querySelector('#name').value;
  const interaction = JSON.parse(document.querySelector('#editor-btn[data-interaction]').getAttribute('data-interaction'));

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
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,.75)';
  modal.style.zIndex = '9999';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';

  const modalContent = document.createElement('div');
  modalContent.className = 'modalContent';
  modalContent.style.background = '#fff';
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '5px';
  modalContent.style.width = '50vw';
  modalContent.style.height = '50vh';
  modalContent.style.display = 'flex';
  modalContent.style.flexDirection = 'column';
  modalContent.style.alignItems = 'center';

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
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100vw';
  modal.style.height = '100vh';
  modal.style.background = 'rgba(0,0,0,.75)';
  modal.style.zIndex = '9999';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';

  const modalContent = document.createElement('div');
  modalContent.className = 'modalContent';
  modalContent.style.background = '#fff';
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '5px';
  modalContent.style.width = '50vw';
  modalContent.style.height = '50vh';
  modalContent.style.display = 'flex';
  modalContent.style.flexDirection = 'column';
  modalContent.style.alignItems = 'center';

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

document.addEventListener('keydown', (ev) => {
  if (ev.key == 'ArrowLeft') {
    if (Pages[universal.page - 1]) {
      universal.page --;
      reloadSounds();
    }
  }
  if (ev.key == 'ArrowRight') {
    if (Pages[universal.page + 1]) {
      universal.page ++;
      reloadSounds();
    }
  }
});

const profileTxt = document.createElement('h2');
profileTxt.innerHTML = 'Profile:&nbsp<i>'+universal.config.profile+'</i>';
document.body.appendChild(profileTxt);

const profileSelect = document.createElement('select');
const profileAdd = document.createElement('button');
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
    universal.send(universal.events.companion.add_profile, value);
    return true;
  });
};

profileSelect.value = universal.config.profile;

profileSelect.onchange = () => {
  universal.send(universal.events.companion.set_profile, profileSelect.value);
};

const flexWrapped = document.createElement('div');
flexWrapped.className = 'flex-wrap-r';
flexWrapped.style.marginBottom = '20px';
flexWrapped.appendChild(profileSelect);
flexWrapped.appendChild(profileAdd);
document.body.appendChild(profileTxt);
document.body.appendChild(flexWrapped);

if (universal.load('pitch')) document.querySelector('#pitch').value = universal.load('pitch');
