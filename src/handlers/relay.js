const eventNames = require("./eventNames");

module.exports = {
	name: "Relay",
	id: "fd.handlers.Relay",
	exec: ({ socket, io, clients }) => {
		console.log("relay")
		socket.on("REQ", (data) => [
			console.log("REQ", data)
		])
		
	},
};
