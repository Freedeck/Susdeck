import gridItemDrag from "./lib/gridItemDrag.js";
import { UI } from "../../client/scripts/ui.js";
import { universal } from "../../shared/universal.js";
import "./sidebar.js";
import "../../shared/useAuthentication.js"; // Only for authenticated pages
import "./uploadsHandler.js";
import "./editor/loader.js";
import "./contextMenu.js";
import { makeThanks } from "./changelog/create.js";

await universal.init("Companion");

universal.connectionTest = true;

const editorButton = document.querySelector("#editor-btn");
const view_audioOnly = document.querySelector("#audio-only");
const view_macroOnly = document.querySelector("#macro-only");
const view_pluginsOnly = document.querySelector("#plugins-only");
const view_systemOnly = document.querySelector("#system-only");
const view_noneOnly = document.querySelector("#none-only");
const view_profileOnly = document.querySelector("#profile-only");

gridItemDrag.setFilter("#keys .button");
gridItemDrag.unmovableClass = ".builtin, .unset";
gridItemDrag.setContext(universal.keys);
universal.listenFor("page_change", () => {
  gridItemDrag.setContext(universal.keys);
});
const mtNextPage = document.querySelector(".mt-next-page");
const mtPrevPage = document.querySelector(".mt-prev-page");
gridItemDrag.on("drop", (event, origIndex, targIndex) => {
  mtNextPage.style.display = "none";
  mtPrevPage.style.display = "none";

  if (
    event.target.classList.contains("mt-next-page") ||
    event.target.classList.contains("mt-prev-page")
  ) {
    const wanted = event.target.classList.contains("mt-next-page");
    // true -> next, false -> prev

    universal.page += wanted ? 1 : -1;
    universal.save("page", universal.page);
    universal.sendEvent("page_change");

    // BUT, we need to move the item to the highest or lowest index
    const originalIndex =
      Number.parseInt(origIndex) +
      (universal.page < 0 ? 1 : 0) +
      (universal.page > 0
        ? universal.config.iconCountPerPage * universal.page
        : 0);
    let targetIndex = 0;

    if (wanted) {
      // We need to find the first empty slot
      for (const item of universal.config.profiles[universal.config.profile]) {
        if (item.pos === targetIndex) {
          targetIndex++;
        } else {
          break;
        }
      }

      // We need to move the item to the targetIndex
    } else {
      // todo
    }

    const changed = document.querySelector(`#keys .button.k-${origIndex}`);

    universal.send(universal.events.companion.move_key, {
      name: changed.getAttribute("data-name"),
      item: changed.getAttribute("data-interaction"),
      newIndex: targetIndex,
      oldIndex: originalIndex,
    });

    UI.reloadSounds();

    return;
  }

  const originalIndex =
    Number.parseInt(origIndex) +
    universal.page * Number.parseInt(universal.config.iconCountPerPage);
  const targetIndex =
    Number.parseInt(targIndex) +
    universal.page * Number.parseInt(universal.config.iconCountPerPage);
  const ev = universal.page < 0 ? 1 : 0;

  const changed = document.querySelector(`#keys .button.k-${origIndex}`);
  changed.classList.remove(`k-${origIndex}`);
  changed.classList.add(`k-${targIndex}`);
  event.target.classList.remove(`k-${targIndex}`);
  event.target.classList.add(`k-${origIndex}`);

  const targetInter = JSON.parse(changed.getAttribute("data-interaction"));
  universal.send(universal.events.companion.move_key, {
    name: changed.getAttribute("data-name"),
    item: changed.getAttribute("data-interaction"),
    newIndex: targetIndex + ev,
    oldIndex: originalIndex + ev,
  });
  changed.pos = targetIndex;
  changed.setAttribute("data-interaction", JSON.stringify(targetInter));
});

gridItemDrag.on("dragging", (e) => {
  document.querySelector("#keys").appendChild(mtNextPage.cloneNode(true));
  document.querySelector("#keys").appendChild(mtPrevPage.cloneNode(true));
  // copy the next and prev buttons to the keys container

  mtNextPage.style.display = "flex";
  mtPrevPage.style.display = "flex";
});

const leftSidebar = document.querySelector(".sidebar");
const toggleSidebarContainer = document.querySelector(".toggle-sidebar");
const toggleSidebarButton = document.querySelector(".toggle-sidebar button");

toggleSidebarButton.onclick = (ev) => {
  if (leftSidebar.style.display === "flex") {
    if (!ev.target.dataset.nosound) universal.uiSounds.playSound("slide_close");
    leftSidebar.style.animation = "sidebar-slide-out 0.5s";
    leftSidebar.style.animationFillMode = "forward";
    toggleSidebarButton.style.transform = "rotate(0deg)";
    toggleSidebarContainer.style.left = "0";
    setTimeout(() => {
      leftSidebar.style.display = "none";
    }, 500);
  } else {
    if (!ev.target.dataset.nosound) universal.uiSounds.playSound("slide_open");
    leftSidebar.style.display = "flex";
    leftSidebar.style.animation = "sidebar-slide-in 0.5s";
    toggleSidebarButton.style.transform = "rotate(180deg)";
    toggleSidebarContainer.style.left = "calc(11.5%)";
  }
};


/**
 * Load data into editor
 * @param {*} itm List of data objects (like {a:2,b:2})
 */
function loadData(itm) {
  document.querySelector("#editor-data").innerHTML = "";
  document.querySelector("#system-select").innerHTML = "";
  for (const key of Object.keys(itm)) {
    const elem = document.createElement("input");
    elem.type = "text";
    elem.placeholder = key;
    elem.value = itm[key];
    elem.className = "editor-data";
    elem.id = key;
    const label = document.createElement("label");
    label.class = "editordata-removable";
    label.innerText = key;
    label.appendChild(elem);
    document.querySelector("#editor-data").appendChild(label);
  }
}

