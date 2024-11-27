const eventNames = require("./eventNames");

module.exports = {
	name: "NBWS",
	id: "fd.handlers.nbws",
	exec: ({ socket, io }) => {
		for (const event of Object.keys(eventNames.nbws)) {
			socket.on(eventNames.nbws[event], (data) => {
				require(`./nbws.events/${event}`)({ io, socket, data });
			});
		}
	},
};
