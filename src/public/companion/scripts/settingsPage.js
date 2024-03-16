import {universal} from '../../scripts/universal.js';
import './global.js';
import './authfulPage.js';


await universal.init('Companion:Settings');

createSettingCategory('Audio Client $(NEW!)', 'audioclient');

createSettingCategory('Freedeck Client', 'fdc', true);

createSettingCategory('Danger Zone $(DANGEROUS)', 'dz');

createSelectSetting('Default Profile', 'default-profile', async (select) => {
  return new Promise(async (resolve) => {
    Object.keys(universal.config.profiles).forEach((data) => {
      const tmpBtn = document.createElement('option');
      tmpBtn.innerText = data;
      tmpBtn.value = data;
      tmpBtn.id = data;
      select.appendChild(tmpBtn);
    });
    resolve();
  });
}, universal.config.profile, '.fdc', (value) => {
  if (value != universal.config.profile) universal.send(universal.events.companion.set_profile, value);
});

createSelectSetting('Playback Mode', 'stopPrevious', async (select) => {
  return new Promise(async (resolve) => {
    const options = [
      {label: 'Stop Previous', value: 'true'},
      {label: 'Play Over', value: 'false'},
    ];
    options.forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.innerText = option.label;
      optionElement.value = option.value;
      select.appendChild(optionElement);
    });
    resolve();
  });
}, universal.load('stopPrevious'), '.fdc', (value) => {
  universal.save('stopPrevious', value);
});

createSelectSetting('Monitor Device', 'monitor.sink', async (select) => {
  return new Promise(async (resolve) => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    devices.forEach((device) => {
      if (device.kind == 'audiooutput') {
        const tmpBtn = document.createElement('option');
        tmpBtn.innerText = device.label;
        tmpBtn.value = device.deviceId;
        tmpBtn.id = device.deviceId;
        select.appendChild(tmpBtn);
      }
    });
    resolve();
  });
}, universal.audioClient._player.monitorSink, '.audioclient');


createSelectSetting('VB Cable', 'vb.sink', async (select) => {
  return new Promise(async (resolve) => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    devices.forEach((device) => {
      if (device.kind == 'audiooutput') {
        const tmpBtn = document.createElement('option');
        tmpBtn.innerText = device.label;
        tmpBtn.value = device.deviceId;
        tmpBtn.id = device.deviceId;
        select.appendChild(tmpBtn);
      }
    });
    resolve();
  });
}, universal.audioClient._player.sink, '.audioclient');

createSelectSetting('Erase all data', 'erase', async (select) => {
  return new Promise(async (resolve) => {
    const tmpBtn = document.createElement('option');
    tmpBtn.innerText = 'Erase all data';
    tmpBtn.value = 'true';
    tmpBtn.id = 'true';
    select.appendChild(tmpBtn);
    resolve();
  });
}, 'false', '.dz', (value) => {
  if (value == 'true') {
    createBooleanSetting('Are you sure?', 'sure', async () => {
      return new Promise(async (res) => {
        res();
      });
    }, false, '.dz', (value) => {
      if (value == true) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          localStorage.removeItem(key);
        }
        window.location.href = '/companion/';
      }
    });
  }
});

/**
 * Create a setting dynamically.
 * @param {*} name The name of the setting.
 * @param {*} id The ID of the setting.
 * @param {*} value The option setter.
 * @param {*} onLoad The default value.
 * @param {*} goto The CSS selector to append to.
 * @param {*} onChanged The function to call when the setting changes.
 */
function createBooleanSetting(name, id, value, onLoad, goto, onChanged=()=>{}) {
  const div = document.createElement('div');
  div.className = 'flex-wrap-r';
  const p = document.createElement('p');
  p.innerText = name;
  const input = document.createElement('input');
  input.id = id;
  input.type = 'checkbox';
  div.appendChild(p);
  div.appendChild(input);

  value(input).then(() => {
    input.checked = onLoad;
  });

  input.onchange = () => {
    console.log('Saving ' + id + ' as ' + input.checked);
    universal.save(id, input.checked);
    universal.sendToast('Saved changes!');
    onChanged(input.checked);
  };

  document.querySelector(goto).appendChild(div);
};

/**
 * Create a setting dynamically.
 * @param {String} name The name of the setting.
 * @param {String} id The ID of the setting.
 * @param {Function} value The option setter.
 * @param {*} onLoad Default.
 * @param {String} goto The CSS selector to append to.
 * @param {Function} onChanged The function to call when the setting changes.
 */
function createSelectSetting(name, id, value, onLoad, goto, onChanged=()=>{}) {
  const div = document.createElement('div');
  div.className = 'flex-wrap-r';
  const p = document.createElement('p');
  p.innerText = name;
  const select = document.createElement('select');
  select.id = id;
  div.appendChild(p);
  div.appendChild(select);

  value(select).then(() => {
    select.value = onLoad;
  });

  select.onchange = () => {
    console.log('Saving ' + id + ' as ' + select.value);
    universal.save(id, select.value);
    universal.sendToast('Saved changes!');
    onChanged(select.value);
  };

  document.querySelector(goto).appendChild(div);
}

