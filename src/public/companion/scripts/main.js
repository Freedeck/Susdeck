import Sortable from "sortablejs";
import { UI } from "../../scripts/ui.js";
import { universal } from "../../scripts/universal.js";
import "./global.js";
import "./authfulPage.js"; // Only for authenticated pages

await universal.init("Companion");

universal.connectionTest = true;
universal.doCtxlLoadAnim = () => {
	document.querySelector("#ctxl-view-cont > html").style.transition =
		"opacity 0.5s";
	document.querySelector("#ctxl-view-cont").style.display = "block";
};

new Sortable(document.querySelector("#keys"), {
	onUpdate: (d) => {
		d.newDraggableIndex =
			d.newDraggableIndex + universal.page * universal.config.iconCountPerPage;
		d.oldDraggableIndex =
			d.oldDraggableIndex + universal.page * universal.config.iconCountPerPage;

		const ev = universal.page < 0 ? 1 : 0;
		universal.send(universal.events.companion.move_key, {
			name: d.item.getAttribute("data-name"),
			item: d.item.getAttribute("data-interaction"),
			newIndex: d.newDraggableIndex + ev,
			oldIndex: d.oldDraggableIndex + ev,
		});
		universal.page = 0;
	},
	filter: ".unset .builtin",
	preventOnFilter: true,
});

document.querySelector(".toggle-sidebar button").onclick = (ev) => {
	if (document.querySelector(".sidebar").style.display === "flex") {
		if (!ev.target.dataset.nosound) universal.uiSounds.playSound("slide_close");
		document.querySelector(".sidebar").style.animation =
			"sidebar-slide-out 0.5s";
		document.querySelector(".sidebar").style.animationFillMode = "forward";
		document.querySelector(".toggle-sidebar button").style.transform =
			"rotate(0deg)";
		document.querySelector(".toggle-sidebar").style.left = "0";
		setTimeout(() => {
			document.querySelector(".sidebar").style.display = "none";
		}, 500);
	} else {
		if (!ev.target.dataset.nosound) universal.uiSounds.playSound("slide_open");
		document.querySelector(".sidebar").style.display = "flex";
		document.querySelector(".sidebar").style.animation =
			"sidebar-slide-in 0.5s";
		document.querySelector(".toggle-sidebar button").style.transform =
			"rotate(180deg)";
		document.querySelector(".toggle-sidebar").style.left = "calc(11.5%)";
	}
};

window["button-types"] = [
	{
		name: "Audio File",
		type: "sound",
	},
	{
		name: "Plugin",
		type: "plugin",
	},
];

window.oncontextmenu = (e) => {
	// console.log(e.srcElement)
	if (document.querySelector(".contextMenu"))
		document.querySelector(".contextMenu").remove();
	if (!e.srcElement.classList.contains("button")) return false;
	if (e.srcElement.classList.contains("builtin")) return false;
	const custMenu = document.createElement("div");
	custMenu.className = "contextMenu";
	custMenu.style.top = `${e.clientY - window.scrollY}px`;
	custMenu.style.left = `${e.clientX - window.scrollX}px`;
	custMenu.style.position = "absolute";
	if (e.srcElement.dataset.name === undefined) e.srcElement.dataset.name = "";

	let title =
		e.srcElement.dataset.name !== "" ? e.srcElement.dataset.name : "nothing!";
	if (e.srcElement.dataset.name === "" && e.srcElement.dataset.interaction)
		title = "a tile with no name!";
	const specialFlag = e.srcElement.classList.contains("unset");

	const custMenuTitle = document.createElement("div");
	custMenuTitle.innerText = `Editing ${title}`;
	custMenuTitle.style.fontWeight = "bold";
	custMenuTitle.style.marginBottom = "5px";
	custMenu.appendChild(custMenuTitle);

	let custMenuItems = ["New Tile"];
	if (title !== "" && !specialFlag) {
		custMenuItems = ["Edit Tile"].concat(custMenuItems);
		custMenuItems.push("Remove Tile");
	} else {
		custMenuItems = ["Copy Tile Here"].concat(custMenuItems);
	}

	custMenuItems = custMenuItems.concat([
		"",
		"New Page",
		`Folder: ${universal.config.profile}`,
	]);

	for (const item of custMenuItems) {
		const menuItem = document.createElement("div");
		menuItem.innerText = item;
		menuItem.className = "menuItem";
		menuItem.onclick = () => {
			// Handle menu item click
			switch (item) {
				case "New Page":
					UI.Pages[Object.keys(UI.Pages).length] = [];
					universal.page = Object.keys(UI.Pages).length - 1;
					UI.reloadSounds();
					universal.sendEvent("page_change");
					break;
				case "---":
					break;
				case `Folder: ${universal.config.profile}`:
					showPick(
						"Switch to another Folder:",
						Object.keys(universal.config.profiles).map((profile) => {
							return {
								name: profile,
							};
						}),
						(modal, value, feedback, title, button, content) => {
							universal.page = 0;
							universal.save("page", universal.page);
							universal.send(
								universal.events.companion.set_profile,
								value.name,
							);
						},
					);
					break;
				case "Edit Tile":
					// show a modal with the editor
					editTile(e);
					break;
				case "New Tile": {
					// showPick('New Tile', window['button-types'], (modal, value, feedback, title, button, content) => {
					//   const pos = parseInt(
					//       e.srcElement.className.split(' ')[1].split('-')[1]) +
					//     (universal.page < 0 ? 1 : 0) +
					//     ((universal.page > 0 ? (universal.config.iconCountPerPage * universal.page) : 0));
					//   if (value.type == 'sound') createSound(pos);
					//   if (value.type == 'plugin') createPlugin(pos);
					// });
					const pos =
						Number.parseInt(
							e.srcElement.className.split(" ")[1].split("-")[1],
						) +
						(universal.page < 0 ? 1 : 0) +
						(universal.page > 0
							? universal.config.iconCountPerPage * universal.page
							: 0);
					const uuid = `fdc.${Math.random() * 10000000}`;
					UI.reloadProfile();
					universal.save("now-editing", uuid);
					universal.send(universal.events.companion.new_key, {
						"New Tile": {
							type: "fd.none",
							pos,
							uuid,
							data: {},
						},
					});
					break;
				}
				case "Remove Tile":
					UI.reloadProfile();
					universal.send(universal.events.companion.del_key, {
						name: e.srcElement.dataset.name,
						item: e.srcElement.getAttribute("data-interaction"),
					});
					break;
				case "Copy Tile Here":
					showReplaceGUI(e.srcElement);
					break;
				default:
					break;
			}
		};
		custMenu.appendChild(menuItem);
	}
	document.body.appendChild(custMenu);
	return false; // cancel default menu
};

