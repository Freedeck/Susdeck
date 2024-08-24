const config = require("../../managers/settings");
const eventNames = require("../eventNames");

module.exports = ({ io, data }) => {
	data = JSON.parse(data);
	const { name, interaction } = data;
	const settings = config.settings();
	const profiles = settings.profiles[settings.profile];

	for (const snd of profiles) {
		const key = snd[Object.keys(snd)[0]];
		if (snd[key].uuid === interaction.uuid) {
			if (name !== key) {
				delete snd[key];
			}
			snd[name] = interaction;
			break;
		}
	}

	config.save();
	io.emit(eventNames.default.reload);
};
