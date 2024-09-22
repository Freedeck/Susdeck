import { generic, handler } from "../nativeHandler";

export default function dataHandler(universal, user) {
  universal.CLU("Boot:Handler:Data", "Taking over for now.");
  return new Promise((ress, rejj) => {
    universal.CLU(
      "Boot:Handler:Data",
      "Created promise, listening for Identify event.",
    );
    universal.on("I", async (gzipped) => {
      universal.CLU("Boot:Handler:Data", "Caught Identify event.");
      universal.connected = true;
      window.universal = universal;
      universal.CLU("Boot:Handler:Data", "Re-copied Universal to window.");

      const data = await universal.asyncDecompressGzipBlob(gzipped);
      universal.CLU("Boot:Handler:Data", "Decompressed data.");
      const parsed = JSON.parse(data);
      universal.CLU("Boot:Handler:Data", "Parsed data.");
      universal._information = JSON.parse(data);
      universal.CLU("Boot:Handler:Data:Setup", "Set raw server info");
      universal.events = parsed.events;
      universal.CLU("Boot:Handler:Data:Setup", "Set events");
      universal.config = parsed.cfg;
      universal.CLU("Boot:Handler:Data:Setup", "Set Config");
      universal.config.sounds = parsed.cfg.profiles[parsed.cfg.profile];
      universal.CLU("Boot:Handler:Data:Setup", "Set Config Sounds");
      universal.plugins = parsed.plugins;
      universal.CLU("Boot:Handler:Data:Setup", "Set plugins");
      universal._serverRequiresAuth = universal.config.useAuthentication;
      universal.CLU("Boot:Handler:Data:Setup", "Set serverRequiresAuth");
      universal._init = true;
      universal.CLU("Boot:Handler:Data:Setup", "_init: Completed.");

      // default setup
      universal.CLU("Boot:Handler:Data", "Creating defaults.");

      universal.default("notification_log", "");
      universal.default("playback-mode", "play_over");
      universal.default("vol", 1);
      universal.default("pitch", 1);
      universal.default("monitor.sink", "default");
      universal.default("vb.sink", "default");
      universal.default("has_setup", false);
      universal.default("theme", "default");
      universal.default("profile", "Default");
      universal.default("repos.community", JSON.stringify([]));

      if (!universal.load("welcomed")) {
        universal.sendToast("Welcome to Freedeck.");
        universal.CLU("Boot:Handler:Data", "Welcomed user.");
        universal.save("welcomed", "true");
      }

      universal.CLU("Boot:Handler:Data", "Saved TempLoginID.");
      universal.save("tempLoginID", parsed.tempLoginID);

      universal.keys.id = "keys";
      universal.CLU("Boot:Handler:Data", "Forcefully setting keys ID.");
      if (!document.querySelector("#keys")) {
        universal.CLU("Boot:Handler:Data", "Appending/Creating keys to body.");
        document.body.appendChild(universal.keys);
      }

      universal.notibar.id = "snackbar";
      universal.CLU("Boot:Handler:Data", "Forcefully setting notibar ID.");
      if (!document.querySelector("#snackbar")) {
        universal.CLU(
          "Boot:Handler:Data",
          "Appending/Creating notibar to body.",
        );
        document.body.appendChild(universal.notibar);
      }

      universal.send(universal.events.information, { apiVersion: "2" });
      universal.CLU(
        "Boot:Handler:Data",
        "Identified ourselves as Companion APIv2.",
      );

      universal.repositoryManager.unofficial =
        universal.loadObj("repos.community") || [];
      universal.CLU("Boot:Handler:Data", "Setup unofficial repositories.");

      universal.CLU("Boot:Handler:Data", "Setting up plugins for Tile Editor.");
      for (const plugin of Object.keys(universal.plugins)) {
        const plug = universal.plugins[plugin];
        for (const type of plug.types) {
          universal.CLU(
            "Boot:Handler:Data",
            `Type: ${type.name} -> ${plug.name} (aka. ${plug.id})`,
          );
          universal._tyc.set(type, plug);
        }
      }

      if (user === "Companion") {
        handler();
        universal.CLU("Boot:Handler:Data", "Native handler created.");
      }

      generic();
      universal.CLU(
        "Boot:Handler:Data",
        "Generic native handler created. Resolving as we're finished here.",
      );
      ress(true);
    });
  });
}
