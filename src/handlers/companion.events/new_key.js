const config = require("../../managers/settings");
const eventNames = require("../eventNames");

module.exports = ({ io, data }) => {
	data = JSON.parse(data);
	const name = Object.keys(data)[0];
	const key = data[name];
	const parsed = JSON.parse(
		JSON.stringify(`{"${name}": ${JSON.stringify(key)}}`),
	);
	const settings = config.settings();
	settings.profiles[settings.profile].push(JSON.parse(parsed));
	config.save();
	io.emit(eventNames.default.reload);
};