/**
 * Create a setting category.
 * @param {String} name The name of the category.
 * @param {String} goto The class (goto for other functions) to append to.
 * @param {Boolean} appendToIAS Append setting to in app settings
*/
function createSettingCategory(name, goto, appendToIAS=false) {
  const appendTo = window.title == 'Freedeck v6 - Settings' && !appendToIAS ? document.body : document.querySelector('.settings');
  const div = document.createElement('div');
  div.className = goto;
  appendTo.appendChild(div);
  const h2 = document.createElement('h2');
  h2.innerText = name;
  if (name.split('$(').length > 1) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerText = name.split('$(')[1].split(')')[0];
    h2.appendChild(tag);
    name = name.split('$(')[0];
    h2.innerText = name;
  }
  div.appendChild(h2);
  appendTo.appendChild(div);
};

/**
 * Create a setting dynamically.
 * @param {*} name The name of the setting.
 * @param {*} id The ID of the setting.
 * @param {*} value The option setter.
 * @param {*} onLoad The default value.
 * @param {*} goto The CSS selector to append to.
 * @param {*} onChanged The function to call when the setting changes.
 */
function createInputSetting(name, id, value, onLoad, goto, onChanged=()=>{}) {
  const div = document.createElement('div');
  div.className = 'flex-wrap-r';
  const p = document.createElement('p');
  p.innerText = name;
  const input = document.createElement('input');
  input.id = id;
  div.appendChild(p);
  div.appendChild(input);

  value(input).then(() => {
    input.value = onLoad;
  });

  input.onchange = () => {
    console.log('Saving ' + id + ' as ' + input.value);
    universal.save(id, input.value);
    universal.sendToast('Saved changes!');
    onChanged(input.value);
  };

  document.querySelector(goto).appendChild(div);
}

const setupWizard = () => {
  const sinks = {};
  const sources = {};
  navigator.mediaDevices.getUserMedia({audio: true}).then(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      devices.forEach((device) => {
        if (device.kind == 'audiooutput') {
          if (!device.label.includes('Input')) sinks[device.deviceId] = device.label;
          if (device.label.includes('Input')) sources[device.deviceId] = device.label;
        }
      });
      showText('Setup Wizard', 'Welcome to the Freedeck setup wizard! This will help you set up Freedeck for the first time.', () => {
        showPick('Select a monitor device (where you will hear the sounds)', Object.keys(sinks).map((data) => {
          return {
            sink: data,
            name: sinks[data],
          };
        }), (modal, data, feedback, title, button, content) => {
          console.log('User selected ' + data.name);
          universal.save('monitor.sink', data.sink);
          showPick('Select your VB-Cable device (where you will play the sounds through)', Object.keys(sources).map((data) => {
            return {
              sink: data,
              name: sources[data],
            };
          }), (modal, data, feedback, title, button, content) => {
            console.log('User selected ' + data.name);
            universal.save('vb.sink', data.sink);
            universal.save('pitch', 1);
            universal.save('vol', 1);
            showText('All done!', 'You\'re all set up! You can now use Freedeck.', () => {
              universal.sendToast('All done, reloading...');
              window.location.href = '/companion/';
            });
          });
        });
      });
    });
  });
};

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

/**
 * Show text in a simple modal.
 * @param {String} title The title of the modal
 * @param {String} txt The text to show on the modal
 * @param {void} cb The callback to call when the modal is closed
 */
function showText(title, txt, cb) {
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

  const modalTitle = document.createElement('h2');
  modalTitle.innerText = title;
  modalTitle.style.marginBottom = '20px';
  modalContent.appendChild(modalTitle);

  const modalFeedback = document.createElement('div');
  modalFeedback.className = 'modalFeedback';
  modalFeedback.style.color = 'red';
  modalFeedback.style.marginBottom = '20px';
  modalContent.appendChild(modalFeedback);

  const modalTxt = document.createElement('p');
  modalTxt.innerText = txt;
  modalTxt.style.marginBottom = '20px';
  modalContent.appendChild(modalTxt);

  const modalButton = document.createElement('button');
  modalButton.innerText = 'OK';
  modalButton.onclick = () => {
    cb();
    modal.remove();
  };
  modalContent.appendChild(modalButton);

  modal.appendChild(modalContent);

  document.body.appendChild(modal);
}

const settingsHelpers = {
  createBooleanSetting,
  createSelectSetting,
  createSettingCategory,
  createInputSetting,
};

export {settingsHelpers};
window.settingsHelpers = settingsHelpers;
window.createSelectSetting = createSelectSetting;
window.createInputSetting = createInputSetting;
window.createSettingCategory = createSettingCategory;

// get url params
const urlParams = new URLSearchParams(window.location.search);
const err = urlParams.get('err');
if (err) {
  switch (err) {
    case 'ns0f':
      universal.sendToast('Initiating setup wizard...');
      setupWizard();
      break;
  }
}
