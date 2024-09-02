const child = require("node:child_process");
const path = require("node:path");
const os = require("node:os");

let state = false;

const conni = setInterval(() => {
  console.log("Waiting for NativeBridge to start...");
  fetch("http://localhost:5756/volume/apps").then(res=>res.json()).then(data=>{
    state = true;
    console.log("NativeBridge has been started.");
    clearInterval(conni);
  }).catch(err=>{
    state = false;
  });
}, 500);

const runningLoop = setInterval(() => {
  fetch("http://localhost:5756/volume/apps").then(res=>res.json()).then(data=>{
  }).catch(err=>{
    console.log("NativeBridge has unexpectedly died.");
    run();
  });
}, 500);

const killAll = () => {
  try {
    child.execSync("taskkill /im nbui.exe /f");
  } catch(e) {}
}

const run = () => {
  killAll();

  const sp = child.spawn(path.resolve(`${os.homedir}`, 'Documents/Freedeck/nbui.exe'), {

  });

  sp.stdout.on("data", (data) => {
  });

  sp.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  sp.on("exit", (code) => {
    if (state) {
      console.log("NativeBridge has been closed.");
      killAll();
      run();
    }
  });
}

run();

process.on("exit", () => {
  killAll();
});