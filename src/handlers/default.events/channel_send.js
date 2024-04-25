const plugins = require('../../managers/plugins').plugins;

module.exports = ({io, data}) => {
  const plug = plugins().get(data.plugin).instance;
  if (plug.channelsCreated.includes(data.channel)) {
    plug.channelsSendQueue.push({channel: data.channel, data: data.data});
  }
};
