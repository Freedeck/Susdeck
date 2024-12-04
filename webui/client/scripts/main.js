import { universal } from "../../shared/universal.js";
import { UI } from "./ui.js";
import "../../shared/useAuthentication.js";

await universal.init("Main");


window.onscroll = () => {
  window.scrollTo(0, 0);
};

let touchstartX = 0;
let touchendX = 2500;

const checkDirection = () => {
  const currentPage = universal.page;
  const range = touchendX - touchstartX;
  if(document.querySelector("#lock").checked) return;
  if (range < -50) {
    // go page up
    if (UI.Pages[currentPage + 1]) {
      universal.page++;
      universal.save("page", universal.page);
      UI.reloadSounds();
      universal.sendEvent("page_change");
      universal.sendEvent("animate_page", "automated", "left");
    } else {
      /* empty */
    }
  }
  if (range > 50) {
    // go page down
    if (UI.Pages[currentPage - 1]) {
      universal.page--;
      universal.save("page", universal.page);
      UI.reloadSounds();
      universal.sendEvent("page_change");
      universal.sendEvent("animate_page", "automated", "right");
    } else {
      /* empty */
    }
  }
};

document.addEventListener("keydown", (ev) => {
  if (ev.key === "ArrowLeft") {
    if (UI.Pages[universal.page - 1]) {
      universal.page--;
      universal.save("page", universal.page);
      universal.uiSounds.playSound("page_down");
      UI.reloadSounds();
      universal.sendEvent("page_change");
      universal.sendEvent("animate_page", "automated", "right");
    }
  }
  if (ev.key === "ArrowRight") {
    if (UI.Pages[universal.page + 1]) {
      universal.page++;
      universal.save("page", universal.page);
      universal.uiSounds.playSound("page_up");
      UI.reloadSounds();
      universal.sendEvent("page_change");
      universal.sendEvent("animate_page", "automated", "left");
    }
  }
});

if (universal.config.profile !== universal.load("profile")) {
  universal.save("profile", universal.config.profile);
  universal.page = 0;
  universal.save("page", universal.page);
  UI.reloadSounds();
}

const lcfg = universal.lclCfg();
document.documentElement.style.setProperty(
  "--font-size",
  `${lcfg["font-size"]}px`,
);
document.documentElement.style.setProperty(
  "--tile-width",
  `${lcfg.buttonSize}rem`,
);
document.documentElement.style.setProperty(
  "--tile-height",
  `${lcfg.buttonSize}rem`,
);

let tc = "repeat(5, 2fr)";
if (lcfg.tileCols) tc = tc.replace("5", lcfg.tileCols);
document.documentElement.style.setProperty("--tile-columns", tc);

window.addEventListener("touchstart", (e) => {
  touchstartX = e.changedTouches[0].screenX;
});

window.addEventListener("mousedown", (e) => {
  touchstartX = e.screenX;
});

document.addEventListener("mouseup", (e) => {
  touchendX = e.screenX;
  checkDirection();
});

document.addEventListener("touchend", (e) => {
  touchendX = e.changedTouches[0].screenX;
  checkDirection();
});

const versionDisplay = document.querySelector("#version");

if (versionDisplay) {
  versionDisplay.innerText = `${universal._information.version.human}`;
}

const downEvent = (ev) => {};

const fdSettingsButton = document.querySelector("#fd-settings-button");

fdSettingsButton.onmousedown = downEvent;
fdSettingsButton.ontouchstart = downEvent;
