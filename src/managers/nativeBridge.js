const udp = require('dgram');

const nativeBridge = {
  client: udp.createSocket('udp4'),
  _send: (message) => {
    const buffer = Buffer.from(message);
    nativeBridge.client.send(buffer, 0, buffer.length, 5753, 'localhost', (err) => {
      if (err) {
        console.error(err);
      }
    });
  },
  send: (message, ...args) => {
    nativeBridge._send(message + ',' + args.join(','));
  },
  _cb: [],
  on: (event, cb) => {
    nativeBridge._cb.push({event, cb});
  },
  createCallbackHandler: () => {
    nativeBridge.client.on('message', (msg) => {
      const message = msg.toString();
      nativeBridge._cb.forEach((cb) => {
        if (cb.event === message.split(',')[0]) {
          cb.cb(message.split(',').slice(1));
        }
      });
    });
  }
};

nativeBridge.createCallbackHandler();
nativeBridge.send('ping');
nativeBridge.send('echo', '1', '2', '3', 'Hello World!');

nativeBridge.on('message', (data) => {
  console.log(data)
})

module.exports = nativeBridge;