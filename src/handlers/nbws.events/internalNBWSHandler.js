const ws = require('ws');

const nbws = {
  _socket: new ws('ws://localhost:5756/'),
  connected: false,
  _callbacks: {},
  send: (data, ...args) => {
    if (nbws._socket.readyState === ws.OPEN) {
      nbws._socket.send(JSON.stringify({Event: data, Data: [...args]}));
    }
  },
  on: (event, callback) => {
    if(!nbws._callbacks[event])
      nbws._callbacks[event] = [];
    nbws._callbacks[event].push(callback);
  },
  once: (event, callback) => {
    if(!nbws._callbacks[event])
      nbws._callbacks[event] = [];
    const fn = (...args) => { 
      callback(...args);
      nbws._callbacks[event] = nbws._callbacks[event].filter((x) => x !== fn);
    };
    nbws._callbacks[event].push(fn);
  }
}

nbws._socket.onopen = (event) => {
  nbws.connected = true;
    console.log('WebSocket is open now.');
    nbws.Interval = setInterval(() => {
      
    }, 1000);
    
};

nbws._socket.onclose = (event) => {
  nbws.connected = false;
  setInterval(() => {
    if(nbws._socket.readyState === ws.OPEN) {
      clearInterval(nbws.Interval);
    } else nbws._socket = new ws('ws://localhost:5756/');
    console.log("NBWS Reconnecting...");
  }, 2500);
    console.log('WebSocket is closed now.');
};

nbws._socket.onmessage = (event) => {
  const realData = atob(event.data);
    try {
      const data = JSON.parse(realData);
      if(!nbws._callbacks[data.Event]) return;
      for(const callback of nbws._callbacks[data.Event]) {
        callback(data.Data);
      }
    } catch (e) {
      console.log(`Failed to parse JSON: ${e}`);
    }
};

nbws._socket.onerror = (error) => {
    console.error(`WebSocket error: ${error}`);
};
module.exports= { nbws };