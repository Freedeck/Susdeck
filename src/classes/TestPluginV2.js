const {Plugin} = require("./api");

let socketIoServer;
class TestPluginV2 extends Plugin {
  setup() {
    this.setName("Test Plugin V2");
    this.setAuthor("Test Author");
    this.setID("test-plugin-v2");
    
    this.add(HookRef.types.client, "test-plugin-v2.js");
    this.requestIntent(this.intents.IO);
    this.requestIntent(this.intents.SOCKET);

    this.on(this.events.button, this.buttonPressed);
    this.on(this.events.connection, this.onConnected);
  }

  onConnected({io, socket}) {
    console.log("Connected to Test Plugin V2");
    socketIoServer = io;
  }

  buttonPressed(interaction) {

  }
}

module.exports = {
  exec: () => new TestPluginV2(),
  class: TestPluginV2
};