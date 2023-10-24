const fs = require('fs');
const path = require('path');

const pl = {
    _plc: new Map(),
    _tyc: new Map(),
    plugins: () => {
        if (pl._plc.length > 0) pl.update();
        return pl._plc;
    },
    update: () => {
        fs.readdirSync(path.resolve('./plugins')).forEach((file) => {
            const plugin = require(path.resolve(`./plugins/${file}`));
            const instantiated = new plugin();
            pl._plc.set(instantiated.id, {instance: instantiated, plugin});
            console.log('New plugin ' + instantiated.name + ' - ID ' + instantiated.id);
        })
    },
    types: () => {
        return pl._tyc;
    }
};

module.exports = pl;