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
const {intents, events} = require("../classes/api");
const { nbws, check } = require("./internalNBWSHandler");

const userThemesLocation = path.resolve("user-data/themes");
const userSoundpacksLocation = path.resolve("user-data/soundpacks");

const commonSoundpacks = path.resolve("webui/common/sounds");
const commonThemes = path.resolve("webui/shared/theming");

const localStyleLocation = path.resolve("./src/configs/style.json");

const thisPackage = require(path.resolve("package.json"));
const os = require("node:os");
const hostname = os.hostname()

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
        if(instance._intent.includes(intents.IO)) {
          instance.io = io;
        }
        if(instance._intent.includes(intents.SOCKET)) {
          instance.socket = socket;
        }
        if(instance._intent.includes(intents.CLIENTS)) {
          instance.clients = clients;
        }
        instance.emit(events.connection, {
          active: true,
          io: instance._intent.includes(intents.IO) ? io : null,
          socket: instance._intent.includes(intents.SOCKET) ? socket : null,
          clients: instance._intent.includes(intents.CLIENTS) ? clients : null,
        });
      } else {
        for (const hook of instance.hooks) {
          if(hook.type === HookRef.types.socket) {
            debug.log(`Running hook ${hook.file}`, `Socket Server / ${socket.user ? socket.user : socket.id}`);
            require(hook.file)(
              socket, io, instance
            )
          }
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
        tsm.set("IC", socket.id);
      }
      console.log(`Freedeck ${socket.user} connected to server at ${new Date()}`);
      const pl = {};
      const plset = {};
      const plu = plugins.plugins();
      for (const plugin of plu) {
        const { name, id, author, version, popout, types, imports, hooks, views, disabled, stopped } = plugin[1].instance;
        pl[plugin[1].instance.id] = {
          name,
          id,
          author,
          version,
          Settings: {},
          popout,
          types,
          imports,
          hooks,
          views,
          disabled,
          stopped,
        }

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
        hostname,
        soundpacks: [...readdirSync(commonSoundpacks).filter(
          (e) => e.endsWith(".soundpack"),
        ), ...readdirSync(userSoundpacksLocation).filter(
                (e) => e.endsWith(".soundpack"),
              ).map(e=>`${e}#`)
        ],
        themes: [...readdirSync(commonThemes).filter(
          (e) => e.endsWith(".css"),
        ), ...readdirSync(userThemesLocation).filter(
                (e) => e.endsWith(".css"),
              ).map(e=>`${e}#`)
        ],
        mobileConnected: isMobileConnected || false,
        style: JSON.parse(
          readFileSync(localStyleLocation),
        ),
        plugins: pl,
        disabled: plugins._disabled,
        events: eventNames,
        nbws: nbwsState,
        version: {
          raw: thisPackage.version,
          human: `Freedeck v${thisPackage.version}`
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