universal.loadEditorData = loadData;

function setEditorData(key, value, int) {
  if (document.querySelector(`.editor-data#${key}`)) {
    document.querySelector(`.editor-data#${key}`).value = value;
  } else {
    const elem = document.createElement("input");
    elem.type = "text";
    elem.placeholder = key;
    elem.value = value;
    elem.className = "editor-data";
    elem.id = key;
    const label = document.createElement("label");
    label.class = "editordata-removable";
    label.innerText = key;
    label.appendChild(elem);
    document.querySelector("#editor-data").appendChild(label);
  }
  int.data[key] = value;
}

universal.setEditorData = setEditorData;

const selectableViews = ["audio", "plugins", "system", "none", "profile", "macro"];

const openViewCloseAll = (view) => {
  for (const v of selectableViews) {
    document.querySelector(`#${v}-only`).style.display = "none";
  }
  document.querySelector(`#${view}-only`).style.display = "flex";
  editorButton.dataset.state = `o ${view}`;
};

/**
 * Edit a tile
 * @param {*} e HTML Element corresponding to the button that we grabbed context from
 */
function editTile(e) {
  universal.uiSounds.playSound("editor_open");
  const interactionData = JSON.parse(
    e.srcElement.getAttribute("data-interaction")
  );
  editorButton.dataset.state = "opening";
  if (toggleSidebarContainer.style.left !== "0px")
    toggleSidebarButton.dataset.nosound = "true";
  if (toggleSidebarContainer.style.left !== "0px") toggleSidebarButton.click();
  if (document.querySelector(".contextMenu"))
    document.querySelector(".contextMenu").style.display = "none";
  for(const el of document.querySelectorAll(".plugin-view")) {
    el.style.display = "none";
  }
  document.querySelector("#advanced-view").style.display = "none";
  document.querySelector("#sidebar").style.right = "-20%";
  document.querySelector("#editor").style.display = "block";
  editorButton.innerText = e.srcElement.dataset.name;
  editorButton.style.backgroundImage = "";
  if (interactionData.data.icon)
    editorButton.style.backgroundImage = `url("${interactionData.data.icon}")`;
  if (interactionData.data.color)
    editorButton.style.backgroundColor = interactionData.data.color;
  document.querySelector("#color").value = interactionData.data.color;
  document.querySelector("#name").value = e.srcElement.dataset.name;
  editorButton.setAttribute("data-pre-edit", e.srcElement.dataset.name);
  editorButton.setAttribute(
    "data-interaction",
    e.srcElement.getAttribute("data-interaction")
  );
  for (const a of document.querySelectorAll(".spiaction")) {
    a.style.display = "none";
    a.classList.remove("spi-active");
    if(!interactionData.plugin) continue;
    if (a.dataset.plugin === interactionData.plugin) {
      if (a.dataset.type === interactionData.type)
        a.classList.add("spi-active");
      a.style.display = "block";
    }
  }
  document.querySelector("#type").value = interactionData.type;
  if (interactionData.plugin === "Freedeck" || !interactionData.plugin) {
    document.querySelector("#plugin").style.display = "none";
    document.querySelector('label[for="plugin"]').style.display = "none";
  } else {
    document.querySelector('label[for="plugin"]').style.display = "block";
    document.querySelector("#plugin").style.display = "block";
    document.querySelector("#plugin").value =
      interactionData.plugin || "Freedeck";
  }
  document.querySelector("#editor-back").style.display = "none";
  view_audioOnly.style.display = "none";
  view_pluginsOnly.style.display = "none";
  view_systemOnly.style.display = "none";
  view_noneOnly.style.display = "none";
  view_profileOnly.style.display = "none";
  view_macroOnly.style.display = "none";
  document.querySelector('.spi-actions-disabled').style.display = "none";
  document.querySelector('.spi-actions-notfound').style.display = "none";
  if (
    interactionData.type.includes("fd.") &&
    interactionData.type !== "fd.none"
  ) {
    document.querySelector("#editor-back").style.display = "";
  } else document.querySelector("#editor-back").style.display = "none";
  if (interactionData.type === "fd.sound") {
    document.querySelector("#audio-file").innerText = interactionData.data.file;
    // document.querySelector("#audio-path").innerText = interactionData.data.path;
    openViewCloseAll("audio");
  } else {
    if (!interactionData.type.startsWith("fd.")) {
      for (const el of document.querySelectorAll(".spiaction")) {
        if (el.classList.contains(`pl-${interactionData.plugin}`))
          el.style.display = "block";
      }
      for (const el of document.querySelectorAll(".spiback")) {
        el.style.display = "block";
      }
      for (const el of document.querySelectorAll(".spiplugin")) {
        el.style.display = "none";
      }

      for(const el of document.querySelectorAll('.spi-actions-disabled-id')) {
        el.innerText = interactionData.plugin;
      }
      for(const el of document.querySelectorAll('.spi-actions-notfound-type')) {
        el.innerText = interactionData.type;
      }
      if(!document.querySelector(`.spi[data-type="${interactionData.type}"]`)) {
        document.querySelector('.spi-actions-notfound').style.display = "block"; 
      }
      if(universal.plugins[interactionData.plugin] === undefined) {
        document.querySelector('.spi-actions-disabled').style.display = "block";
      }
    } else {
      for (const el of document.querySelectorAll(".spiaction, .spiback")) {
        el.style.display = "none";
      }
      for (const el of document.querySelectorAll(".spiplugin")) {
        el.style.display = "block";
      }
    }
    openViewCloseAll("plugins");
    if (interactionData.type === "fd.macro_text") {
      openViewCloseAll("macro");
      if(interactionData.data.macro) {
        document.querySelector("#macro-type").value = 'text';
        document.querySelector("#macro-macro").value = interactionData.data.macro;
      }
    }
    if (interactionData.type === "fd.macro") {
      openViewCloseAll("macro");
      if(interactionData.data.macro) {
        document.querySelector("#macro-type").value = 'macro';
        document.querySelector("#macro-macro").value = interactionData.data.macro;
      }
    }
    if (interactionData.type.startsWith("fd.sys")) {
      openViewCloseAll("system");

      universal.nbws.send("get_apps", "");
      universal.nbws.once("apps", (rawData) => {
        const data = rawData;
        const int = JSON.parse(editorButton.getAttribute("data-interaction"));

        const select = document.querySelector("#system-select");
        select.innerHTML = "";

        for (const app of data) {
          const option = document.createElement("option");
          let friendly =
            app.friendly !== "" ? `${app.friendly} (${app.name})` : app.name;
          if (app.name === "_fd.System") friendly = "System Volume";
          option.innerText = friendly;
          option.value = app.name;
          if (int.data?.app && int.data.app === app.name)
            option.selected = true;
          select.appendChild(option);
        }
        select.onchange = (e) => {
          const dt =
            e.srcElement.value !== "_fd.System"
              ? "fd.sys.volume"
              : "fd.sys.volume.sys";
          document.querySelector("#type").value = dt;
          int.type = dt;
          int.renderType = "slider";
          setEditorData("app", e.srcElement.value, int);
          setEditorData("min", 0, int);
          setEditorData("max", 100, int);
          setEditorData("value", 50, int);
          setEditorData("format", "%", int);
          setEditorData("direction", "vertical", int);
          editorButton.setAttribute("data-interaction", JSON.stringify(int));
        };
      });
      if (interactionData.type.startsWith("fd.sys.volume")) {
        document.querySelector("#system-select").value =
          interactionData.data.app;
      }
    }
    if (interactionData.type === "fd.profile") {
      generateProfileSelect();
      document.querySelector("#eprofile-select").value =
        interactionData.data.profile;
      openViewCloseAll("profile");
    }
    if (interactionData.type === "fd.none") {
      openViewCloseAll("none");
    } else if (interactionData.plugin) {
      loadSettings(interactionData.plugin);
    }
  }
  if (interactionData.data) {
    const itm = interactionData.data;
    loadData(itm);
  }

  document.querySelector("#sbg").style.display =
    interactionData.renderType === "button"
      ? "block"
      : interactionData.renderType === "slider"
      ? "none"
      : "block";
  document.querySelector('label[for="sbg"]').style.display =
    interactionData.renderType === "button"
      ? "block"
      : interactionData.renderType === "slider"
      ? "none"
      : "block";

  setCheck("#orl", "onRelease", interactionData);
  setCheck("#lp", "longPress", interactionData);
  setCheck("#sbg", "showBg", interactionData);
  setCheck("#nbo", "noBorder", interactionData);
  setCheck("#nbr", "noRounding", interactionData);
  setCheck("#nsh", "noShadow", interactionData);

  document.querySelector("#lp").style.display =
    interactionData.renderType === "slider" ? "none" : "block";
  document.querySelector('label[for="lp"]').style.display =
    interactionData.renderType === "slider" ? "none" : "block";
  // make it fade in
  document.querySelector("#editor-div").style.animation =
    "editor-pull-down 0.5s";
  toggleSidebarButton.style.display = "none";

  universal.sendEvent("editTile", interactionData);
}

