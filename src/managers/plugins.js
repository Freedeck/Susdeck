const fs = require('fs');
const path = require('path');
const debug = require(path.resolve('./src/utils/debug.js'));
const picocolors = require(path.resolve('./src/utils/picocolors.js'));

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
            if (instantiated.disabled) return;
            debug.log(picocolors.yellow('Plugin initialized ' + instantiated.name + ' - ID ' + instantiated.id), 'Plugin Manager');
            pl._plc.set(instantiated.id, {instance: instantiated, plugin});
        })
    },
    types: () => {
        return pl._tyc;
    }
};

module.exports = pl;