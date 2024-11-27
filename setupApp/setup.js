module.exports = () => {
  return new Promise((resolve, reject) => {
    const http = require("node:http");
    const path = require("node:path");
    const express = require("express");
    const save = require("./setupHandler");
    const app = express();
    const server = http.createServer(app);

    const authToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    app.use(express.static(path.resolve("setupApp/public")));

    require(path.resolve("src/makeWindow.js"))(
      `http://localhost:5757/?a=${authToken}`,
      false,
      850,
      550,
      true,
    );
    console.log(
      `Can't see the window? Open your browser and go to http://localhost:5757/?a=${authToken} .`,
    );
    app.use(express.json());
    let a = false;

    app.get("/stat", (req, res) => {
      res.send(a);
    });

    app.post("/BYE", (req, res) => {
      if (req.headers.authorization === `Freedeck! ${authToken}`) {
        console.log("Setup wizard closed.");
        res.send({ bye: true });
        server.close();
      }
    });

    app.post("/save", (req, res) => {
      if (req.headers.authorization === `Freedeck! ${authToken}`) {
        save(
          req.body.port,
          req.body.screensaverActivationTime,
          false,
          req.body.useAuth,
          req.body.iconCountPerPage,
          req.body.passwd,
        );
        a = true;
        res.send({ saved: true });
        resolve();
      }
    });

    server.listen(5757, () => {
      console.log(
        "Setup wizard server listening on port 5757. Sending token to wizard.",
      );
    });
  });
};
