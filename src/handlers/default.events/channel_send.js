const plugins = require('../../managers/plugins').plugins;

module.exports = ({io, data}) => {
  if (!plugins().has(data.plugin)) return;
  const plug = plugins().get(data.plugin).instance;
  if (plug.channelsCreated.has(data.channel)) {
    plug.channelsSendQueue.add({channel: data.channel, data: data.data});
  }
};
