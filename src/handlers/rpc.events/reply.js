const evt = require("../eventNames");

module.exports = ({ io, socket, data }) => {
	const searchFor = data.id;
	io.rpcClients.forEach((client) => {
		if (client.data.id === searchFor) {
			if (data.authorization && data.value === "true") {
				client.authorized = true;
			}
			client.socket.emit(evt.rpc.reply, JSON.stringify(data));
		}
	});
};
