const picocolors = require("./utils/picocolors");
const fs = require("node:fs");
const path = require("node:path");
const debug = require("./utils/debug");

let DOES_RUN_SERVER = true;
let DO_COMPANION = true;

const DOES_SETTINGS_EXIST_YET = fs.existsSync(
  path.join(__dirname, "configs/config.fd.js"),
);

if (process.argv.includes("--server-only")) {
  console.log(picocolors.blue("Server only mode."));
  DO_COMPANION = false;
} else {
  if (process.argv.includes("--companion-only")) {
    console.log(picocolors.blue("Companion only mode."));
    DOES_RUN_SERVER = false;
  }
}
if (process.argv.includes("--native-bridge-only")) {
  console.log(picocolors.blue("Launching NativeBridge."));
  DO_COMPANION = false;
  DOES_RUN_SERVER = false;
  require(path.resolve("src/launchNativeBridge.js"));
}

if (
  (!DOES_SETTINGS_EXIST_YET && !DOES_RUN_SERVER) ||
  process.argv.includes("--setup")
) {
  const { app } = require("electron");
  app.on("ready", () => {
    require(path.resolve("setupApp/setup.js"))().then(() => {
      console.log(picocolors.bgGreen("Setup complete!"));
      app.quit();
    });
  });
  console.log(picocolors.bgRed("Settings do not exist yet. Running setup."));
  // process.exit(0);
  return;
}

if (!DOES_SETTINGS_EXIST_YET && DOES_RUN_SERVER) {
  console.log(
    picocolors.bgRed(
      "Settings do not exist yet. Please run the companion to create them.",
    ),
  );
  process.exit(1);
}

require("./checkForDirectories");

const settings = require("./managers/settings");

fs.writeFileSync(
  path.resolve("./FreedeckCore.log"),
  `A{${Date.now()}} Cleared. Launching autoupdater.\n`,
);
const appSettings = settings.settings();
debug.writeLogs = appSettings.writeLogs;

if (!DO_COMPANION && DOES_RUN_SERVER) require("./server");
if (DO_COMPANION) {
  const { app } = require("electron");
  app.whenReady().then(() => {
    require("./makeWindow")("webui/client/fdconnect.html", true, 1145, 750, false);
    if (DOES_RUN_SERVER) require("./server");
  });
}

if(DOES_RUN_SERVER)setupTerm();

/**
 * Setup the terminal
 */
function setupTerm() {
  const signals = [
    "SIGHUP",
    "SIGINT",
    "SIGQUIT",
    "SIGILL",
    "SIGTRAP",
    "SIGABRT",
    "SIGBUS",
    "SIGFPE",
    "SIGUSR1",
    "SIGSEGV",
    "SIGUSR2",
    "SIGTERM",
    "exit",
  ];

  for (const sig of signals) {
    process.on(sig, () => {
      if (sig === "SIGINT") {
        console.log("So you have chosen an unclean death. Goodbye.");
      }
      terminator(sig);
      debug.log(`Signal received: ${sig}`);
    });
  }

  const terminator = (sig) => {
    if (typeof sig === "string") {
      // call your async task here and then call process.exit() after async task is done
      if (fs.existsSync(path.resolve("./webui/hooks"))) {
        for (const file of fs.readdirSync(path.resolve("./webui/hooks"))) {
          fs.rmSync(path.resolve("./webui/hooks", file), {
            recursive: true,
          });
          console.log("- Unloaded " + file);
        }

        console.log("Hooks unloaded.");
      }
      if (fs.existsSync(path.resolve("./tmp"))) {
        fs.rmSync(path.resolve("./tmp"), { recursive: true });
        console.log("Plugins unloaded. Bye!");
      }

      setTimeout(() => {
        process.exit(1);
      });
    }
  };
}
