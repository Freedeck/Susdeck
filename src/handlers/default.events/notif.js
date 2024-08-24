const NotificationManager = require("../../managers/notifications");

module.exports = ({ data }) => {
	data = JSON.parse(data);
	NotificationManager.add(data.sender, data.data);
};
