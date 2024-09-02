const fs = require("node:fs");

if (!fs.existsSync("plugins")) {
  console.log("Creating plugins directory...");
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