/**
 * @name showReplaceGUI
 * @param {HTMLElement} srcElement The element that you want to copy/replace.
 * @description Show the GUI for replacing a button with another from the universal.config.sounds context.
 */
function showReplaceGUI(srcElement) {
	UI.reloadProfile();
	showPick(
		"Copy from:",
		universal.config.sounds.map((sound) => {
			const k = Object.keys(sound)[0];
			return {
				name: k,
				type: sound[k].type,
			};
		}),
		(modal, value, feedback, title, button, content) => {
			UI.reloadProfile();
			const valueToo = universal.config.sounds.filter((sound) => {
				const k = Object.keys(sound)[0];
				return k === value.name;
			})[0][value.name];
			const pos =
				Number.parseInt(srcElement.className.split(" ")[1].split("-")[1]) +
				(universal.page <= 0 ? 1 : 0) +
				(universal.page > 0
					? universal.config.iconCountPerPage * universal.page
					: 0);
			// we need to clone value, and change the pos, and uuid, then make a new key.
			universal.send(
				universal.events.companion.new_key,
				JSON.stringify({
					[value.name]: {
						type: valueToo.type,
						plugin: valueToo.plugin || "Freedeck",
						pos,
						uuid: `fdc.${Math.random() * 10000000}`,
						data: valueToo.data,
					},
				}),
			);
			return true;
		},
	);
}

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

function setEditorData(key, value, int) {
	if (document.querySelector(`.editor-data#${key}`)) {
		document.querySelector(`.editor-data#${key}`).value = value;
	}
	int.data[key] = value;
}

document.querySelector("#color").onchange = (e) => {
	document.querySelector("#editor-btn").style.backgroundColor =
		e.srcElement.value;
	document.querySelector("#color").dataset.has_set = "true";
	// create data "color"
	const interaction = JSON.parse(
		document
			.querySelector("#editor-btn[data-interaction]")
			.getAttribute("data-interaction"),
	);
	interaction.data.color = e.srcElement.value;
	document
		.querySelector("#editor-btn")
		.setAttribute("data-interaction", JSON.stringify(interaction));
	loadData(interaction.data);
};

const selectableViews = ["audio", "plugins", "system", "none", "profile"];

const openViewCloseAll = (view) => {
	for (const v of selectableViews) {
		document.querySelector(`#${v}-only`).style.display = "none";
	}
	document.querySelector(`#${view}-only`).style.display = "flex";
};

/**
 * Edit a tile
 * @param {*} e HTML Element corresponding to the button that we grabbed context from
 */
