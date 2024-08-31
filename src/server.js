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

console.log("Initializing server...");

io.on("connection", (socket) => {
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
    debug.log(picocolors.green(`Listening for event ${event}`), "SAPIConn");
  };

  socket.emit = (event, data) => {
    socket._originalEmit(event, data);
    if (event !== "I")
      debug.log(
        picocolors.green(
          `Emitted new event ${event}, data: ${JSON.stringify(data)}`,
        ),
        "SAPIConn",
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
        handler.exec({ socket, types, plugins, io, clients });
      } catch (e) {
        debug.log(picocolors.red(e));
      }
      debug.log(
        `${picocolors.cyan(`Added new handler ${handler.name}`)}- for ${socket._id}\n`,
        "SAPI",
      );
    }
  } catch (e) {
    debug.log(picocolors.red(e));
  }
});
