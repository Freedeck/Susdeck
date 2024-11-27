const HookRef = require("./HookRef");
const Plugin = require("./Plugin");

module.exports = class PluginV2 extends Plugin {
  v2 = true;
  constructor() {
    super("Loading", "Loading", "Loading", false);
    setup();
  }

  setName(name) {
    this.name = name;
  }
  setAuthor(author) {
    this.author = author;
  }
  setID(id) {
    this.id = id;
  }
  setDisabled(disabled) {
    this.disabled = disabled;
  }
   
  onInitialize() {
    this.setup();
    emit(this.events.ready);
    return true;
  }
  onButton(e) {
    this.emit(this.events.button, e);
  }
  onStopping() {
    this.emit(this.events.stopping);
  }

  setup() {};
  exec() {};
  _callbacks = {};

  events = {
    connection: 0xa9,
    button: 0xb0,
    ready: 0xb1,
    stopping: 0xb2,
    stopped: 0xb3
  }

  intents = {
    SOCKET: 0xc0,
    IO: 0xc1,
    CLIENTS: 0xc2,
    hooks: {
      CLIENT: 0xd2,
      SERVER: 0xd3,
      SOCKET: 0xd4,
      IMPORT: 0xd5,
      VIEW: 0xd6
    }
  }
  _intent = [];
  requestIntent(intent) {
    if(!this.intents.includes(intent)) return;
    if(this._intent.includes(intent)) return;
    this._intent.push(intent);
  }

  io = {
    active: false,
  }

  on(ev, cb) {
    if(!this._callbacks[ev]) this._callbacks[ev] = [];
    this._callbacks[ev].push(cb);
  }

  emit(ev, ...args) {
    if(!this._callbacks[ev]) return;
    for(const cb of this._callbacks[ev]) {
      cb(...args);
    }
  }
  
  /**
   * Add a hook with the new HookRef system.
   * @param {HookRef} type 
   * @param {PathLike} file 
   */
  add(type, file) {
    switch(type) {
      case HookRef.types.client:
        this.setJSClientHook(file);
        break;
      case HookRef.types.server:
        this.setJSServerHook(file);
        break;
      case HookRef.types.socket:
        console.log("!!! Socket hooks are unsupported with the new system.");
        console.log("!!! This functionality has been built in to 'this.io' in your plugin!");
        console.log("!!! You need to request the intents: intents.IO, intents.SOCKET for the server & client.");
        console.log("!!! You need to request the intent: intents.CLIENTS for the clients.");
        break;
      case HookRef.types.view:
        this.addView(file);
        break;
      case HookRef.types.import:
        this.imports.push(file);
        break;
    }
  }
};
