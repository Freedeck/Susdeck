import {
  universal,
} from '../../scripts/universal.js';

await universal.init('Companion:Settings');

createSettingCategory('Audio Client $(NEW!)', 'audioclient');

createSettingCategory('Freedeck Client', 'fdc');

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
 */
function createSettingCategory(name, goto) {
  const div = document.createElement('div');
  div.className = goto;
  document.body.appendChild(div);
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
  document.body.appendChild(div);
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

window.createSelectSetting = createSelectSetting;
window.createInputSetting = createInputSetting;
window.createSettingCategory = createSettingCategory;
