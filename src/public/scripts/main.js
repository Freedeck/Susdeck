import { universal } from './universal.js';

await universal.init('Main');

for (let i = 0; i < universal.config.iconCountPerPage; i++) {
    const btn = document.createElement('button');
    btn.className = 'unset-' + i;
    universal.keys.appendChild(btn);
}
universal.config.sounds.forEach((soundT) => {
    const key = Object.keys(soundT)[0];
    let sound = soundT[key];
    const btn = document.querySelector('.unset-' + sound.pos.index);
    btn.className = key + ' keypress';
    btn.setAttribute('data-interaction', JSON.stringify({sound, name: key}));
    btn.setAttribute('data-page', universal.page.toString());
    btn.setAttribute('data-index', sound.pos.index.toString());
    btn.innerText = key;

    btn.addEventListener('click', (ev) => {
        universal.send(universal.events.keypress, JSON.stringify({event: ev, btn: JSON.parse(btn.getAttribute('data-interaction'))}));
    })
});