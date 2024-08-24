module.exports = ({ io, data }) => {
	data = JSON.parse(data);
	console.log(`[${data.sender}] ${data.data}`);
};
