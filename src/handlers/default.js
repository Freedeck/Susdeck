const eventNames = require("./eventNames");
const cfg = require("../managers/settings");
const plugins = require("../managers/plugins");
const debug = require("../utils/debug");
const NotificationManager = require("../managers/notifications");
const tsm = require("../managers/temporarySettings");
const pc = require("../utils/picocolors");
const path = require("node:path");
const zlib = require("node:zlib");
const { readFileSync, readdirSync } = require("node:fs");

module.exports = {
  name: "Main",
  id: "fd.handlers.main",
  exec: ({ socket, io, clients }) => {
    socket._id = `${Math.random() * 2048}.fd`;
    socket.tempLoginID = `${Math.random() * 1024}.tlid.fd`;
    socket._clientInfo = {};

    debug.log("Connected", `Socket.IO API / ${socket._id}`);

    socket.on("disconnect", () => {
      if (socket.user === "Main") {
        tsm.set("isMobileConnected", false);
        io.emit(eventNames.user_mobile_conn, false);
      }
      if (socket.user === "Companion") tsm.delete("IC");
      debug.log(
        pc.red("Disconnected"),
        `Socket.IO API / ${socket._id}`,
      );
    });

    for (const plugin of plugins.plugins()) {
      if (plugin[1].instance.jsSockHook) {
        require(plugin[1].instance.jsSockHookPath)(
          socket,
          io,
          plugin[1].instance,
        );
      }
    }

    debug.log("Created socket hooks.", `Socket.IO API / ${socket._id}`);

    for (const event of Object.keys(eventNames.default)) {
      socket.on(eventNames.default[event], (data) => {
        const eventHandler = require(`./default.events/${event}`);
        if(typeof eventHandler !== "function") {
          // its a new event handler
          const flags = eventHandler.flags || [];
          if(flags.includes("AUTH")) {
            console.log(socket.auth)
          }
          return;
        }
        // unmigrated
        eventHandler({ io, socket, data, clients });
      });
    }
    debug.log(
      "Created all event listeners.",
      `Socket.IO API / ${socket._id}`,
    );

    socket.on(eventNames.client_greet, (user) => {
      socket.user = user;
      debug.log("Migrating to username.", `Socket.IO API / @${socket.user} ${socket._id}`);
      if (user === "Main") {
        debug.log("Mobile device.", `Socket.IO API / @${socket.user} ${socket._id}`);
        if (tsm.get("isMobileConnected") === undefined)
          tsm.set("isMobileConnected", false);
        io.emit(eventNames.user_mobile_conn, true);
        tsm.set("isMobileConnected", true);
      }
      if (user === "Companion") {
        debug.log("Not a mobile device.", `Socket.IO API / @${socket.user} ${socket._id}`);
        if (tsm.get("IC") === undefined) tsm.set("IC", socket._id);
        if (tsm.get("IC") !== socket._id) {
          socket.emit(eventNames.companion.conn_fail);
          return;
        }
        tsm.set("IC", socket._id);
      }
      console.log(`Client ${socket.user} has greeted server at ${new Date()}`);
      console.log(
        `There are ${io.engine.clientsCount} clients connected, server counted`,
        clients.length,
      );
      const pl = {};
      const plset = {};
      const plu = plugins.plugins();
      for (const plugin of plu) {
        pl[plugin[1].instance.id] = plugin[1].instance;
        plset[plugin[1].instance.id] = plugins._settings.get(
          plugin[1].instance.id,
        );
      }
      debug.log("Fetched plugin information", `Socket.IO API / @${socket.user} ${socket._id}`);
      cfg.update();
      debug.log("Refreshed configuration", `Socket.IO API / @${socket.user} ${socket._id}`);
      const isMobileConnected = tsm.get("isMobileConnected");

      const serverInfo = {
        id: socket._id,
        tempLoginID: socket.tempLoginID,
        NotificationManager,
        hostname: require("node:os").hostname(),
        soundpacks: readdirSync(path.resolve("webui/common/sounds")).filter(
          (e) => e.endsWith(".soundpack"),
        ),
        themes: readdirSync(path.resolve("webui/shared/theming")).filter(
          (e) => e.endsWith(".css"),
        ),
        mobileConnected: isMobileConnected || false,
        style: JSON.parse(
          readFileSync(path.resolve("./src/configs/style.json")),
        ),
        plugins: pl,
        disabled: plugins._disabled,
        events: eventNames,
        version: {
          raw: require(path.resolve("package.json")).version,
          human: `Freedeck v${require(path.resolve("package.json")).version}`
        },
        config: cfg.settings(),
      };
      debug.log("Setup serverInfo. GZipping.", `Socket.IO API / @${socket.user} ${socket._id}`);
      zlib.gzip(JSON.stringify(serverInfo), (err, buffer) => {
        if (err) {
          console.error("Compression error:", err);
          return;
        }
        debug.log("GZipped. Sending information.", `Socket.IO API / @${socket.user} ${socket._id}`);

        socket.emit(eventNames.information, buffer);
      });

      socket.emit(eventNames.default.notif, {
        sender: "Server",
        data: "Connected to server!",
        isCon: true,
      });
      debug.log(
        "Letting user know they're connected.",
        `Socket.IO API / @${socket.user} ${socket._id}`
      );

      socket.on(eventNames.information, (data) => {
        socket._clientInfo = data;
        debug.log(`Companion using APIv${data.apiVersion}`, `Socket.IO API / @${socket.user} ${socket._id}`);
      });
    });
  },
};
