const express = require("express");
const router = express.Router();

const handoffData = {
  genTime: Date.now(),
  token: `${Math.random().toString(36).substring(2, 15)}@h${Math.random().toString(36).substring(2, 15)}`,
  hasAccessed: false,
};

router.get("/get-token", (req, res) => {
  if (handoffData.genTime + 60000 < Date.now()) {
    handoffData.token = `${Math.random().toString(36).substring(2, 15)}@h${Math.random().toString(36).substring(2, 15)}`;
    handoffData.genTime = Date.now();
    handoffData.hasAccessed = false;
  }
  if (!handoffData.hasAccessed) {
    // handoffData.hasAccessed = true;
    return res.send(handoffData.token);
  }
  res.send("0".repeat(handoffData.token.length));
});

router.get("/:token/reload-plugins", (req, res) => {
  if (req.params.token !== handoffData.token)
    res.send({ status: "error", message: "Invalid token" });
  plugins.reload();
  notifMan.add("handoff-api", "reload-plugins");
  res.send({ status: "success", message: "Reloaded plugins." });
});

router.get("/:token/notify/:data", (req, res) => {
  if (req.params.token !== handoffData.token)
    res.send({ status: "error", message: "Invalid token" });
  notifMan.add("Handoff", req.params.data);
  res.send({ status: "success", message: "Sent notification." });
});

module.exports = router;