universal.editTile = editTile;

document.querySelector("#editor-back").onclick = () => {
  document.querySelector("#editor-back").style.display = "none";
  view_audioOnly.style.display = "none";
  view_pluginsOnly.style.display = "none";
  view_systemOnly.style.display = "none";
  view_noneOnly.style.display = "none";
  view_profileOnly.style.display = "none";
  view_macroOnly.style.display = "none";
  openViewCloseAll("none");
};

function setCheck(id, key, interaction) {
  document.querySelector(id).checked = interaction.data[key] === "true";
}

function createEditorCheckbox(selector, dataKey) {
  document.querySelector(selector).addEventListener("click", (e) => {
    const int = JSON.parse(editorButton.getAttribute("data-interaction"));
    if (!int.data[dataKey]) int.data[dataKey] = true;
    else int.data[dataKey] = !int.data[dataKey];
    editorButton.setAttribute("data-interaction", JSON.stringify(int));
    loadData(int.data);
    document.querySelector(selector).checked = int.data[dataKey];
  });
}

createEditorCheckbox("#sbg", "showBg");
createEditorCheckbox("#nbo", "noBorder");
createEditorCheckbox("#nbr", "noRounding");
createEditorCheckbox("#nsh", "noShadow");
createEditorCheckbox("#orl", "onRelease");
createEditorCheckbox("#lp", "longPress");

document.querySelector("#change-pl-settings").onclick = () => {
  const plugin = document.querySelector("#plugin").value;
  const settings = {};
  for (const el of document.querySelectorAll(".pl-settings-item")) {
    const key = el.querySelector("div").innerText;
    if (el.querySelector(".pl-settings-array")) {
      const array = [];
      for (const item of el.querySelectorAll(".pl-settings-array input")) {
        array.push(item.value);
      }
      settings[key] = array;
    } else {
      settings[key] = el.querySelector("input").value;
    }
  }
  universal.send(universal.events.companion.plugin_set_all, {
    plugin,
    settings,
  });
};

