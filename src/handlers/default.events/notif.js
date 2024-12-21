const NotificationManager = require("@managers/notifications");

module.exports = ({ data }) => {
	NotificationManager.add(data.sender, data.data);
};