function editTile(e) {
	universal.uiSounds.playSound("editor_open");
	const interactionData = JSON.parse(
		e.srcElement.getAttribute("data-interaction"),
	);
	if (document.querySelector(".toggle-sidebar").style.left !== "0px")
		document.querySelector(".toggle-sidebar button").dataset.nosound = "true";
	if (document.querySelector(".toggle-sidebar").style.left !== "0px")
		document.querySelector(".toggle-sidebar button").click();
	if (document.querySelector(".contextMenu"))
		document.querySelector(".contextMenu").style.display = "none";
	document.querySelector("#advanced-view").style.display = "none";
	document.querySelector("#sidebar").style.right = "-20%";
	document.querySelector("#editor").style.display = "block";
	document.querySelector("#editor-btn").innerText = e.srcElement.dataset.name;
	document.querySelector("#editor-btn").style.backgroundImage =
		`url("${interactionData.data.icon}")`;
	document.querySelector("#editor-btn").style.backgroundColor =
		interactionData.data.color;
	document.querySelector("#color").value = interactionData.data.color;
	document.querySelector("#name").value = e.srcElement.dataset.name;
	document
		.querySelector("#editor-btn")
		.setAttribute("data-pre-edit", e.srcElement.dataset.name);
	document
		.querySelector("#editor-btn")
		.setAttribute(
			"data-interaction",
			e.srcElement.getAttribute("data-interaction"),
		);
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
	document.querySelector("#audio-only").style.display = "none";
	document.querySelector("#plugins-only").style.display = "none";
	document.querySelector("#system-only").style.display = "none";
	document.querySelector("#none-only").style.display = "none";
	document.querySelector("#profile-only").style.display = "none";
	if (interactionData.type === "fd.sound") {
		document.querySelector("#audio-file").innerText = interactionData.data.file;
		document.querySelector("#audio-path").innerText = interactionData.data.path;
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
		} else {
			for (const el of document.querySelectorAll(".spiaction, .spiback")) {
				el.style.display = "none";
			}
			for (const el of document.querySelectorAll(".spiplugin")) {
				el.style.display = "block";
			}
		}
		openViewCloseAll("plugins");
		if (interactionData.type.startsWith("fd.sys")) {
			openViewCloseAll("system");
			fetch("/native/volume/apps")
				.then((res) => res.json())
				.then((data) => {
					if (data._msg) {
						universal.sendToast(
							"NativeBridge is not running. Please start it to use this feature.",
						);
					}
					const int = JSON.parse(
						document
							.querySelector("#editor-btn[data-interaction]")
							.getAttribute("data-interaction"),
					);

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
						document
							.querySelector("#editor-btn[data-interaction]")
							.setAttribute("data-interaction", JSON.stringify(int));
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
			for (const a of document.querySelectorAll(".spiaction")) {
				a.style.display = "none";
				a.classList.remove("spi-active");
				if (a.dataset.plugin === interactionData.plugin) {
					if (a.dataset.type === interactionData.type)
						a.classList.add("spi-active");
					a.style.display = "block";
				}
			}
			loadSettings(interactionData.plugin);
		}
	}
	if (interactionData.data) {
		const itm = interactionData.data;
		loadData(itm);
	}
	document.querySelector("#lp").checked =
		interactionData.data.longPress === "true";
	document.querySelector("#lp").style.display =
		interactionData.renderType === "slider" ? "none" : "block";
	document.querySelector('label[for="lp"]').style.display =
		interactionData.renderType === "slider" ? "none" : "block";
	// make it fade in
	document.querySelector("#editor").style.opacity = "0";
	document.querySelector(".toggle-sidebar button").style.display = "none";
	setTimeout(() => {
		document.querySelector("#editor").style.opacity = "1";
	}, 100);
}

document.querySelector("#lp").onclick = () => {
	const int = JSON.parse(
		document
			.querySelector("#editor-btn[data-interaction]")
			.getAttribute("data-interaction"),
	);
	if (!int.data.longPress) int.data.longPress = true;
	else int.data.longPress = !int.data.longPress;
	document
		.querySelector("#editor-btn[data-interaction]")
		.setAttribute("data-interaction", JSON.stringify(int));
	loadData(int.data);
	document.querySelector("#lp").checked = int.data.longPress;
};

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
	document.querySelector("#pl-title").innerText =
		`${universal.plugins[plugin].name} Settings`;
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
		const int = JSON.parse(
			document
				.querySelector("#editor-btn[data-interaction]")
				.getAttribute("data-interaction"),
		);
		int.data.profile = e.srcElement.value;
		document
			.querySelector("#editor-btn")
			.setAttribute("data-interaction", JSON.stringify(int));
	};
};

document.querySelector("#spiback").onclick = (e) => {
	for (const el of document.querySelectorAll(".spiaction, .spiback")) {
		el.style.display = "none";
	}
	for (const el of document.querySelectorAll(".spiplugin")) {
		el.style.display = "block";
	}
};

document.querySelector("#spiav").onclick = () => {
	const interaction = JSON.parse(
		document
			.querySelector("#editor-btn[data-interaction]")
			.getAttribute("data-interaction"),
	);
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
				`.spiaction.pl-${type.pluginId}`,
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
			document
				.querySelector("#editor-btn[data-interaction]")
				.getAttribute("data-interaction"),
		);
		const type = e.target.getAttribute("data-type");
		const plugin = e.target.getAttribute("data-plugin");
		const renderType = e.target.getAttribute("data-rt");
		const templateData = JSON.parse(e.target.getAttribute("data-template"));

		if (interaction.plugin) {
			document
				.querySelector(
					`.spi[data-type="${interaction.type}"][data-plugin="${interaction.plugin}"]`,
				)
				.classList.remove("spi-active");
		}
		interaction.type = type;
		interaction.plugin = plugin;
		interaction.renderType = renderType;
		interaction.data = { ...templateData, ...interaction.data };
		document
			.querySelector(`.spi[data-type="${type}"][data-plugin="${plugin}"]`)
			.classList.add("spi-active");
		document
			.querySelector("#editor-btn")
			.setAttribute("data-interaction", JSON.stringify(interaction));
		document.querySelector("#type").value = type;
		document.querySelector("#plugin").value = plugin;
		loadData(interaction.data);
		loadSettings(interaction.plugin);
	};
	spiContainer.appendChild(element);
}
generateProfileSelect();

