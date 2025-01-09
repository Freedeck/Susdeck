const path = require("node:path");
const eventNames = require("../eventNames");
const fs = require("node:fs");
const { settings } = require("../../managers/settings");

const styleLocation = path.resolve("./src/configs/style.json");

module.exports = ({ io, data }) => {
	if(!fs.existsSync(styleLocation)) {
		settings.checkStyle();
	}
	fs.writeFileSync(
		styleLocation,
		JSON.stringify(data),
	);
	io.emit(eventNames.default.config_changed, data);
};
