const fs = require("node:fs");
const path = require("node:path");
const debug = require(path.resolve("./src/utils/debug.js"));

if (!fs.existsSync("plugins")) {
  debug.log("Creating plugins directory...", "Migration");
  fs.mkdirSync("plugins");
}


if(fs.existsSync("src/public/dist")) {
  debug.log("Found old webpack build. Cleaning up...", "Migration");
  fs.rmSync("src/public/dist", { recursive: true });
}

if(fs.existsSync("src/public/companion") && fs.existsSync("src/public/companion/dist")) {
  debug.log("Found old companion build. Cleaning up...", "Migration");
  fs.rmSync("src/public/companion/dist", { recursive: true });
}

debug.log("Migration complete.", "Migration");