document.querySelector("#upload-sound").onclick = () => {
	document.querySelector("#audio-file").innerText = "Uploading...";
	document.querySelector("#audio-path").innerText = "Uploading...";
	document.querySelector("#upload-sound").disabled = true;
	upload("audio/*,video/*", (data) => {
		UI.reloadProfile();
		const previousInteractionData = JSON.parse(
			document
				.querySelector("#editor-btn[data-interaction]")
				.getAttribute("data-interaction"),
		);
		previousInteractionData.data.file = data.newName;
		document
			.querySelector("#editor-btn[data-interaction]")
			.setAttribute(
				"data-interaction",
				JSON.stringify(previousInteractionData),
			);
		document.querySelector("#file.editor-data").value = data.newName;
		document.querySelector("#path.editor-data").value = "/sounds/";
		document.querySelector("#audio-file").innerText = data.newName;
		document.querySelector("#audio-path").innerText = "/sounds/";
		document.querySelector("#upload-sound").disabled = false;
	});
};

document.querySelector("#none-audio").onclick = (e) => {
	const int = JSON.parse(
		document
			.querySelector("#editor-btn[data-interaction]")
			.getAttribute("data-interaction"),
	);
	int.type = "fd.sound";
	int.data = {
		file: "Unset.mp3",
		path: "/sounds/",
	};
	document
		.querySelector("#editor-btn[data-interaction]")
		.setAttribute("data-interaction", JSON.stringify(int));
	document.querySelector("#audio-file").innerText = "Unset.mp3";
	document.querySelector("#type").value = "fd.sound";
	document.querySelector("#audio-path").innerText = "/sounds/";
	openViewCloseAll("audio");
};

document.querySelector("#none-profiles").onclick = (e) => {
	const int = JSON.parse(
		document
			.querySelector("#editor-btn[data-interaction]")
			.getAttribute("data-interaction"),
	);
	int.type = "fd.profile";
	int.data = {
		profile: "Default",
	};
	document
		.querySelector("#editor-btn[data-interaction]")
		.setAttribute("data-interaction", JSON.stringify(int));
	document.querySelector("#type").value = "fd.profile";
	generateProfileSelect();
	document.querySelector("#eprofile-select").value = int.data.profile;
	openViewCloseAll("profile");
};

document.querySelector("#none-system").onclick = (e) => {
	fetch("/native/volume/apps")
		.then((res) => res.json())
		.then((data) => {
			if (data._msg) {
				universal.sendToast(
					"NativeBridge is not running. Please start it to use this feature.",
				);
				return;
			}
			const int = JSON.parse(
				document
					.querySelector("#editor-btn[data-interaction]")
					.getAttribute("data-interaction"),
			);
			const select = document.querySelector("#system-select");
			select.innerHTML = "";

			for (const app of data) {
				const option = document.createElement("option");
				let friendly =
					app.friendly !== "" ? `${app.friendly} (${app.name})` : app.name;
				if (app.name === "_fd.System") friendly = "System Volume";
				option.innerText = friendly;
				option.value = app.name;
				if (int.data?.app && int.data.app === app.name) option.selected = true;
				select.appendChild(option);
			}

			select.onchange = (e) => {
				const int = JSON.parse(
					document
						.querySelector("#editor-btn[data-interaction]")
						.getAttribute("data-interaction"),
				);
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
				document
					.querySelector("#editor-btn[data-interaction]")
					.setAttribute("data-interaction", JSON.stringify(int));
			};

			int.type = "fd.sys.volume.sys";
			int.renderType = "slider";
			int.data = {
				app: "_fd.System",
				min: 0,
				max: 100,
				value: 50,
				format: "%",
				direction: "vertical",
			};
			document
				.querySelector("#editor-btn[data-interaction]")
				.setAttribute("data-interaction", JSON.stringify(int));
			document.querySelector("#type").value = "fd.sys.volume.sys";
			document.querySelector("#system-only").style.display = "flex";
			document.querySelector("#audio-only").style.display = "none";
			document.querySelector("#plugins-only").style.display = "none";
			document.querySelector("#none-only").style.display = "none";
		});
};

document.querySelector("#none-plugin").onclick = (e) => {
	document.querySelector('label[for="plugin"]').style.display = "block";
	document.querySelector("#plugin").style.display = "block";
	const int = JSON.parse(
		document
			.querySelector("#editor-btn[data-interaction]")
			.getAttribute("data-interaction"),
	);
	int.type = "fd.select";
	int.data = {};
	document.querySelector("#type").innerText = "fd.select";
	document
		.querySelector("#editor-btn[data-interaction]")
		.setAttribute("data-interaction", JSON.stringify(int));
	document.querySelector("#audio-only").style.display = "none";
	document.querySelector("#plugins-only").style.display = "flex";
	document.querySelector("#none-only").style.display = "none";
};

document.querySelector("#upload-icon").onclick = (e) => {
	upload(
		"image/*",
		(data) => {
			UI.reloadProfile();
			const previousInteractionData = JSON.parse(
				document
					.querySelector("#editor-btn[data-interaction]")
					.getAttribute("data-interaction"),
			);
			previousInteractionData.data.icon = `/us-icons/${data.newName}`;
			document
				.querySelector("#editor-btn[data-interaction]")
				.setAttribute(
					"data-interaction",
					JSON.stringify(previousInteractionData),
				);
			document.querySelector("#editor-btn").style.backgroundImage =
				`url("${`/us-icons/${data.newName}`}")`;
			loadData(previousInteractionData.data);
		},
		"icon",
	);
};

