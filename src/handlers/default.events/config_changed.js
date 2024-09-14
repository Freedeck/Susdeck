const path = require("node:path");
const eventNames = require("../eventNames");
const fs = require("node:fs");

module.exports = ({ io, data }) => {
	if (!fs.existsSync(path.resolve("./src/configs/style.json"))) {
		fs.writeFileSync(
			path.resolve("./src/configs/style.json"),
			JSON.stringify({
				scroll: false,
				center: true,
				fill: false,
				"font-size": 15,
				buttonSize: 6,
				iconCountPerPage: 12,
				longPressTime: 3,
				tileRows: 5,
				compact: false,
			}),
		);
	}
	fs.writeFileSync(
		path.resolve("./src/configs/style.json"),
		JSON.stringify(data),
	);
	io.emit(eventNames.default.config_changed, data);
};
