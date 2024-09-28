const socketIO = require("socket.io");
const path = require("node:path");
const fs = require("node:fs");
const picocolors = require("./utils/picocolors");
const debug = require("./utils/debug");
const NotificationManager = require(
  path.resolve("./src/managers/notifications"),
);
const eventNames = require(path.resolve("./src/handlers/eventNames"));
const { server } = require("./http");
const io = new socketIO.Server(server);

const handlers = new Map();
const pl = require(path.resolve("./src/managers/plugins"));
const plugins = pl.plugins();

for (const file of fs.readdirSync(path.resolve("./src/handlers"))) {
  if (fs.lstatSync(path.resolve(`./src/handlers/${file}`)).isDirectory()) {
    continue;
  }
  const handler = require(`./handlers/${file}`);
  if (!handler.exec) continue;
  handlers.set(handler.name, handler);
}

const types = pl.types;

pl.update();

const clients = [];
let RelayStatus = false;

function connectRelayClient() {
  const relayClient = require("socket.io-client")("http://localhost:3000");
  relayClient.on("connect", () => {
    RelayStatus = true;
    // const rlc = Math.random().toString(36).substring(7);
    const rlc = "kctonp";
    relayClient.emit(eventNames.relay.identify, rlc);
    if(!relayClient._id) handleSock(relayClient);
    relayClient.on(eventNames.relay.request, (upath) => {

      const allowed =[
        "",
        'app',
        'common',
        'companion',
        'shared',
        'hooks'
      ]

      if(!allowed.some((a) => upath.startsWith(a))) {
        relayClient.emit(eventNames.relay.file, "Access Denied");
        return;
      } 

      let folder = "client";
      if(upath.includes("companion")) folder = "companion";
      if(upath.includes("shared")) folder = "shared";
      if(upath.includes("hooks")) folder = "hooks";
      if(upath.includes("app")) folder = "app";
      if(upath.includes("common")) folder = "common";
      // /app/shared/theming/a.css -> ["", "app", "shared", "theming", "a.css"]
      let file = upath.split("/");
      if(upath.split("/").length > 1) {
        file.shift();
      }
      if(upath.includes("app") && upath.includes("shared")) {
        folder = "shared";
        file.shift();
      }
      file = file.join("/");

      console.log(folder, file, upath);

      if(file === "") file = "index.html";
      

      const f = fs.readFileSync(
        path.resolve(`webui/${folder}/${file}`),
        "utf8",
      )
      let mimeType = "text/plain";
      console.log(file.split(".").pop())
      switch(file.split(".").pop()) {
        case "js":
          mimeType = "text/javascript";
          break;
        case "css":
          mimeType = "text/css";
          break;
        case "html":
          mimeType = "text/html";
          break;
      }
      relayClient.emit(eventNames.relay.file,[f, mimeType, upath]);
    })
    relayClient.on(eventNames.relay.error, (err) => {
      if(err[1] === -1) {
        // Device already exists
        console.log("Device already exists, disconnecting and reconnecting");
        relayClient.disconnect();
        connectRelayClient();
        return;
      }
    })
    relayClient.on(eventNames.relay.opened, () => {
      console.log(`

Relay connection opened
Connect with code ${rlc}

        `)
    });
    relayClient.on("disconnect", () => {
      RelayStatus = false;
      console.log("Disconnected from relay server");
      relayClient.disconnect();
      const wait = setInterval(() => {
        if(!RelayStatus) {
          clearInterval(wait);
          connectRelayClient();
        }
      }, 1000);
    });
  });
}

// connectRelayClient();

debug.log("Initializing server...", "Server / HTTP");

io.on("connection", handleSock);

function handleSock(socket) {
  socket._originalOn = socket.on;
  socket._originalEmit = socket.emit;

  /**
   * Send latest notification to Freedeck Client.
   * @param {Object} notification Notification data for Freedeck Client to parse.
   */
  function sendNotification(notification) {
    if (notification.sender === "handoff-api") {
      switch (notification.data) {
        case "reload-plugins":
          io.emit(eventNames.default.plugins_updated);
          break;
      }
      if (notification.data.startsWith("nb-slider-")) {
        const slider = notification.data.split("-")[2];
        const value = notification.data.split("-")[3];
        io.emit(eventNames.default.slider_update, { slider, value });
      }
      return;
    }
    console.log("Sending notification to client");
    socket.emit(eventNames.default.notif, notification);
    NotificationManager.once("newNotification", sendNotification);
  }

  socket.sendNotif = sendNotification;

  NotificationManager.once("newNotification", sendNotification);

  socket.on = (event, callback) => {
    socket._originalOn(event, callback);
    debug.log(picocolors.green(`Listening for event ${event}`), "Socket.IO API");
  };

  socket.emit = (event, data) => {
    socket._originalEmit(event, data);
    if (event !== "I")
      debug.log(
        picocolors.green(
          `Emitted new event ${event}, data: ${JSON.stringify(data)}`,
        ),
        "Socket.IO API",
      );
  };

  console.log("Client has connected");
  clients.push(socket);

  socket.on("disconnect", () => {
    const index = clients.indexOf(socket);
    if (index !== -1) {
      clients.splice(index, 1);
      NotificationManager.removeListener("newNotification", sendNotification);
    }
  });

  try {
    for (const handler of handlers.values()) {
      try {
        if(io.rpcClients?.includes(socket) && handler.name !== "RPC") continue;
        handler.exec({ socket, types, plugins, io, clients });
      } catch (e) {
        debug.log(picocolors.red(e));
      }
      debug.log(
        `${picocolors.cyan(`Added new handler ${handler.name}`)}- for ${socket._id}\n`,
        "Socket.IO API",
      );
    }
  } catch (e) {
    debug.log(picocolors.red(e));
  }
}