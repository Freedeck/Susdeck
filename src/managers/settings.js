const fs = require("node:fs");
const path = require("node:path");

const debug = require(path.resolve("./src/utils/debug.js"));

const sc = {
	_cache: {},
	settings: () => {
		debug.log("Settings accessed.", "Settings Cache");
		if (Object.keys(sc._cache).length === 0) {
			sc.update();
			debug.log("Settings updated.", "Settings Cache");
		}
		return sc._cache;
	},
	styleSettings: {
		scroll: false,
		fill: false,
		center: false,
		animation: false,
		compact: true,
		"font-size": "15",
		buttonSize: "6",
		iconCountPerPage: "12",
		longPressTime: "3",
		tileCols: "5",
	},
	checkStyle: () => {
		if (!fs.existsSync(path.resolve("./src/configs/style.json"))) {
			const def = JSON.stringify(sc.styleSettings);
			fs.writeFileSync(path.resolve("./src/configs/style.json"), def);
		} else {
			const data = JSON.parse(fs.readFileSync(path.resolve("./src/configs/style.json")));
			for (const key in sc.styleSettings) {
				if (!data[key] || typeof data[key] !== typeof sc.styleSettings[key]) {
					data[key] = sc.styleSettings[key];
					debug.log(`Added ${key} to style.json`, "Style / Migration");
				}
			}
			fs.writeFileSync(path.resolve("./src/configs/style.json"), JSON.stringify(data));
			debug.log("Completed preflight.", "Style / Migration");
		}
	},
	update: () => {
		sc.checkStyle();
		delete require.cache[
			require.resolve(path.resolve("./src/configs/config.fd.js"))
		];
		sc._cache = require(path.resolve("./src/configs/config.fd.js"));
		debug.log("Settings recached.", "Settings Cache");
	},
	save: () => {
		const set = sc.settings();
		const cfgStr = `const cfg = {writeLogs:${sc._cache.writeLogs},release:"${sc._cache.release ? sc._cache.release : "stable"}",profiles:${JSON.stringify(sc._cache.profiles)},theme:"${sc._cache.theme ? sc._cache.theme : "default"}",profile:"${sc._cache.profile}",screenSaverActivationTime:${set.screenSaverActivationTime},soundOnPress:${set.soundOnPress},useAuthentication:${set.useAuthentication},iconCountPerPage:${set.iconCountPerPage},port:${set.port}}; if(typeof window !== 'undefined') window['cfg'] = cfg; if('exports' in module) module.exports = cfg;`;
		debug.log("Settings saved.", "Settings Cache");
		return fs.writeFileSync(path.resolve("./src/configs/config.fd.js"), cfgStr);
	},
};

module.exports = sc;