const loadSettings = (plugin) => {
  const settingsElement = document.querySelector("#pl-settings");
  settingsElement.innerHTML = "";
  document.querySelector("#pl-title").innerText = "Plugin Settings";
  if (!universal.plugins[plugin]) {
    settingsElement.innerHTML =
      "<h2>The plugin for this Tile is missing.</h2><p>Please re-enable or download it.</p>";
    document.querySelector("#change-pl-settings").style.display = "none";
    return;
  }
  document.querySelector("#change-pl-settings").style.display = "block";
  document.querySelector(
    "#pl-title"
  ).innerText = `${universal.plugins[plugin].name} Settings`;
  const settings = universal.plugins[plugin].Settings;
  for (const key of Object.keys(settings)) {
    const value = settings[key];
    const container = document.createElement("div");
    container.classList.add("pl-settings-item");
    const title = document.createElement("div");
    title.innerText = key;
    container.appendChild(title);
    if (Array.isArray(value) || typeof value === "object") {
      const arrayContainer = document.createElement("div");
      arrayContainer.classList.add("pl-settings-array");
      let i = 0;
      for (const val of value) {
        const item = document.createElement("input");
        item.type = key !== "password" || key !== "token" ? "text" : "password";
        item.id = key;
        item.dataset.index = i;
        item.value = val;
        arrayContainer.appendChild(item);
        i++;
      }
      container.appendChild(arrayContainer);
    } else {
      const item = document.createElement("input");
      item.type = key !== "password" || key !== "token" ? "text" : "password";
      item.id = key;
      item.value = value;
      container.appendChild(item);
    }
    settingsElement.appendChild(container);
  }
};

const generateProfileSelect = () => {
  const select = document.querySelector("#eprofile-select");
  select.innerHTML = "";
  for (const profile of Object.keys(universal.config.profiles)) {
    const option = document.createElement("option");
    option.innerText = profile;
    option.value = profile;
    select.appendChild(option);
  }
  select.onchange = (e) => {
    const int = JSON.parse(editorButton.getAttribute("data-interaction"));
    int.data.profile = e.srcElement.value;
    editorButton.setAttribute("data-interaction", JSON.stringify(int));
    loadData(int.data);
  };
};

document.querySelector("#spiback").onclick = (e) => {
  document.querySelector('.spi-actions-disabled').style.display = "none";
  for (const el of document.querySelectorAll(".spiaction, .spiback")) {
    el.style.display = "none";
  }
  for (const el of document.querySelectorAll(".spiplugin")) {
    el.style.display = "block";
  }
};

document.querySelector("#spiav").onclick = () => {
  const interaction = JSON.parse(editorButton.getAttribute("data-interaction"));
  if (!interaction.data || Object.keys(interaction.data).length === 0) {
    document.querySelector("#tiledata").style.display = "none";
  } else {
    document.querySelector("#tiledata").style.display = "flex";
  }
  if (document.querySelector("#advanced-view").style.display === "block")
    document.querySelector("#advanced-view").style.display = "none";
  else document.querySelector("#advanced-view").style.display = "block";
};

const spiContainer = document.querySelector("#spi-actions");
for (const type of universal._tyc.keys()) {
  if (!document.querySelector(`.rpl-${type.pluginId}`)) {
    const element = document.createElement("div");
    element.classList.add(`rpl-${type.pluginId}`);
    element.classList.add("plugin-item");
    element.classList.add("spi");
    element.classList.add("spiplugin");
    element.innerText = type.display;
    element.onclick = (e) => {
      for (const el of document.querySelectorAll(
        `.spiaction.pl-${type.pluginId}`
      )) {
        el.style.display = "block";
      }

      for (const el of document.querySelectorAll(".spiback")) {
        el.style.display = "block";
      }

      for (const el of document.querySelectorAll(".spiplugin")) {
        el.style.display = "none";
      }
    };
    spiContainer.appendChild(element);
  }
  const element = document.createElement("div");
  element.classList.add(`pl-${type.pluginId}`);
  element.classList.add("plugin-item");
  element.classList.add("spi");
  element.classList.add("spiaction");
  element.setAttribute("data-type", type.type);
  element.setAttribute("data-plugin", type.pluginId);
  element.setAttribute("data-rt", type.renderType);
  element.setAttribute("data-template", JSON.stringify(type.templateData));
  element.innerText = `${type.display}: ${type.name}`;
  element.onclick = (e) => {
    const interaction = JSON.parse(
      editorButton.getAttribute("data-interaction")
    );
    const type = e.target.getAttribute("data-type");
    const plugin = e.target.getAttribute("data-plugin");
    const renderType = e.target.getAttribute("data-rt");
    const templateData = JSON.parse(e.target.getAttribute("data-template"));

    if (interaction.plugin) {
      document
        .querySelector(
          `.spi[data-type="${interaction.type}"][data-plugin="${interaction.plugin}"]`
        )
        .classList.remove("spi-active");
    }
    interaction.type = type;
    interaction.plugin = plugin;
    interaction.renderType = renderType;
    interaction.data = { ...interaction.data, ...templateData };
    document
      .querySelector(`.spi[data-type="${type}"][data-plugin="${plugin}"]`)
      .classList.add("spi-active");
    editorButton.setAttribute("data-interaction", JSON.stringify(interaction));
    document.querySelector("#type").value = type;
    document.querySelector("#plugin").value = plugin;
    loadData(interaction.data);
    loadSettings(interaction.plugin);
  };
  spiContainer.appendChild(element);
}
generateProfileSelect();

