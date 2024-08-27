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

const serverVersion = `Freedeck OS-${require(path.resolve("package.json")).version}s`;

module.exports = {
  name: "Main",
  id: "fd.handlers.main",
  exec: ({ socket, io, clients }) => {
    socket._id = `${Math.random() * 2048}.fd`;
    socket.tempLoginID = `${Math.random() * 1024}.tlid.fd`;
    socket._clientInfo = {};

    debug.log("Client connected", `Socket ${socket._id}`);

    socket.on("disconnect", () => {
      if (socket.user === "Main") {
        tsm.set("isMobileConnected", false);
        io.emit(eventNames.user_mobile_conn, false);
      }
      if (socket.user === "Companion") tsm.delete("IC");
      debug.log(
        pc.red(`Client ${socket.user} disconnected`),
        `Socket ${socket._id}`,
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

    debug.log("Created socket hooks.", `Socket ${socket._id}`);

    for (const event of Object.keys(eventNames.default)) {
      socket.on(eventNames.default[event], (data) => {
        require(`./default.events/${event}`)({ io, socket, data, clients });
      });
    }
    debug.log(
      "Created event listeners. Now listening for user greet.",
      `Socket ${socket._id}`,
    );

    socket.on(eventNames.client_greet, (user) => {
      socket.user = user;
      debug.log("Migrating to username.", `Socket ${socket.user}`);
      if (user === "Main") {
        debug.log("Is mobile.", `Socket ${socket.user}`);
        if (tsm.get("isMobileConnected") === undefined)
          tsm.set("isMobileConnected", false);
        io.emit(eventNames.user_mobile_conn, true);
        tsm.set("isMobileConnected", true);
      }
      if (user === "Companion") {
        debug.log("Not mobile.", `Socket ${socket.user}`);
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
      debug.log("Setup plugin information", `Socket ${socket.user}`);
      cfg.update();
      debug.log("Refreshed configuration", `Socket ${socket.user}`);
      const isMobileConnected = tsm.get("isMobileConnected");

      const serverInfo = {
        id: socket._id,
        NotificationManager,
        hostname: require("node:os").hostname(),
        soundpacks: readdirSync(path.resolve("webui/common/sounds")).filter(
          (e) => e.endsWith(".soundpack"),
        ),
        mobileConnected: isMobileConnected || false,
        tempLoginID: socket.tempLoginID,
        style: JSON.parse(
          readFileSync(path.resolve("./src/configs/style.json")),
        ),
        plugins: pl,
        plSettings: plset,
        disabled: plugins._disabled,
        events: eventNames,
        version: `OSH v${require(path.resolve("package.json")).version}`,
        server: serverVersion,
        cfg: cfg.settings(),
        profiles: cfg.settings.profiles,
      };
      debug.log("Setup serverInfo. GZipping.", `Socket ${socket.user}`);
      zlib.gzip(JSON.stringify(serverInfo), (err, buffer) => {
        if (err) {
          console.error("Compression error:", err);
          return;
        }
        debug.log("GZipped. Sending information.", `Socket ${socket.user}`);

        socket.emit(eventNames.information, buffer);
      });

      socket.emit(eventNames.default.notif, {
        sender: "Server",
        data: "Connected to server!",
        isCon: true,
      });
      debug.log(
        "Letting user know they're connected.",
        `Socket ${socket.user}`,
      );

      socket.on(eventNames.information, (data) => {
        socket._clientInfo = data;
        debug.log(`Companion using APIv${data.apiVersion}`);
      });
    });
  },
};
