const plugins = require("../../managers/plugins");
const fs = require("node:fs");
const eventNames = require("../eventNames");
const path = require("node:path");

module.exports = ({ io, data }) => {
	data = JSON.parse(data);
	fs.writeFile(
		path.resolve(`./plugins/${data.plugin}/settings.json`),
		JSON.stringify(data.settings),
		() => {
			console.log(`Settings for ${data.plugin} saved`);
		},
	);
	plugins.update();
	io.emit(eventNames.default.reload);
};
