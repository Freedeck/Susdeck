const config = require("@managers/settings");
const eventNames = require("../eventNames");

module.exports = ({ io, data }) => {
	config.settings().theme = data;
	config.save();
	io.emit(eventNames.companion.set_theme, data);
};
