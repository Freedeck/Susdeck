module.exports = ({ io, data }) => {
	console.log(`[Client ${data.sender}] ${data.data}`);
};
