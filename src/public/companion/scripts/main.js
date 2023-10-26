import { universal } from '../../scripts/universal.js';

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