const FDPlugin = require('../src/api/FDPlugin');
const FreedeckAPI = require('../src/api/FreedeckAPI');

class examplePlugin extends FDPlugin {
  constructor () {
    super('Example Mod', 'Freedeck Api Example!', 'Freedeck.Plugins.Example', true);
  }

  onButtonPressed (soundData, buttonData) {
    console.log('Yepperoni');
    return { type: 'none', data: [soundData, buttonData] };
  }

  onInitialize (data) {
    FreedeckAPI.registerEvent('etest', this.onEventTest);
    FreedeckAPI.registerEvent('etest2', this.onOtherEventTest);
  }

  onEventTest (data) {
    const socket = data.socket;
    const args = data.args;
    const meta = data.meta;
    console.log('Server version', meta.fdVersion);
    console.log('Socket ID:', socket.id);
    console.log('Socket SID:', socket.sid);
    console.log('Args:', args);
    return { type: 'none' };
  }

  onOtherEventTest ({ socket, args }) {
    console.log('Got other event with args (', args, '), sending them back.');
    socket.emit('etest2', args);
    return { type: 'none' };
  }
}

module.exports = examplePlugin;