document.querySelector("#upload-sound").onclick = () => {
  document.querySelector("#upload-sound").disabled = true;
  universal.uiSounds.playSound("int_confirm");
  const ito = JSON.parse(editorButton.dataset.interaction);

  universal._Uploads_View = 0;
  universal.vopen("library");
  universal._libraryOnload = () => {
    setupLibraryFor("sound");
  };
  universal._libraryOnpaint = () => {
    if (
      ito.data.file &&
      document.querySelector(`.upload[data-name='${ito.data.file}']`)
    )
      document
        .querySelector(`.upload[data-name='${ito.data.file}']`)
        .classList.add("glow");
    for (const el of document.querySelectorAll(".uploads-0 .upload")) {
      el.onclick = () => {
        for (const el of document.querySelectorAll(".upload")) {
          el.classList.remove("glow");
        }
        el.classList.add("glow");
        universal._Uploads_Select(el.dataset.name);
      };
    }
    document.querySelector(".save-changes").onclick = () => {
      universal._libraryOnload = () => {
        setupLibraryFor("");
      };
      universal._libraryOnpaint = undefined;
      universal.vclose();
    };
  };
  universal._Uploads_Select = (itm) => {
    const interaction = JSON.parse(
      editorButton.getAttribute("data-interaction")
    );
    interaction.data.file = itm;
    interaction.data.path = "/sounds/";
    editorButton.setAttribute("data-interaction", JSON.stringify(interaction));
    loadData(interaction.data);
    document.querySelector("#file.editor-data").value = itm;
    document.querySelector("#path.editor-data").value = "/sounds/";
    document.querySelector("#audio-file").innerText = itm;
    // document.querySelector("#audio-path").innerText = "/sounds/";

    universal.uiSounds.playSound("int_yes");
  };
};

document.querySelector("#none-audio").onclick = (e) => {
  const int = JSON.parse(editorButton.getAttribute("data-interaction"));
  int.type = "fd.sound";
  int.data.file = "Unset.mp3";
  int.data.path = "/sounds/";
  editorButton.setAttribute("data-interaction", JSON.stringify(int));
  document.querySelector("#audio-file").innerText = "Unset.mp3";
  document.querySelector("#type").value = "fd.sound";
  // document.querySelector("#audio-path").innerText = "/sounds/";
  openViewCloseAll("audio");
};

document.querySelector("#none-profiles").onclick = (e) => {
  const int = JSON.parse(editorButton.getAttribute("data-interaction"));
  int.type = "fd.profile";
  int.data.profile = "Default";
  editorButton.setAttribute("data-interaction", JSON.stringify(int));
  document.querySelector("#type").value = "fd.profile";
  generateProfileSelect();
  document.querySelector("#eprofile-select").value = int.data.profile;
  openViewCloseAll("profile");
};

universal.nbws.on("apps", (rawData) => {
  const data = rawData;
  const int = JSON.parse(editorButton.getAttribute("data-interaction"));
  const select = document.querySelector("#system-select");
  select.innerHTML = "";

  for (const app of data) {
    const option = document.createElement("option");
    let friendly =
      app.friendly !== "" ? `${app.friendly} (${app.name})` : app.name;
    if (app.name === "_fd.System") friendly = "System Volume";
    option.innerText = friendly;
    option.value = app.name;
    if (int?.data?.app && int.data.app === app.name) option.selected = true;
    select.appendChild(option);
  }

  select.onchange = (e) => {
    const int = JSON.parse(editorButton.getAttribute("data-interaction"));
    const dt =
      e.srcElement.value !== "_fd.System"
        ? "fd.sys.volume"
        : "fd.sys.volume.sys";
    document.querySelector("#type").value = dt;
    int.type = dt;
    int.renderType = "slider";
    setEditorData("app", e.srcElement.value, int);
    setEditorData("min", 0, int);
    setEditorData("max", 100, int);
    setEditorData("value", 50, int);
    setEditorData("format", "%", int);
    setEditorData("direction", "vertical", int);
    editorButton.setAttribute("data-interaction", JSON.stringify(int));
  };

});

document.querySelector("#none-system").onclick = (e) => {
  universal.nbws.send("get_apps", "");
  const int = JSON.parse(editorButton.getAttribute("data-interaction"));

  int.type = "fd.sys.volume.sys";
  int.renderType = "slider";
  int.data.app = "_fd.System";
  int.data.min = 0;
  int.data.max = 100;
  int.data.value = 50;
  int.data.format = "%";
  int.data.direction = "vertical";
  editorButton.setAttribute("data-interaction", JSON.stringify(int));
  document.querySelector("#type").value = "fd.sys.volume.sys";
  openViewCloseAll("system");
};

document.querySelector("#none-macro").onclick = (e) => {
  const int = JSON.parse(editorButton.getAttribute("data-interaction"));
  int.type = "fd.macro_text";
  document.querySelector("#type").innerText = "fd.macro_text";
  editorButton.setAttribute("data-interaction", JSON.stringify(int));
  openViewCloseAll("macro")
};

document.querySelector("#macro-macro").onchange = (e) => {
  const int = JSON.parse(editorButton.getAttribute("data-interaction"));
  setEditorData("macro", e.srcElement.value, int);
  int.data.macro = e.srcElement.value;
}
document.querySelector("#macro-type").onchange = (e) => {
  const int = JSON.parse(editorButton.getAttribute("data-interaction"));
  int.type = e.srcElement.value === "text" ? "fd.macro_text" : "fd.macro";
  document.querySelector("#type").innerText = int.type;
  editorButton.setAttribute("data-interaction", JSON.stringify(int));
}


document.querySelector("#none-plugin").onclick = (e) => {
  document.querySelector('label[for="plugin"]').style.display = "block";
  document.querySelector("#plugin").style.display = "block";
  const int = JSON.parse(editorButton.getAttribute("data-interaction"));
  int.type = "fd.select";
  document.querySelector("#type").innerText = "fd.select";
  editorButton.setAttribute("data-interaction", JSON.stringify(int));
  openViewCloseAll("plugins");
};

