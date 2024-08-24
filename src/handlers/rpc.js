const eventNames = require("./eventNames");

module.exports = {
	name: "RPC",
	id: "fd.handlers.rpc-server",
	exec: ({ socket, io }) => {
		Object.keys(eventNames.rpc).forEach((event) => {
			socket.on(eventNames.rpc[event], (data) => {
				require(`./rpc.events/${event}`)({ io, socket, data });
			});
		});
	},
};
