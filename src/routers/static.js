const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const router = express.Router();

// User data
router.use("/sounds", express.static(path.resolve("user-data/sounds")));
router.use("/icons", express.static(path.resolve("user-data/icons")));

router.get("/user-report", (req, res) => {
  const start = Date.now();
  const report = [fs.readdirSync(path.resolve("user-data/sounds")), fs.readdirSync(path.resolve("user-data/icons"))];
  res.send({ report, time: Date.now() - start, start });
})

// Plugins
router.use("/hooks", express.static(path.resolve("webui/hooks")));

// Front-end
router.use("/", express.static(path.resolve("webui/client")));
router.use("/companion", express.static(path.resolve("webui/companion")));
router.use("/common", express.static(path.resolve("webui/common")));

// Webpack
router.use("/app", express.static(path.resolve("webui/app")));
router.use("/app/shared", express.static(path.resolve("webui/shared")));

module.exports = router;