const setupLibraryFor = (type) => {
  if (type === "icon") {
    document.querySelector("#library-view-sounds").style.display = "none";
    document.querySelector("#library-view-icons").style.display = "block";
    document.querySelector("#library-view-sounds").open = false;
    document.querySelector("#library-view-icons").open = true;
    document.querySelector(".uploads-0").style.display = "none";
    document.querySelector("#uploads-0-title").style.display = "none";
    document.querySelector(".uploads-1").style.display = "flex";
    document.querySelector("#uploads-1-title").style.display = "block";
    document.querySelector("#library > body> p").textContent =
      "Select an icon to use, or upload a new one!";
    document.querySelector("#library > body> h1").textContent =
      "Available Icons";
    document.querySelector(".save-changes").style.display = "block";
  } else if (type === "sound") {
    document.querySelector("#library-view-sounds").style.display = "block";
    document.querySelector("#library-view-icons").style.display = "none";
    document.querySelector("#library-view-sounds").open = true;
    document.querySelector("#library-view-icons").open = false;
    document.querySelector(".uploads-0").style.display = "flex";
    document.querySelector("#uploads-0-title").style.display = "block";
    document.querySelector(".uploads-1").style.display = "none";
    document.querySelector("#uploads-1-title").style.display = "none";
    document.querySelector("#library > body> p").textContent =
      "Select an sound to use, or upload a new one!";
    document.querySelector("#library > body> h1").textContent =
      "Available Sounds";
    document.querySelector(".save-changes").style.display = "block";
  } else {
    document.querySelector("#library-view-sounds").style.display = "block";
    document.querySelector("#library-view-icons").style.display = "block";
    document.querySelector("#library-view-sounds").open = false;
    document.querySelector("#library-view-icons").open = false;
    document.querySelector(".uploads-0").style.display = "flex";
    document.querySelector("#uploads-0-title").style.display = "block";
    document.querySelector(".uploads-1").style.display = "flex";
    document.querySelector("#uploads-1-title").style.display = "block";
    document.querySelector("#library > body> p").textContent =
      "Here you will find every sound or icon you've uploaded.";
    document.querySelector("#library > body> h1").textContent = "Library";
    document.querySelector(".save-changes").style.display = "none";
  }
};

document.querySelector("#upload-icon").onclick = (e) => {
  universal.uiSounds.playSound("int_confirm");
  universal._Uploads_View = 1;
  universal.vopen("library");
  const ito = JSON.parse(editorButton.dataset.interaction);
  universal._libraryOnload = () => {
    setupLibraryFor("icon");
  };
  universal._libraryOnpaint = () => {
    if (
      ito.data.icon &&
      document.querySelector(
        `.upload[data-name='${ito.data.icon.split("/icons/")[1]}']`
      )
    )
      document
        .querySelector(
          `.upload[data-name='${ito.data.icon.split("/icons/")[1]}']`
        )
        .classList.add("glow");
    for (const el of document.querySelectorAll(".uploads-1 .upload")) {
      el.onclick = () => {
        for (const el of document.querySelectorAll(".upload")) {
          el.classList.remove("glow");
        }
        el.classList.add("glow");
        universal._Uploads_Select(el.dataset.name);
      };
    }
    document.querySelector(".save-changes").onclick = () => {
      universal._libraryOnload = () => {
        setupLibraryFor("");
      };
      universal._libraryOnpaint = undefined;
      universal.vclose();
    };
  };
  universal._Uploads_Select = (itm) => {
    const interaction = JSON.parse(
      editorButton.getAttribute("data-interaction")
    );
    interaction.data.icon = `/icons/${itm}`;
    editorButton.setAttribute("data-interaction", JSON.stringify(interaction));
    editorButton.style.backgroundImage = `url("${`/icons/${itm}`}")`;
    loadData(interaction.data);
    universal.uiSounds.playSound("uploaded");
  };
};

document.querySelector("#editor-close").onclick = () => {
  universal.uiSounds.playSound("int_no");
  document.querySelector("#editor-div").style.animation = "editor-pull-up 0.5s";
  document.querySelector("#editor").style.animation = "real-fade-out 0.5s";
  document.querySelector("#sidebar").style.right = "0";
  toggleSidebarButton.style.display = "block";
  if (toggleSidebarContainer.style.left === "0px") toggleSidebarButton.click();
  setTimeout(() => {
    document.querySelector("#editor").style.animation = "";
    document.querySelector("#editor").style.display = "none";
    document.querySelector("#editor-div").style.animation =
      "editor-pull-down 0.5s";
    document.querySelector("#color").value = "#000000";
    document.querySelector("#color").dataset.has_set = "false";
    editorButton.style.backgroundColor = "";
  }, 499);
};

document.querySelector("#editor-save").onclick = () => {
  const name = document.querySelector("#name").value;
  const interaction = JSON.parse(editorButton.getAttribute("data-interaction"));
  for (const input of document.querySelectorAll(".editor-data")) {
    interaction.data[input.id] = input.value;
  }
  universal.send(universal.events.companion.edit_key, {
    name: name,
    oldName: editorButton.getAttribute("data-pre-edit"),
    interaction: interaction,
  });

  document.querySelector("#editor-close").click();
};

/**
 * Create a text input modal.
 * @param {String} title The title of the modal
 * @param {String} content The placeholder text for the input
 * @param {void} callback What to do when submitted
 */
