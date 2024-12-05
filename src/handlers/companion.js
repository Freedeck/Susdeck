const eventNames = require("./eventNames");

module.exports = {
	name: "Companion",
	id: "fd.handlers.companion",
	exec: ({ socket, io, clients }) => {
		for (const event of Object.keys(eventNames.companion)) {
			socket.on(eventNames.companion[event], (data) => {
				const eventHandler = require(`./companion.events/${event}`);
        if(typeof eventHandler !== "function") {
          // its a new event handler
          const flags = eventHandler.flags || [];
					if(flags.includes("AUTH")) {
          	socket.emit(eventNames.default.notif, {sender: "Server", data: "Performing authenticated action."});
						if(!socket.auth) {
							socket.emit(eventNames.default.not_auth);
							return;
						}
					}
					eventHandler.exec({ io, socket, data, clients });
					if(flags.includes("RELOAD_ALL")) {
						io.emit(eventNames.default.reload);
					}
					if(flags.includes("RELOAD_CLIENTS")) {
						for(const client of clients) {
							if(client._id === socket.id) continue;
							client.emit(eventNames.default.reload);
						}
					}
					return;
        }
        // unmigrated
        eventHandler({ io, socket, data, clients });
			});
		}
	},
};
