const plugins = require("../../managers/plugins");
const fs = require("node:fs");
const eventNames = require("../eventNames");
const path = require("node:path");

module.exports = ({ io, data }) => {
	const plugin = plugins._settings.get(data.plugin);
	plugin[data.setting] = data.value;
	fs.writeFile(
		path.resolve(`./plugins/${data.plugin}/settings.json`),
		JSON.stringify(plugin),
		() => {
			console.log(`Settings for ${data.plugin} saved`);
		},
	);
	plugins.reloadSinglePlugin(data.plugin);
	io.emit(eventNames.default.reload);
};