function showEditModal(title, content, callback) {
  const modal = document.createElement("div");
  modal.className = "modal";

  const modalContent = document.createElement("div");
  modalContent.className = "modalContent";

  const modalClose = document.createElement("button");
  modalClose.innerText = "Close";
  modalClose.classList.add("modalClose");
  modalClose.onclick = () => {
    modal.remove();
  };
  modalContent.appendChild(modalClose);

  const modalTitle = document.createElement("h2");
  modalTitle.innerText = title;
  modalTitle.classList.add("modalTitle");
  modalContent.appendChild(modalTitle);

  const modalFeedback = document.createElement("div");
  modalFeedback.classList.add("modalFeedback");
  modalContent.appendChild(modalFeedback);

  const modalInput = document.createElement("input");
  modalInput.type = "text";
  modalInput.placeholder = content;
  modalInput.classList.add("modalInput_text");
  modalContent.appendChild(modalInput);

  const modalButton = document.createElement("button");
  modalButton.innerText = "Save";
  modalButton.onclick = () => {
    const returned = callback(
      modal,
      modalInput.value,
      modalFeedback,
      modalTitle,
      modalButton,
      modalInput,
      modalContent
    );
    if (returned === false) return;
    modal.remove();
  };
  modalContent.appendChild(modalButton);

  modal.appendChild(modalContent);

  document.body.appendChild(modal);
}

function showText(title, content, callback, closable = true) {
  const modal = document.createElement("div");
  modal.className = "modal";

  const modalContent = document.createElement("div");
  modalContent.classList.add("modalContent");

  if (closable) {
    const modalClose = document.createElement("button");
    modalClose.innerText = "Close";
    modalClose.classList.add("modalClose");
    modalClose.onclick = () => {
      modal.remove();
    };
    modalContent.appendChild(modalClose);
  }

  const modalTitle = document.createElement("h2");
  modalTitle.innerText = title;
  modalTitle.classList.add("modalTitle");
  modalContent.appendChild(modalTitle);

  const modalTextContent = document.createElement("div");
  modalTextContent.innerText = content;
  modalTextContent.classList.add("modalTextContent");
  modalContent.appendChild(modalTextContent);

  const modalButton = document.createElement("button");
  modalButton.innerText = "Next";
  modalButton.onclick = () => {
    modal.remove();
    callback();
  };
  modalContent.appendChild(modalButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  universal.uiSounds.playSound("int_prompt");
  return modal;
}

/**
 * Create a list picker modal.
 * @param {String} title The title of the modal
 * @param {Array} listContent The content of the list
 * @param {void} callback What to do when submitted
 */
function showPick(
  title,
  listContent,
  callback,
  extraM = null,
  closable = true
) {
  const modal = document.createElement("div");
  modal.className = "modal";

  const modalContent = document.createElement("div");
  modalContent.classList.add("modalContent");

  if (closable) {
    const modalClose = document.createElement("button");
    modalClose.innerText = "Close";
    modalClose.onclick = () => {
      modal.remove();
    };
    modalClose.classList.add("modalClose");
    modalContent.appendChild(modalClose);
  }

  const modalTitle = document.createElement("h2");
  modalTitle.innerText = title;
  modalTitle.classList.add("modalTitle");
  modalContent.appendChild(modalTitle);

  if (extraM != null) {
    const modalTitlet = document.createElement("p");
    modalTitlet.innerText = extraM;
    modalTitlet.classList.add("modalText");
    modalContent.appendChild(modalTitlet);
  }

  const modalFeedback = document.createElement("div");
  modalFeedback.classList.add("modalFeedback");
  modalContent.appendChild(modalFeedback);

  const modalList = document.createElement("select");
  modalList.className = "modalList";
  modalList.style.marginBottom = "20px";
  modalContent.appendChild(modalList);

  // const selectedItem = null;

  for (const item of listContent) {
    const modalItem = document.createElement("option");
    modalItem.className = "modalItem";
    modalItem.setAttribute("value", JSON.stringify(item));
    modalItem.innerText = item.name;
    modalList.appendChild(modalItem);
  }

  const modalButton = document.createElement("button");
  modalButton.innerText = "Save";
  modalButton.onclick = () => {
    const selectedItem = modalList.options[modalList.selectedIndex];
    const returned = callback(
      modal,
      JSON.parse(selectedItem.getAttribute("value")),
      modalFeedback,
      modalTitle,
      modalButton,
      modalContent
    );
    if (returned === false) return;
    modal.remove();
  };
  modalContent.appendChild(modalButton);

  modal.appendChild(modalContent);

  document.body.appendChild(modal);
  universal.uiSounds.playSound("int_prompt");

}

function showYesNo(
  title,
  content,
  yesCallback,
  noCallback,
  closable = true
)  {
  const modal = document.createElement("div");
  modal.className = "modal";

  const modalContent = document.createElement("div");
  modalContent.classList.add("modalContent");

  if (closable) {
    const modalClose = document.createElement("button");
    modalClose.innerText = "Close";
    modalClose.onclick = () => {
      modal.remove();
    };
    modalClose.classList.add("modalClose");
    modalContent.appendChild(modalClose);
  }

  const modalTitle = document.createElement("h2");
  modalTitle.innerText = title;
  modalTitle.classList.add("modalTitle");
  modalContent.appendChild(modalTitle);

  const modalTextContent = document.createElement("div");
  modalTextContent.innerText = content;
  modalTextContent.classList.add("modalTextContent");
  modalContent.appendChild(modalTextContent);

  const yesnoc = document.createElement("div");
  yesnoc.classList.add("flex-wrap-r");

  const modalButton = document.createElement("button");
  modalButton.innerText = "Yes";
  modalButton.onclick = () => {
    modal.remove();
    yesCallback();
  };
  yesnoc.appendChild(modalButton);

  const modalButtonNo = document.createElement("button");
  modalButtonNo.innerText = "No";
  modalButtonNo.onclick = () => {
    modal.remove();
    noCallback();
  };
  yesnoc.appendChild(modalButtonNo);

  modalContent.appendChild(yesnoc);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  universal.uiSounds.playSound("int_confirm");
}

window.UniversalUI = {
  show: {
    showEditModal,
    showPick,
    showText,
  },
};

window.onclick = (e) => {
  if (e.srcElement.className !== "contextMenu") {
    if (document.querySelector(".contextMenu"))
      document.querySelector(".contextMenu").remove();
  }
  universal.uiSounds.playSound("click");
};

document.addEventListener("keydown", (ev) => {
  if (ev.key === "ArrowLeft") {
    if (UI.Pages[universal.page - 1]) {
      universal.page--;
      universal.save("page", universal.page);
      universal.uiSounds.playSound("page_down");
      UI.reloadSounds();
      universal.sendEvent("page_change");
      universal.sendEvent("animate_page");
    }
  }
  if (ev.key === "ArrowRight") {
    if (UI.Pages[universal.page + 1]) {
      universal.page++;
      universal.save("page", universal.page);
      universal.uiSounds.playSound("page_up");
      UI.reloadSounds();
      universal.sendEvent("page_change");
      universal.sendEvent("animate_page");
    }
  }
});

// document.querySelector("#es-profiles").appendChild(profileSelect);

// get url params
const editing = universal.load("now-editing");

if (editing) {
  setTimeout(() => {
    const interaction = universal.config.sounds.filter((sound) => {
      const k = Object.keys(sound)[0];
      return sound[k].uuid === editing;
    })[0];
    if (interaction) {
      editTile({
        srcElement: {
          getAttribute: (attr) => {
            return JSON.stringify(interaction[Object.keys(interaction)[0]]);
          },
          dataset: {
            name: Object.keys(interaction)[0],
            interaction: JSON.stringify(
              interaction[Object.keys(interaction)[0]]
            ),
          },
          className: "button k-0",
        },
      });
    }
    universal.remove("now-editing");
  }, 250);
}

const setupWizard = () => {
  const sinks = {
    null: "None",
  };
  const sources = { null: "None" };
  navigator.mediaDevices.getUserMedia({ audio: true }).then(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      for (const device of devices) {
        if (device.kind === "audiooutput") {
          if (!device.label.includes("Input"))
            sinks[device.deviceId] = device.label;
          if (device.label.includes("Input"))
            sources[device.deviceId] = device.label;
        }
      }
      showText(
        "Setup Wizard",
        "Welcome to the Freedeck setup wizard! This will help you set up Freedeck for the first time.",
        () => {
          showPick(
            "Select a monitor device!",
            Object.keys(sinks).map((data) => {
              return {
                sink: data,
                name: sinks[data],
              };
            }),
            (modal, data, feedback, title, button, content) => {
              console.log(`User selected ${data.name}`);
              universal.save("monitor.sink", data.sink);
              showPick(
                "Select your preferred VB-Cable!",
                Object.keys(sources).map((data) => {
                  return {
                    sink: data,
                    name: sources[data],
                  };
                }),
                (modal, data, feedback, title, button, content) => {
                  console.log(`User selected ${data.name}`);
                  universal.save("vb.sink", data.sink);
                  universal.save("pitch", 1);
                  universal.save("vol", 1);
                  showText(
                    "Setup Wizard",
                    "Audio setup is complete! Let's move on to connecting your device.",
                    () => {
                      universal.save("has_setup", true);
                      if (!universal._information.mobileConnected)
                        universal.connHelpWizard().then((e) => {
                          universal.save("has_setup", true);
                          makeThanks();
                        });
                    },
                    false
                  );
                },
                "This is where Freedeck will also send audio. If you do not have VB-Cable, install it from https://vb-audio.com/Cable/",
                false
              );
            },
            "This will be where you hear the sounds. If you are using a headset, select that. If you are using speakers, select those.",
            false
          );
        },
        false
      );
    });
  });
};