const upload = (accept, callback, type = "sound") => {
	// <iframe name="dummyFrame" id="dummyFrame" style="display: none;"></iframe>
	const dummyFrame = document.createElement("iframe");
	dummyFrame.style.display = "none";
	dummyFrame.id = "dummyFrame";
	dummyFrame.name = "dummyFrame";
	const form = document.createElement("form");
	form.method = "post";
	form.enctype = "multipart/form-data";
	form.action = `/fd/api/upload/${type}`;
	form.target = "dummyFrame";
	form.style.display = "none";
	const fileUpload = document.createElement("input");
	fileUpload.type = "file";
	fileUpload.name = "file";
	fileUpload.accept = accept;
	fileUpload.style.display = "none";
	form.appendChild(fileUpload);
	fileUpload.click();
	fileUpload.onchange = () => {
		form.submit();
		setTimeout(() => {
			// Form parse wait
			const content = dummyFrame.contentDocument;
			const data = JSON.parse(content.querySelector("pre").innerText);
			callback(data);
			form.remove();
			fileUpload.remove();
			setTimeout(() => {
				// Let data process
				dummyFrame.remove();
			}, 500);
		}, 250);
	};
	document.body.append(form);
	document.body.appendChild(dummyFrame);
};

document.querySelector("#editor-close").onclick = () => {
	universal.uiSounds.playSound("int_no");
	document.querySelector("#editor").style.opacity = "0";
	document.querySelector("#sidebar").style.right = "5px";
	document.querySelector(".toggle-sidebar button").style.display = "block";
	if (document.querySelector(".toggle-sidebar").style.left === "0px")
		document.querySelector(".toggle-sidebar button").click();
	setTimeout(() => {
		document.querySelector("#editor").style.display = "none";
		document.querySelector("#color").value = "#000000";
		document.querySelector("#color").dataset.has_set = "false";
		document.querySelector("#editor-btn").style.backgroundColor = "";
	}, 500);
};

document.querySelector("#editor-save").onclick = () => {
	const name = document.querySelector("#name").value;
	const interaction = JSON.parse(
		document
			.querySelector("#editor-btn[data-interaction]")
			.getAttribute("data-interaction"),
	);
	for (const input of document.querySelectorAll(".editor-data")) {
		interaction.data[input.id] = input.value;
	}
	universal.send(universal.events.companion.edit_key, {
		name: name,
		oldName: document
			.querySelector("#editor-btn[data-interaction]")
			.getAttribute("data-pre-edit"),
		interaction: interaction,
	});

	document.querySelector("#editor").style.opacity = "0";
	setTimeout(() => {
		document.querySelector("#editor").style.display = "none";
	}, 500);
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
	modalClose.onclick = () => {
		modal.remove();
	};
	modalClose.style.position = "absolute";
	modalClose.style.top = "0";
	modalClose.style.right = "0";
	modalClose.style.margin = "20px";
	modalContent.appendChild(modalClose);

	const modalTitle = document.createElement("h2");
	modalTitle.innerText = title;
	modalTitle.style.marginBottom = "20px";
	modalContent.appendChild(modalTitle);

	const modalFeedback = document.createElement("div");
	modalFeedback.className = "modalFeedback";
	modalFeedback.style.color = "red";
	modalFeedback.style.marginBottom = "20px";
	modalContent.appendChild(modalFeedback);

	const modalInput = document.createElement("input");
	modalInput.type = "text";
	modalInput.placeholder = content;
	modalInput.style.marginBottom = "20px";
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
			modalContent,
		);
		if (returned === false) return;
		modal.remove();
	};
	modalContent.appendChild(modalButton);

	modal.appendChild(modalContent);

	document.body.appendChild(modal);
}

/**
 * Create a list picker modal.
 * @param {String} title The title of the modal
 * @param {Array} listContent The content of the list
 * @param {void} callback What to do when submitted
 */
