const express = require("express");
const path = require("node:path");
const router = express.Router();

// User data
router.use("/sounds", express.static(path.resolve("user-data/sounds")));
router.use("/icons", express.static(path.resolve("user-data/icons")));

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
