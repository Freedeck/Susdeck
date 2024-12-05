const fs = require("node:fs");
const path = require("node:path");
const debug = require(path.resolve("./src/utils/debug.js"));
const picocolors = require(path.resolve("./src/utils/picocolors.js"));
const packageHandler = require(path.resolve("./src/managers/packageHandler.js"));

const pl = {
	_plc: new Map(),
	_disabled: [],
	_tyc: new Map(),
	_ch: new Map(),
	_settings: new Map(),
	plugins: () => {
		if (pl._plc.length >= 0) {
			pl.update();
			debug.log("Plugins updated.", "Plugins");
		}
		return pl._plc;
	},
	reload: async () => {
		const plList = pl.plugins();
		for (const plugin of plList) {
			if(plugin.instance?.stop) plugin.instance.stop();
			plList.delete(plugin.id);
		}
		for (const type of pl.types()) {
			if(type.instance?.stop) type.instance.stop();
			pl._tyc.delete(type.id);
		}
		for (const key in require.cache) {
			if (key.startsWith(path.resolve("./tmp"))) {
				delete require.cache[key];
			}
		}
		await pl.update();
	},
	unload: (id) => {
		const plList = pl.plugins();
		const plugin = plList.get(id);
	
		if(plugin) {
			if(plugin.instance?.stop) plugin.instance.stop();
			plList.delete(id);
		}
		for (const key in require.cache) {
			if (key.startsWith(path.resolve(`./tmp/_e_._plugins_${id}.Freedeck`)) || 
					key.startsWith(path.resolve(`./plugins/${id}`)) || 
					key.startsWith(path.resolve(`./plugins/${id}.disabled`))) {
				delete require.cache[key];
			}
		}
		debug.log(picocolors.green(`Successfully unloaded plugin with ID ${id}`), "Plugins");
	},
	reloadSinglePlugin: async (id) => {
		const file = pl.plugins().get(id).file;
		pl.unload(id);
		if (fs.existsSync(path.resolve('./plugins', file)))
		await pl.load(file);
		debug.log(picocolors.green(`Successfully reloaded plugin with ID ${id}`), "Plugins");
	},
	update: async () => {
		debug.log("Loading plugins.", "Plugins");
		pl._disabled = [];
		pl._plc.clear();
		pl._tyc.clear();
		const files = fs.readdirSync(path.resolve("./plugins"));
		const loadPromises = files
			.filter(
				(file) =>
					file.endsWith(".Freedeck") ||
					file.endsWith(".src") ||
					file.endsWith(".fdr.js") ||
					file.endsWith(".fdpackage") ||
					file.endsWith(".disabled"),
			)
			.map(async (file) => await pl.load(file));
		try {
			await Promise.all(loadPromises);
		} catch (er) {
			console.log(er);
		}
	},
	load: async (file) => {
		if(pl._disabled.includes(file)) {
			pl._disabled = pl._disabled.filter((value) => value !== file);
		}
		if (file.endsWith(".fdpackage")) {
			packageHandler.openPackage(file, pl);
			return;
		}
		if (file.includes(".disabled")) {
			pl._disabled.push(file);
			return;
		}
		try {
			if (file.endsWith(".fdr.js")) {
				require(path.resolve("./src/managers/providers/singleFile.js"))({
					debug,
					file,
					pl,
				})
				return;
			}
			if (file.endsWith(".src")) {
				require(path.resolve("./src/managers/providers/sourceFolder.js"))({
					debug,
					file,
					pl,
				})
				return;
			}
			require(path.resolve("./src/managers/providers/default.js"))({
				debug,
				file,
				pl,
			});
		} catch (err) {
			console.log(
				picocolors.red(`Error while trying to load plugin ${file}: ${err}`),
				"Plugins",
			);
		}
	},
	types: () => {
		return pl._tyc;
	},
};

module.exports = pl;
