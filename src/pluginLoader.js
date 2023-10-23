const fs = require('fs');
const path = require('path');

const pl = {
    _plc: new Map(),
    plugins: () => {
        if (pl._plc.length > 0) pl.updPlug();
        return pl._plc;
    },
    updPlug: () => {
        fs.readdirSync(path.resolve('./plugins')).forEach((file) => {
            const plugin = require(path.resolve(`./plugins/${file}`));
            const instantiated = new plugin();
            pl._plc.set(instantiated.id, {instance: instantiated, plugin});
            console.log('New plugin ' + instantiated.name + ' - ID ' + instantiated.id);
        })
    },
    types: () => {
        return new Map();
    }
};

module.exports = pl;