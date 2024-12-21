const config = require("@managers/settings");
const eventNames = require("../eventNames");

module.exports = ({ io, data, clients }) => {
	const item = JSON.parse(data.item);

	if(item === null) return;

	const settings = config.settings();
	const profile = settings.profiles[settings.profile];
	let flag = false;

	for (const sndObj of profile) {
		const snd = sndObj[Object.keys(sndObj)[0]];
		if (snd.uuid === item.uuid) {
			// Update positions if there's already something at the new index
			for (const soundToCheckObject of profile) {
				const soundToUpdate =
					soundToCheckObject[Object.keys(soundToCheckObject)[0]];
				if (soundToUpdate.pos === data.newIndex) {
					soundToUpdate.pos = data.oldIndex;
				}
			}
			snd.pos = data.newIndex;
			flag = true;
			break;
		}
		if (flag) return;
	}

	config.save();
	io.emit(eventNames.default.reload_sounds, settings.profiles[settings.profile]);
};
