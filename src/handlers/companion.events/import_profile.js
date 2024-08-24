const config = require("../../managers/settings");
const eventNames = require("../eventNames");

module.exports = ({ io, data }) => {
	config.settings().profiles[data.name] = data.data;
	config.settings().profile = data.name;
	config.save();
	io.emit(eventNames.default.reload);
};
