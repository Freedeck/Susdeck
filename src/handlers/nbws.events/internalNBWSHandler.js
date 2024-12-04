const ws = require("ws");
const { execSync } = require("node:child_process");

function check() {
  const out = execSync('tasklist /FI "WINDOWTITLE eq Freedeck"');
  const realOut = out.toString().trim().trim();
  if (
    realOut.includes("INFO: No tasks are running which match the specified criteria.")
  ) {
    return true;
  }
  return false;
}

const nbws = {
  _socket: null,
  connected: false,
  _callbacks: {},
  send: (data, ...args) => {
    if (nbws._socket.readyState === ws.OPEN) {
      nbws._socket.send(JSON.stringify({ Event: data, Data: [...args] }));
    }
  },
  on: (event, callback) => {
    if (!nbws._callbacks[event]) nbws._callbacks[event] = [];
    nbws._callbacks[event].push(callback);
  },
  once: (event, callback) => {
    if (!nbws._callbacks[event]) nbws._callbacks[event] = [];
    const fn = (...args) => {
      callback(...args);
      nbws._callbacks[event] = nbws._callbacks[event].filter((x) => x !== fn);
    };
    nbws._callbacks[event].push(fn);
  },
};

let retryDelay = 1000;

function retryConnection() {
  check();
  try {
    nbws._socket = new ws("ws://localhost:5756/");
    nbws._socket.onopen = (event) => {
      nbws.connected = true;
      retryDelay = 1000;
      console.log("WebSocket is open now.");
    };
    nbws._socket.onclose = (event) => {
      nbws.connected = false;
      console.log("WebSocket is closed now.");
      setTimeout(() => {
        if (nbws._socket.readyState !== ws.OPEN) {
          retryConnection();
          console.log("NBWS Reconnecting...");
        }
      }, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 30000);
    };
    nbws._socket.onerror = (event) => {
      console.error(`WebSocket error: ${event.message}`);
    };
  } catch (e) {
    console.error(`WebSocket error: ${e.message}`);
    setTimeout(retryConnection, retryDelay);
    retryDelay = Math.min(retryDelay * 2, 30000);
  }
}

retryConnection();

nbws._socket.onmessage = (event) => {
  const realData = atob(event.data);
  try {
    const data = JSON.parse(realData);
    if (!nbws._callbacks[data.Event]) return;
    for (const callback of nbws._callbacks[data.Event]) {
      callback(data.Data);
    }
  } catch (e) {
    console.log(`Failed to parse JSON: ${e}`);
  }
};

nbws._socket.onerror = (error) => {
  console.error(`WebSocket error: ${error}`);
};
module.exports = { nbws, check };
