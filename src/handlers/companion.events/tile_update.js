const config = require("../../managers/settings");
const eventNames = require("../eventNames");

module.exports = ({ io, data }) => {
	io.emit(eventNames.companion.tile_update, data);
};
