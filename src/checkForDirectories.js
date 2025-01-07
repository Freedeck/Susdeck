const fs = require("node:fs");
const path = require("node:path");
const debug = require(path.resolve("./src/utils/debug.js"));

function makeIfNotExists(path) {
  if(!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
  debug.log(`Created ${path}`, "Migration");
}

function removeIfExists(path) {
  if(fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true });
  }
  debug.log(`Removed ${path}`, "Migration");
}

makeIfNotExists("plugins");
removeIfExists("src/public/dist");
removeIfExists("src/public/companion/dist");

makeIfNotExists("webui/hooks");
makeIfNotExists("webui/hooks/_themes");
makeIfNotExists("webui/hooks/_sounds");

makeIfNotExists("user-data");
makeIfNotExists("user-data/sounds");
makeIfNotExists("user-data/icons");

debug.log("Migration complete.", "Migration");