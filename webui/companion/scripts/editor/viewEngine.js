
const editorButton = document.querySelector("#editor-btn");
const view_audioOnly = document.querySelector("#audio-only");
const view_macroOnly = document.querySelector("#macro-only");
const view_pluginsOnly = document.querySelector("#plugins-only");
const view_systemOnly = document.querySelector("#system-only");
const view_noneOnly = document.querySelector("#none-only");
const view_profileOnly = document.querySelector("#profile-only");

const selectableViews = [
  "audio",
  "plugins",
  "system",
  "none",
  "profile",
  "macro",
];

const openViewTop = (view) => {
  for (const v of selectableViews) {
    document.querySelector(`#${v}-only`).style.display = "none";
  }
  document.querySelector(`#${view}-only`).style.display = "flex";
  editorButton.dataset.state = `o ${view}`;
};

const closeAllViews = () => {
  for (const v of selectableViews) {
    document.querySelector(`#${v}-only`).style.display = "none";
  }
  editorButton.dataset.state = "c";
};

export {
  openViewTop,
  closeAllViews,
};