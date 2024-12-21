const fs = require("node:fs");
const path = require("node:path");
const debug = require("$/debug");

debug.log("Gathering migrations...", "Migration");
for(const file of fs.readdirSync(path.resolve("./src/migrations"))) {
  debug.log(`Running migration ${file}...`, "Migration");
  require(path.resolve(`./src/migrations/${file}`));
};

if (!fs.existsSync("plugins")) {
  debug.log("Creating plugins directory...", "Migration");
  fs.mkdirSync("plugins");
}


if(fs.existsSync("src/public/dist")) {
  debug.log("Found old webpack build. Cleaning up...", "Migration");
  fs.rmSync("src/public/dist", { recursive: true });
}





debug.log("Migration complete.", "Migration");