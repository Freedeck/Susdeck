const fs = require("node:fs");
const path = require("node:path");
const folders = [
  "icons",
  "sounds",
  "hooks",
  "plugin-views",
  "themes",
  "soundpacks"
]
if(!fs.existsSync(path.resolve("user-data"))) fs.mkdirSync(path.resolve("user-data"));
for(const folder of folders) {
  if(!fs.existsSync(path.resolve(`user-data/${folder}`))) fs.mkdirSync(path.resolve(`user-data/${folder}`));
}