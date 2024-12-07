const eventNames = require("./eventNames");
const cfg = require("../managers/settings");
const plugins = require("../managers/plugins");
const debug = require("../utils/debug");
const NotificationManager = require("../managers/notifications");
const tsm = require("../managers/temporarySettings");
const pc = require("../utils/picocolors");
const path = require("node:path");
const zlib = require("node:zlib");
const { readFileSync, readdirSync, existsSync } = require("node:fs");

const HookRef = require("../classes/HookRef");
const { nbws, check } = require("./internalNBWSHandler");

module.exports = {
  name: "Main",
  id: "fd.handlers.main",
  exec: ({ socket, io, clients }) => {
    nbws._io = io;
    socket.tempLoginID = `${Math.random() * 1024}.tlid.fd`;
    socket._clientInfo = {};

    debug.log("Connected to server!", `Socket Server / ${socket.user ? socket.user : socket.id}`);

    socket.on("disconnect", () => {
      if (socket.user === "Main") {
        tsm.set("isMobileConnected", false);
        io.emit(eventNames.user_mobile_conn, false);
      }
      if (socket.user === "Companion") tsm.delete("IC");
      debug.log(
        pc.red("Disconnected"),
        `Socket Server / ${socket.user ? socket.user : socket.id}`,
      );
    });

    socket.on(eventNames.nbws.sendRequest, (data) => {
      if (nbws.connected) {
        nbws.send(data[0], ...data[1]);
      } else {
      }
    });

    for (const plugin of plugins.plugins()) {
      const instance = plugin[1].instance;
      if(instance.v2) {
        instance.emit(instance.events.connection, {
          active: true,
          io: plugin._intents.includes(plugin.intents.IO) ? io : null,
          socket: plugin._intents.includes(plugin.intents.SOCKET) ? socket : null,
          clients: plugin._intents.includes(plugin.intents.CLIENTS) ? clients : null,
        });
        return;
      }
      for (const hook of instance.hooks) {
        if(hook.type === HookRef.types.socket) {
          debug.log(`Running hook ${hook.file}`, `Socket Server / ${socket.user ? socket.user : socket.id}`);
          require(hook.file)(
            socket, io, instance
          )
        }
      }
    }

    debug.log("Created socket hooks.", `Socket Server / ${socket.user? socket.user : socket.id}`);

    for (const event of Object.keys(eventNames.default)) {
      socket.on(eventNames.default[event], (data) => {
        if(!existsSync(path.resolve(`./src/handlers/default.events/${event}.js`))) {
          console.log(`Event ${event} is not implemented.`);
          return;
        }
        const eventHandler = require(path.resolve(`./src/handlers/default.events/${event}`));
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
      "Initialized event listeners.",
      `Socket Server / ${socket.user ? socket.user : socket.id}`,
    );

    socket.on(eventNames.client_greet, (user) => {
      socket.user = user;
      debug.log("Migrating to username.", `Socket Server / ${socket.user}`);
      if (user === "Main") {
        debug.log("Mobile device.", `Socket Server / ${socket.user}`);
        if (tsm.get("isMobileConnected") === undefined)
          tsm.set("isMobileConnected", false);
        io.emit(eventNames.user_mobile_conn, true);
        tsm.set("isMobileConnected", true);
      }
      if (user === "Companion") {
        debug.log("Not a mobile device.", `Socket Server / ${socket.user}`);
        if (tsm.get("IC") === undefined) tsm.set("IC", socket.id);
        if (tsm.get("IC") !== socket.id) {
          socket.emit(eventNames.companion.conn_fail);
          return;
        }
        tsm.set("IC", socket.id);
      }
      console.log(`Freedeck ${socket.user} connected to server at ${new Date()}`);
      const pl = {};
      const plset = {};
      const plu = plugins.plugins();
      for (const plugin of plu) {
        pl[plugin[1].instance.id] = plugin[1].instance;
        plset[plugin[1].instance.id] = plugins._settings.get(
          plugin[1].instance.id,
        );
      }
      debug.log("Fetched plugin information", `Socket Server / ${socket.user}`);
      cfg.update();
      debug.log("Refreshed configuration", `Socket Server / ${socket.user}`);
      const isMobileConnected = tsm.get("isMobileConnected");
      const nbwsState = check();

      const serverInfo = {
        id: socket.id,
        tempLoginID: socket.tempLoginID,
        NotificationManager,
        hostname: require("node:os").hostname(),
        soundpacks: [...readdirSync(path.resolve("webui/common/sounds")).filter(
          (e) => e.endsWith(".soundpack"),
        ), ...readdirSync(path.resolve("webui/hooks/_sounds")).filter(
                (e) => e.endsWith(".soundpack"),
              ).map(e=>`${e}#`)
        ],
        themes: [...readdirSync(path.resolve("webui/shared/theming")).filter(
          (e) => e.endsWith(".css"),
        ), ...readdirSync(path.resolve("webui/hooks/_themes")).filter(
                (e) => e.endsWith(".css"),
              ).map(e=>`${e}#`)
        ],
        mobileConnected: isMobileConnected || false,
        style: JSON.parse(
          readFileSync(path.resolve("./src/configs/style.json")),
        ),
        plugins: pl,
        disabled: plugins._disabled,
        events: eventNames,
        nbws: nbwsState,
        version: {
          raw: require(path.resolve("package.json")).version,
          human: `Freedeck v${require(path.resolve("package.json")).version}`
        },
        config: cfg.settings(),
      };
      debug.log("Setup serverInfo. GZipping.", `Socket Server / ${socket.user}`);
      zlib.gzip(JSON.stringify(serverInfo), (err, buffer) => {
        if (err) {
          console.error("Compression error:", err);
          return;
        }
        debug.log("GZipped. Sending information.", `Socket Server / ${socket.user}`);

        socket.emit(eventNames.information, buffer);
      });

      socket.emit(eventNames.default.notif, {
        sender: "Server",
        data: "Connected to server!",
        isCon: true,
      });
      debug.log(
        "Letting user know they're connected.",
        `Socket Server / ${socket.user}`
      );

      socket.on(eventNames.information, (data) => {
        socket._clientInfo = data;
        debug.log(`Companion using APIv${data.apiVersion}`, `Socket Server / ${socket.user}`);
      });
    });
  },
};
