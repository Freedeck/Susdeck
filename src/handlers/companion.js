const eventNames = require("./eventNames");

module.exports = {
	name: "Companion",
	id: "fd.handlers.companion",
	exec: ({ socket, io, clients }) => {
		for (const event of Object.keys(eventNames.companion)) {
			socket.on(eventNames.companion[event], (data) => {
				require(`./companion.events/${event}`)({ io, socket, data, clients });
			});
		}
	},
};
