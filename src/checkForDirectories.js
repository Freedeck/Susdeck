const fs = require("node:fs");
const path = require("node:path");
const debug = require(path.resolve("./src/utils/debug.js"));

if (!fs.existsSync("plugins")) {
  deblug.log("Creating plugins directory...", "Migration");
  fs.mkdirSync("plugins");
}

if (
  fs.existsSync("src/public/us-icons") ||
  fs.existsSync("src/public/sounds")
) {
  console.log(
    "There is a new file structure! Freedeck will now migrate your folders over.",
  );
  if (!fs.existsSync("user-data")) {
    fs.mkdirSync("user-data");
  }
  if (fs.existsSync("src/public/us-icons")) {
    fs.renameSync("src/public/us-icons", "user-data/icons");
  }
  if (fs.existsSync("src/public/sounds")) {
    fs.renameSync("src/public/sounds", "user-data/sounds");
  }
}

if (!fs.existsSync("user-data/hooks")) {
  if (!fs.existsSync("user-data")) fs.mkdirSync("user-data");
  fs.mkdirSync("user-data/hooks");
}

if (!fs.existsSync("user-data/sounds")) {
  if (!fs.existsSync("user-data")) fs.mkdirSync("user-data");
  fs.mkdirSync("user-data/sounds");
}

if (!fs.existsSync("user-data/icons")) {
  if (!fs.existsSync("user-data")) fs.mkdirSync("user-data");
  fs.mkdirSync("user-data/icons");
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