function showPick(title, listContent, callback) {
	const modal = document.createElement("div");
	modal.className = "modal";

	const modalContent = document.createElement("div");
	modalContent.className = "modalContent";

	const modalClose = document.createElement("button");
	modalClose.innerText = "Close";
	modalClose.onclick = () => {
		modal.remove();
	};
	modalClose.style.position = "absolute";
	modalClose.style.top = "0";
	modalClose.style.right = "0";
	modalClose.style.margin = "20px";
	modalContent.appendChild(modalClose);

	const modalTitle = document.createElement("h2");
	modalTitle.innerText = title;
	modalTitle.style.marginBottom = "20px";
	modalContent.appendChild(modalTitle);

	const modalFeedback = document.createElement("div");
	modalFeedback.className = "modalFeedback";
	modalFeedback.style.color = "red";
	modalFeedback.style.marginBottom = "20px";
	modalContent.appendChild(modalFeedback);

	// const modalList = document.createElement('select');
	// modalList.className = 'modalList';
	// modalList.style.marginBottom = '20px';
	// modalContent.appendChild(modalList);

	// listContent.forEach((item) => {
	//   const modalItem = document.createElement('option');
	//   modalItem.className = 'modalItem';
	//   modalItem.setAttribute('value', JSON.stringify(item));
	//   modalItem.innerText = item.name;
	//   modalList.appendChild(modalItem);
	// });

	let selectedItem = null;
	const itemContainer = document.createElement("div");
	itemContainer.className = "modalList";
	itemContainer.style.display = "flex";
	itemContainer.style.flexWrap = "wrap";
	itemContainer.style.overflowY = "auto";
	itemContainer.style.gap = "15px";
	itemContainer.style.padding = "15px";

	itemContainer.style.marginBottom = "20px";
	modalContent.appendChild(itemContainer);
	for (const item of listContent) {
		const modalItem = document.createElement("button");
		modalItem.className = "modalItem";
		modalItem.setAttribute("value", JSON.stringify(item));
		modalItem.innerText = item.name;
		modalItem.onclick = () => {
			selectedItem = modalItem;
			for (const i of document.querySelectorAll(".modalItem")) {
				i.style.backgroundColor = "unset";
			}
			modalItem.style.backgroundColor = "var(--fd-btn-background)";
		};
		itemContainer.appendChild(modalItem);
	}

	const modalButton = document.createElement("button");
	modalButton.innerText = "Save";
	modalButton.onclick = () => {
		// const selectedItem = modalList.options[modalList.selectedIndex];
		const returned = callback(
			modal,
			JSON.parse(selectedItem.getAttribute("value")),
			modalFeedback,
			modalTitle,
			modalButton,
			modalContent,
		);
		if (returned === false) return;
		modal.remove();
	};
	modalContent.appendChild(modalButton);

	modal.appendChild(modalContent);

	document.body.appendChild(modal);
}

window.onclick = (e) => {
	if (e.srcElement.className !== "contextMenu") {
		if (document.querySelector(".contextMenu"))
			document.querySelector(".contextMenu").remove();
	}
	universal.uiSounds.playSound("click");
};

document.querySelector("#pg-left").addEventListener("click", () => {
	if (UI.Pages[universal.page - 1]) {
		universal.page--;
		universal.save("page", universal.page);
		universal.uiSounds.playSound("page_down");
		UI.reloadSounds();
		universal.sendEvent("page_change");
	}
});

document.querySelector("#pg-right").addEventListener("click", () => {
	if (UI.Pages[universal.page + 1]) {
		universal.page++;
		universal.save("page", universal.page);
		universal.uiSounds.playSound("page_up");
		UI.reloadSounds();
		universal.sendEvent("page_change");
	}
});

document.addEventListener("keydown", (ev) => {
	if (ev.key === "ArrowLeft") {
		if (UI.Pages[universal.page - 1]) {
			universal.page--;
			universal.save("page", universal.page);
			universal.uiSounds.playSound("page_down");
			UI.reloadSounds();
			universal.sendEvent("page_change");
		}
	}
	if (ev.key === "ArrowRight") {
		if (UI.Pages[universal.page + 1]) {
			universal.page++;
			universal.save("page", universal.page);
			universal.uiSounds.playSound("page_up");
			UI.reloadSounds();
			universal.sendEvent("page_change");
		}
	}
});

const profileTxt = document.createElement("h2");
profileTxt.innerHTML = `Profile:&nbsp<i>${universal.config.profile}</i>`;
// document.body.appendChild(profileTxt);

const profileSelect = document.createElement("select");
const profileAdd = document.querySelector("#pf-add");

const profileImport = document.querySelector("#pf-imp");

const profileExport = document.querySelector("#pf-exp");

