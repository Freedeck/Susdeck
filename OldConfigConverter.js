/**
 * Hey there! 
 * This is a script that will convert your old config to the new one.
 */

const FILE = "my.old.config.js";
const fs = require('fs');
const path = require('path');
const _f = path.resolve(__dirname, FILE);

const config = require(_f);

const newsounds = [];

config.Sounds.forEach(soundData => {
	const sound = {
		"uuid": soundData.uuid,
			"type": "fd.sound",
			"data": {
				"file": soundData.path,
				"path": "/sounds/"
			},
			"pos": soundData.pos
	};
	newsounds.push(JSON.parse(`{"${soundData.name}": ${JSON.stringify(sound)}}`));
})

const newCFG = {
	profiles: {defaultProfile:newsounds},
	screenSaverActivationTime: config.ScreenSaverActivationTime,
	soundOnPress: false,
	useAuthentication: true,
	iconCountPerPage: 11,
	port: 5754
}

fs.writeFileSync(path.resolve(__dirname, 'Newconfig.fd.js'), `const cfg = ${JSON.stringify(newCFG)}; if(typeof window !== 'undefined') window['cfg'] = cfg; if('exports' in module) module.exports = cfg;`, 'utf8')