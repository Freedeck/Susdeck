import { universal } from '../../scripts/universal.js';
import './Sortable.min.js';

await universal.init('Companion');

universal.plugins.forEach(plugin => {
    universal.send(universal.events.plugin_info, plugin)
})

universal.on(universal.events.plugin_info, (data) => {
    let req = JSON.parse(data)
    let types = req.response.instance.types;
    types.forEach((dataObj) => {
        let tmpBtn = document.createElement("button");
        tmpBtn.innerText = dataObj.name+": " + dataObj.type
        tmpBtn.onclick = (ev) => {
            universal.send(universal.events.keypress, JSON.stringify({event: ev, btn: {uuid: 0, name: dataObj.name, type: dataObj.type}}))
        };
        document.body.appendChild(tmpBtn)
    })
})

new Sortable(document.querySelector('#keys'), {
    onUpdate: (d) => {
        universal.send(universal.events.companion.move_key, JSON.stringify({name: d.item.innerText, item: d.item.getAttribute('data-interaction'), newIndex: d.newDraggableIndex, oldIndex: d.oldDraggableIndex}))
    },
    filter: '.unset',
    preventOnFilter: true
});

for (let i = 0; i < universal.config.iconCountPerPage - 3; i++){
    let tempDiv = document.createElement("div");
    tempDiv.className = 'button k-' + i + ' unset';
    universal.keys.appendChild(tempDiv);
}

universal.config.sounds.forEach(sound => {
    const k = Object.keys(sound)[0];
    const snd = sound[k];
    const keyObject = document.querySelector('.k-' + snd.pos);
    if (!keyObject) {
    // TODO: Range check, try maybe using ([universal.iconCountPerPage * universal.page] ref as pagecount)
    // if a page is 8 long, we should have the range 0 - 8, and subtract pagecount from icidx
    // maybe use pagecount - pagecount + 1 > iconIndex > pagecount
    // Example pagecount = 8
    //           1 >= 16 >= 8 - false, not in range
    //           1 >= 8 >= 8 - true, in rnage? signs probably wrong
    if (universal.page === 0) return; // I mean it wouldn't be on this page lol 
      const pagecount = universal.config.iconCountPerPage * (universal.page + 1); // lets say 12
      const newIconIdx = Math.abs(pagecount - snd.pos) // 12 - 13 is -1, abs is 1
    if (pagecount - pagecount + 1 <= newIconIdx && newIconIdx >= pagecount) {
      console.log('asdf')
    }
      console.log('Sound ' + k + ', pos ' + snd.pos + ' is not on this page')
      return;
    }
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
    tempDiv.className = 'button unset';
    tempDiv.innerText = key.name;
    tempDiv.onclick = key.onclick;
    universal.keys.appendChild(tempDiv);
});