profileExport.onclick = () => {
	const profile = universal.config.profiles[universal.config.profile];
	const data = JSON.stringify(profile);
	const blob = new Blob([data], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${universal.config.profile}.json`;
	a.click();
	URL.revokeObjectURL(url);
};

for (const profile of Object.keys(universal.config.profiles)) {
	const option = document.createElement("option");
	option.innerText = profile;
	option.setAttribute("value", profile);
	profileSelect.appendChild(option);
}

profileImport.onclick = () => {
	showEditModal(
		"Import Folder",
		"Enter the folder data to import",
		(modal, pfData, feedback, title, button, input, content) => {
			try {
				const data = JSON.parse(pfData);
				showEditModal(
					"Import Folder",
					"Enter a name for the new folder",
					(modal, value, feedback, title, button, input, content) => {
						if (value.length < 1) {
							feedback.innerText = "Please enter a name for the folder";
							return false;
						}
						universal.send(universal.events.companion.import_profile, {
							name: value,
							data,
						});
					},
				);
				return true;
			} catch (e) {
				feedback.innerText = "Invalid JSON data";
				return false;
			}
		},
	);
};

profileAdd.onclick = () => {
	showEditModal(
		"New Folder",
		"Enter a name for the new folder",
		(modal, value, feedback, title, button, input, content) => {
			if (value.length < 1) {
				feedback.innerText = "Please enter a name for the folder";
				return false;
			}
			universal.page = 0;
			universal.save("page", universal.page);
			universal.send(universal.events.companion.add_profile, value);
			return true;
		},
	);
};

profileSelect.value = universal.config.profile;

profileSelect.onchange = () => {
	universal.page = 0;
	universal.save("page", universal.page);
	universal.send(universal.events.companion.set_profile, profileSelect.value);
};

document.querySelector("#es-profiles").appendChild(profileSelect);

const profileDupe = document.querySelector("#pf-dupe");

profileDupe.onclick = () => {
	showEditModal(
		"Duplicate Profile",
		"Enter a name for the new profile",
		(modal, value, feedback, title, button, input, content) => {
			if (value.length < 1) {
				feedback.innerText = "Please enter a name for the profile";
				return false;
			}
			universal.send(universal.events.companion.dup_profile, value);
			return true;
		},
	);
};

universal.on(universal.events.user_mobile_conn, (isConn) => {
	if (isConn) document.querySelector(".mobd").style.display = "none";
	else document.querySelector(".mobd").style.display = "flex";
});

if (universal._information.mobileConnected)
	document.querySelector(".mobd").style.display = "none";

if (universal.load("pitch"))
	document.querySelector("#pitch").value = universal.load("pitch");

if (universal.load("has_setup") === "false") {
	universal.ctx.destructiveView("settings");
	setTimeout(() => {
		window.st_run_setup();
	}, 250);
}

// get url params
const urlParams = new URLSearchParams(window.location.search);
const err = urlParams.get("err");
const editing = universal.load("now-editing");
if (err) {
	switch (err) {
		case "last-step":
			universal.sendToast("Initiating connection help wizard");
			universal.connHelpWizard();
			window.history.replaceState({}, document.title, window.location.pathname);
			break;
	}
}
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
							interaction[Object.keys(interaction)[0]],
						),
					},
					className: "button k-0",
				},
			});
		}
		universal.remove("now-editing");
	}, 250);
}

/**
 * @name getAudioOutputDevices
 * @description Get the audio output devices.
 * @param {Boolean} isCable If we're looking for VB-Cable instances or Monitor
 * @return {Object[]}
 */
async function getAudioOutputDevices(isCable = false) {
	const devices = await navigator.mediaDevices.enumerateDevices();
	const audioOutputs = devices
		.filter(
			(device) =>
				device.kind === "audiooutput" &&
				(isCable
					? device.label.includes("VB-Audio")
					: !device.label.includes("VB-Audio")),
		)
		.map((device) => ({
			name: device.label || "Unknown Audio Output",
			value: device.deviceId,
		}));
	return audioOutputs;
}

const embeddedSettingsAudio = document.querySelector("#es-audio");
const embeddedSettingsClient = document.querySelector("#es-client");

getAudioOutputDevices().then(async (audioOutputs) => {
	const select = await universal.embedded_settings.createSelect(
		"Monitor",
		"es-monitor",
		audioOutputs.map((device) => device.value),
		audioOutputs.map((device) => device.name),
		universal.load("monitor.sink"),
		(ev) => {
			universal.save("monitor.sink", ev.target.value);
			console.log(`Pitch set to ${ev.target.value}`);
		},
	);
	embeddedSettingsAudio.appendChild(select);
});

getAudioOutputDevices(true).then(async (audioOutputs) => {
	const select = await universal.embedded_settings.createSelect(
		"VB-Cable",
		"es-cable",
		audioOutputs.map((device) => device.value),
		audioOutputs.map((device) => device.name),
		universal.load("vb.sink"),
		(ev) => {
			universal.save("vb.sink", ev.target.value);
			console.log(`Cable set to ${ev.target.value}`);
		},
	);
	embeddedSettingsAudio.appendChild(select);
});

const playbackModes = [
	{
		label: "Stop Previous",
		value: "stop_prev",
	},
	{
		label: "Play Over",
		value: "play_over",
	},
];

const playbackModeSetting = await universal.embedded_settings.createSelect(
	"Playback Mode",
	"es-playback",
	playbackModes.map((mode) => mode.value),
	playbackModes.map((mode) => mode.label),
	universal.load("playback-mode"),
	(ev) => {
		universal.save("playback-mode", ev.target.value);
		console.log(`Playback mode set to ${ev.target.value}`);
	},
);

embeddedSettingsClient.appendChild(playbackModeSetting);

const setToLocalCfg = (key, value) => {
	const cfg = universal.lclCfg();
	cfg[key] = value;
	return cfg;
};

for (const slider of document.querySelectorAll(".fdc-slider")) {
	// create min/max text that floats below the slider
	const postfix = slider.getAttribute("postfix") || "";
	const min = document.createElement("div");
	min.innerText = slider.min;
	min.className = "fdc-slider-min";
	slider.parentElement.appendChild(min);
	const max = document.createElement("div");
	max.innerText = slider.max;
	max.className = "fdc-slider-max";
	slider.parentElement.appendChild(max);
	const value = document.createElement("div");
	value.innerText = slider.value + postfix;
	value.className = "fdc-slider-value";
	slider.parentElement.appendChild(value);
	slider.addEventListener("input", (e) => {
		value.innerText = e.target.value + postfix;
	});
	slider.addEventListener("change", (e) => {
		value.innerText = e.target.value + postfix;
	});
}

function setValue(id, val) {
	document.querySelector(id).value = val;
	document
		.querySelector(id)
		.parentElement.querySelector(".fdc-slider-value").innerText =
		val + (document.querySelector(id).getAttribute("postfix") || "");
}

document.querySelector("#es-fs").oninput = (e) => {
	universal.uiSounds.playSound("fdc_slider");
	document.documentElement.style.setProperty(
		"--fd-font-size",
		`${e.target.value}px`,
	);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("font-size", e.target.value),
	);
};

document.querySelector("#es-bs").oninput = (e) => {
	universal.uiSounds.playSound("fdc_slider");
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("buttonSize", e.target.value),
	);
};

document.querySelector("#es-fs-reset").onclick = (e) => {
	universal.uiSounds.playSound("fdc_slider");
	document.documentElement.style.setProperty("--fd-font-size", "15px");
	setValue("#es-fs", 15);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("font-size", 15),
	);
};

document.querySelector("#es-bs-reset").onclick = (e) => {
	universal.uiSounds.playSound("fdc_slider");
	setValue("#es-bs", 6);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("buttonSize", 6),
	);
};

document.querySelector("#es-tc-reset").onclick = (e) => {
	setValue("#es-tc", 12);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("iconCountPerPage", 12),
	);
	universal.send(universal.events.default.reload);
};

document.querySelector("#es-scroll").onchange = (e) => {
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("scroll", e.target.checked),
	);
	universal.send(universal.events.default.reload);
};

document.querySelector("#es-tc").oninput = (e) => {
	universal.uiSounds.playSound("fdc_slider");
	const prepend = document.querySelector("#keys");
	const count = document.querySelectorAll(".fdc-placeholder").length;
	const diff = e.target.value - count;
	if (diff > 0) {
		document.querySelector("#keys").innerHTML = "";
		for (let i = 0; i < diff + 3; i++) {
			const clone = document.createElement("div");
			clone.className = `button builtin unset k-${count + i}`;
			prepend.appendChild(clone);
		}
	} else {
		for (let i = 0; i < Math.abs(diff); i++) {
			const last = document.querySelector(`.button.k-${count - i - 1}`);
			last.remove();
		}
	}
};

document.querySelector("#es-tc").onmouseup = (e) => {
	if (e.target.value === universal.config.iconCountPerPage) {
		window.location.reload();
		return;
	}
};

document.querySelector("#es-tc").onchange = (e) => {
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("iconCountPerPage", e.target.value),
	);
	universal.send(universal.events.default.reload);
};

setValue("#es-fs", universal.lclCfg()["font-size"]);
setValue("#es-bs", universal.lclCfg().buttonSize);
setValue("#es-tc", universal.lclCfg().iconCountPerPage);
setValue("#es-lp", universal.lclCfg().longPressTime);
setValue("#es-tr", universal.lclCfg().tileRows);
const lcfg = universal.lclCfg();

document.querySelector("#es-tr").oninput = (e) => {
	universal.uiSounds.playSound("fdc_slider");
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("tileRows", e.target.value),
	);
	let tc = "repeat(5, 2fr)";
	if (lcfg.tileRows) tc = tc.replace("5", e.target.value);
	document.documentElement.style.setProperty("--fd-template-columns", tc);
};

let tc = "repeat(5, 2fr)";
if (lcfg.tileRows) tc = tc.replace("5", lcfg.tileRows);
document.documentElement.style.setProperty("--fd-template-columns", tc);
document.querySelector("#es-fill").onchange = (e) => {
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("fill", e.target.checked),
	);
	universal.send(universal.events.default.reload);
};
document.querySelector("#es-center").onchange = (e) => {
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("center", e.target.checked),
	);
	universal.send(universal.events.default.reload);
};

document.querySelector("#es-lp").oninput = (e) => {
	universal.uiSounds.playSound("fdc_slider");
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("longPressTime", e.target.value),
	);
};

document.querySelector("#es-lp").onmouseup = (e) => {
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("longPressTime", e.target.value),
	);
	universal.send(universal.events.default.reload);
};

document.querySelector("#es-lp-reset").onclick = (e) => {
	universal.uiSounds.playSound("fdc_slider");
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("longPressTime", 3),
	);
	universal.send(universal.events.default.reload);
};

document.querySelector("#es-tr-reset").onclick = (e) => {
	universal.uiSounds.playSound("fdc_slider");
	setValue("#es-tr", 5);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("tileRows", 5),
	);
};

document.querySelector("#es-scroll").checked = universal.lclCfg().scroll;
document.querySelector("#es-fill").checked = universal.lclCfg().fill;
document.querySelector("#es-center").checked = universal.lclCfg().center;

universal.on(universal.events.default.plugins_updated, () => {
	const dialog = document.querySelector("dialog");
	if (!dialog.open) dialog.showModal();
	universal.uiSounds.playSound("int_prompt");
	window.location.reload();
});

universal.on(universal.events.default.notif, (dat) => {
	if (!dat.incoming) return;
	if (dat.data === "Authorize") {
		showPick(
			`${dat.incoming.appInformation.title} wants to connect to your Freedeck!`,
			[
				{
					value: "true",
					name: "Authorize",
				},
				{
					value: "false",
					name: "Deny",
				},
			],
			(modal, value, feedback, title, button, input, content) => {
				universal.send(
					universal.events.rpc.reply,
					JSON.stringify({
						id: dat.incoming.appInformation.id,
						nonce: dat.incoming.nonce,
						value: value.value,
					}),
				);
			},
		);
		return;
	}
});
