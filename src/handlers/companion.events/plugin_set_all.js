const plugins = require("../../managers/plugins");
const fs = require("node:fs");
const eventNames = require("../eventNames");
const path = require("node:path");

module.exports = ({ io, data }) => {
	fs.writeFile(
		path.resolve(`./plugins/${data.plugin}/settings.json`),
		JSON.stringify(data.settings),
		() => {
			console.log(`Settings for ${data.plugin} saved`);
		},
	);
	console.log("[LSALA] ", data)
	plugins.reloadSinglePlugin(data.plugin);
	io.emit(eventNames.default.reload);
};
