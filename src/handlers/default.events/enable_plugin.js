const path = require("node:path");
const plugins = require("../../managers/plugins");
const eventNames = require("../eventNames");
const fs = require("node:fs");

module.exports = ({ io, data }) => {
	fs.renameSync(
		path.resolve(`./plugins/${data}.Freedeck.disabled`),
		path.resolve(`./plugins/${data}.Freedeck`),
	);
	plugins.reload();
	io.emit(eventNames.default.reload);
};