if (universal.load("has_setup") === "false") {
  universal.ctx.destructiveView("setup");
  const view_container = document.querySelector(universal.ctx.view_container);
  view_container.style.display = "block";
  leftSidebar.style.display = "none";
}

universal.on(universal.events.user_mobile_conn, (isConn) => {
  if (universal.load("has_setup") === "false") return;
  if (isConn) {
    document.querySelector(".mobd").style.display = "none";
    universal.uiSounds.playSound("mobile_connect");
  }
  else {
    document.querySelector(".mobd").style.display = "flex";
    universal.uiSounds.playSound("mobile_disconnect");
  }
});

if (universal._information.mobileConnected)
  document.querySelector(".mobd").style.display = "none";

const setToLocalCfg = (key, value) => {
  const cfg = universal.lclCfg();
  cfg[key] = value;
  return cfg;
};

const lcfg = universal.lclCfg();

let tc = "repeat(5, 2fr)";
if (lcfg.tileCols) tc = tc.replace("5", lcfg.tileCols);
document.documentElement.style.setProperty("--tile-columns", tc);

universal.on(universal.events.default.plugins_updated, () => {
  const dialog = document.querySelector("dialog");
  if (!dialog.open) dialog.showModal();
  universal.uiSounds.playSound("int_prompt");
  window.location.reload();
});

universal.listenFor("audio-end", (data) => {
  const filname = data.name.replace(/[^a-zA-Z0-9]/g, "");
  if (document.querySelector(`.s-${filname}`))
    document.querySelector(`.s-${filname}`).remove();
});

window.showPick = showPick;
window.showText = showText;
window.showYesNo = showYesNo;
window.showEditModal = showEditModal;

makeThanks();
