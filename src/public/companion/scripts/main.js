import { universal } from '../../scripts/universal.js';

await universal.init('Companion');

universal.plugins.forEach(plugin => {
    universal.send(universal.events.plugin_info, plugin)
})

universal.on(universal.events.plugin_info, (data) => {
    let req = JSON.parse(data)
    universal.plugins.forEach(plugin => {
        let types = req.response.instance.types;
        let names = "";
        types.forEach(jsonobj => {
            let tmpBtn = document.createElement("button");
            tmpBtn.innerText = jsonobj.name+": " + jsonobj.type
            tmpBtn.onclick = (ev) => {
                universal.send(universal.events.keypress, JSON.stringify({event: ev, btn: {uuid: 0, name: 'asdf', type: jsonobj.type}}))
            };
        document.body.appendChild(tmpBtn)
        })
        // document.querySelector('h1').innerHTML += '<h2>' + req.requested + '</h2><h2> ' + names + '</h2>';
    })
})