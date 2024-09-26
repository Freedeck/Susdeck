const fs = require("node:fs");
const path = require("node:path");
const debug = require(path.resolve("./src/utils/debug.js"));
const picocolors = require(path.resolve("./src/utils/picocolors.js"));
const AsarBundleRunner = require("asar-bundle-runner");

const pl = {
	_plc: new Map(),
	_disabled: [],
	_tyc: new Map(),
	_ch: new Map(),
	_settings: new Map(),
	plugins: () => {
		debug.log("Plugins accessed.", "Plugin Manager");
		if (pl._plc.length >= 0) pl.update();
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
	update: async () => {
		debug.log("Rebuilding the plugin cache.", "Plugin Manager");
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
					file.endsWith(".disabled"),
			)
			.map((file) => pl.load(file));
		try {
			await Promise.all(loadPromises);
		} catch (er) {
			console.log(er);
		}
	},
	singleFile: async (file) => {
		debug.log("You're loading a single file plugin. Expect unexpected behavior.", "Plugin Manager");
		const ipl = require(path.resolve(`./plugins/${file}`));
		const instantiated = new ipl();
		pl._plc.set(instantiated.id, { instance: instantiated });
		if (instantiated.disabled) {
			pl._disabled.push(instantiated.id);
		}
		if (
			fs.existsSync(path.resolve(`./plugins/${instantiated.id}/settings.json`))
		) {
			const settings = JSON.parse(
				fs.readFileSync(
					path.resolve(`./plugins/${instantiated.id}/settings.json`),
				),
			);
			pl._settings.set(instantiated.id, settings);
		}
		debug.log(`Successfully loaded single file plugin ${file}`, "Plugin Manager");
	},
	load: async (file) => {
		if (file.includes(".disabled")) {
			pl._disabled.push(file.split(".")[0]);
			return;
		}
		try {
			if (file.endsWith(".fdr.js")) {
				try {
					pl.singleFile(file);
				} catch (err) {
					console.error(
						picocolors.red(
							`Error while trying to load single file plugin ${file}: ${err}`,
						),
						"Plugin Manager",
					);
				}
				return;
			}
			if (file.endsWith(".src")) {
				debug.log("Loading unpacked plugin. Keep in mind disabling/enabling will not work.", "Plugin Manager");
				const newPath = path.resolve(`./plugins/${file}`);
				const cfgPath = path.resolve(newPath, "config.js");
				try {
					debug.log(
						picocolors.yellow(`Initializing unpacked plugin ${file}`),
						"Plugin Manager",
					);
					const { entrypoint } = require(cfgPath);
					const entryPath = path.resolve(newPath, entrypoint);
					const entry = require(entryPath);
					debug.log("Emulating asar extraction...", "Plugin Manager");
					fs.cpSync(
						newPath,
						path.resolve(
							`./tmp/_e_._plugins_${file.split(".src")[0]}.Freedeck`,
						),
						{ recursive: true },
					);
					debug.log("Executing plugin...", "Plugin Manager");
					const instantiated = entry.exec();
					pl._plc.set(instantiated.id, { instance: instantiated });
					if (instantiated.disabled) {
						pl._disabled.push(instantiated.id);
					}
					if (
						fs.existsSync(
							path.resolve(`./plugins/${instantiated.id}/settings.json`),
						)
					) {
						const settings = JSON.parse(
							fs.readFileSync(
								path.resolve(`./plugins/${instantiated.id}/settings.json`),
							),
						);
						pl._settings.set(instantiated.id, settings);
					}
					return;
				} catch (err) {
					console.error(
						picocolors.red(
							`Error while trying to load unpacked plugin ${file}: ${err}`,
						),
						"Plugin Manager",
					);
				}
				return;
			}
			const a = await AsarBundleRunner.extract(`./plugins/${file}`, false);
			const instantiated = await AsarBundleRunner.run(a);
			debug.log(
				picocolors.yellow(
					`Plugin initialized ${instantiated.name} - ID ${instantiated.id}`,
				),
				"Plugin Manager",
			);
			pl._plc.set(instantiated.id, { instance: instantiated });
			if (instantiated.disabled) {
				pl._disabled.push(instantiated.id);
			}
			if (
				fs.existsSync(
					path.resolve(`./plugins/${instantiated.id}/settings.json`),
				)
			) {
				const settings = JSON.parse(
					fs.readFileSync(
						path.resolve(`./plugins/${instantiated.id}/settings.json`),
					),
				);
				pl._settings.set(instantiated.id, settings);
			}
		} catch (err) {
			console.log(
				picocolors.red(`Error while trying to load plugin ${file}: ${err}`),
				"Plugin Manager",
			);
		}
	},
	types: () => {
		return pl._tyc;
	},
};

module.exports = pl;
