import { universal } from './universal.js';

await universal.init('Main');

for (let i = 0; i < universal.config.iconCountPerPage - 3; i++){
    let tempDiv = document.createElement("div");
    tempDiv.className = 'button k-' + i + ' unset';
    universal.keys.appendChild(tempDiv);
}

universal.config.sounds.forEach(sound => {
    const k = Object.keys(sound)[0];
    const snd = sound[k];
    const keyObject = document.querySelector('.k-' + snd.pos);
    keyObject.setAttribute('data-interaction', JSON.stringify(snd));
    keyObject.innerText = k;
    keyObject.className = keyObject.className.replace('unset','');
    keyObject.onclick = (ev) => {
        universal.send(universal.events.keypress, JSON.stringify({event: ev, btn: snd}))
    };
})

const builtInKeys = [
    {
        name: 'Stop All',
        onclick: (ev) => {
            universal.send(universal.events.keypress, JSON.stringify({builtIn: true, data:'stop-all'}))
        }
    },
    {
        name: 'Reload',
        onclick: (ev) => {
            window.location.replace(window.location.href)
        }
    },
    {
        name: 'Settings',
        onclick: (ev) => {
            console.log('To be implemented...')
        }
    }
];

builtInKeys.forEach(key => {
    let tempDiv = document.createElement("div");
    tempDiv.className = 'button';
    tempDiv.innerText = key.name;
    tempDiv.onclick = key.onclick;
    universal.keys.appendChild(tempDiv);
});