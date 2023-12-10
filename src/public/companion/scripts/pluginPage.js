import { universal } from '../../scripts/universal.js';

await universal.init('Companion:PluginViewer');

let seen = {};

universal._tyc.forEach((data) => {
    let req = JSON.parse(data)
	let li = document.createElement("li");
    li.setAttribute('hovereffect', 'yes');
    li.style.cursor = 'default';
    if (seen[req.response.instance.name]) return;
    seen[req.response.instance.name] = true;
	li.innerText = req.response.instance.name  + ' - ' + req.requested + ' by ' + req.response.instance.author;
	document.querySelector('.btnlist').appendChild(li)
    let types = req.response.instance.types;
    types.forEach((dataObj) => {
        let tmpBtn = document.createElement("button");
        tmpBtn.innerText = dataObj.name+": " + dataObj.type
        tmpBtn.onclick = (ev) => {
            universal.send(universal.events.keypress, JSON.stringify({event: ev, btn: {uuid: 0, name: dataObj.name, type: dataObj.type}}))
        };
        document.querySelector('.btns').appendChild(tmpBtn)
    })
})