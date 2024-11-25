const path = require("node:path");
const plugins = require("../../managers/plugins");
const eventNames = require("../eventNames");
const fs = require("node:fs");

module.exports = ({ io, data }) => {
	const currLoaded = plugins.plugins();
	plugin = currLoaded.get(data);
	if(!fs.existsSync(path.resolve(`./plugins/${plugin.file}`))) return;
	if(Object.keys(plugin.instance.types).length > 0) {
		for (const type of plugin.instance.types) {
			plugins._tyc.delete(type);
		}
	}
	console.log(`Attempting to disable ${plugin.file} (${plugin.instance.name})...`);
	currLoaded.delete(plugin.instance.id);
	fs.renameSync(
		path.resolve(`./plugins/${plugin.file}`),
		path.resolve(`./plugins/${plugin.file}.disabled`),
	);
	plugins.unload(plugin.instance.id);
	plugins._disabled.push(`${plugin.file}.disabled`);
	io.emit(eventNames.default.reload);
};
