import gridItemDrag from "./lib/gridItemDrag.js";
import { UI } from "../../client/scripts/ui.js";
import { universal } from "../../shared/universal.js";
import "./sidebar.js";
import "../../shared/useAuthentication.js"; // Only for authenticated pages
import "./uploadsHandler.js";
import { makeThanks } from "./changelog/create.js";

await universal.init("Companion");

universal.connectionTest = true;
universal.doCtxlLoadAnim = () => {
	document.querySelector("#ctxl-view-cont > html").style.transition =
		"opacity 0.5s";
	document.querySelector("#ctxl-view-cont").style.display = "block";
};

gridItemDrag.setFilter("#keys .button");
gridItemDrag.unmovableClass = ".builtin, .unset";
gridItemDrag.setContext(document.querySelector("#keys"));
universal.listenFor("page_change", () => {
	gridItemDrag.setContext(document.querySelector("#keys"));
});
gridItemDrag.on("drop", (event, origIndex, targIndex) => {
	document.querySelector(".mt-next-page").style.display = "none";
	document.querySelector(".mt-prev-page").style.display = "none";

	console.log(event.target.classList)

	if(event.target.classList.contains("mt-next-page") || event.target.classList.contains("mt-prev-page")) {
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
				: 0)
		let targetIndex = 0;

		if(wanted) {
			// We need to find the first empty slot
			for(const item of universal.config.profiles[universal.config.profile]) {
				if(item.pos === targetIndex) {
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
	document.querySelector("#keys").appendChild(document.querySelector(".mt-next-page").cloneNode(true));
	document.querySelector("#keys").appendChild(document.querySelector(".mt-prev-page").cloneNode(true));
	// copy the next and prev buttons to the keys container
	
	document.querySelector(".mt-next-page").style.display = "flex";
	document.querySelector(".mt-prev-page").style.display = "flex";

})

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

	let custMenuItems = [];
	if (title !== "" && !specialFlag) {
		custMenuItems = ["Edit Tile"].concat(custMenuItems);
		custMenuItems.push("Remove Tile");
	} else {
		custMenuItems = ["New Tile", "Copy Tile Here"].concat(custMenuItems);
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
					const interaction = {
						type: "fd.none",
						pos,
						uuid,
						data: {},
					};
					universal.send(universal.events.companion.new_key, {
						"New Tile": interaction,
					});
					editTile({
						srcElement: {
							getAttribute: (attr) => {
								return JSON.stringify(interaction);
							},
							dataset: {
								name: "New Tile",
								interaction: JSON.stringify(interaction),
							},
							className: "button k-0",
						},
					});
					break;
				}
				case "Remove Tile":
					UI.reloadProfile();
					showPick(
						`Are you sure you want to remove ${universal.cleanHTML(e.srcElement.dataset.name)}?`,
						[
							{ name: "Yes", value: true },
							{ name: "No", value: false },
						],
						(m, v) => {
							if (v.value !== true) return;
							universal.send(universal.events.companion.del_key, {
								name: e.srcElement.dataset.name,
								item: e.srcElement.getAttribute("data-interaction"),
							});
						},
					);
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
				(universal.page < 0 ? 1 : 0) +
				(universal.page > 0
					? universal.config.iconCountPerPage * universal.page
					: 0);
			// we need to clone value, and change the pos, and uuid, then make a new key.
			universal.send(universal.events.companion.new_key, {
				[value.name]: {
					type: valueToo.type,
					plugin: valueToo.plugin,
					pos,
					uuid: `fdc.${Math.random() * 10000000}`,
					data: valueToo.data,
				},
			});
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

universal.loadEditorData = loadData;

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
	document.querySelector("#editor-btn").style.backgroundImage = "";
	if (interactionData.data.icon)
		document.querySelector("#editor-btn").style.backgroundImage =
			`url("${interactionData.data.icon}")`;
	if (interactionData.data.color)
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
							"NativeBridge is not running. Freedeck may be trying to start it.",
						);
						universal.sendToast(
							"If this message persists, please restart Freedeck or",
						)
						universal.sendToast(
							"run 'nbui.exe' in your Documents/Freedeck folder."
						)
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
		loadData(int.data);
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
		interaction.data = { ...interaction.data, ...templateData };
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
	document.querySelector("#upload-sound").disabled = true;
	universal.uiSounds.playSound("int_confirm");
	if (document.querySelector(universal.ctx.view_container))
		document.querySelector(universal.ctx.view_container).style.display =
			"block";
	universal._Uploads_View = 0;
	universal.ctx.destructiveView("library");
	universal._libraryOnload = () => {
		setupLibraryFor("sound");
	};
	universal._libraryOnpaint = () => {
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
			universal.vopen("index.html");
		};
	};
	universal._Uploads_Select = (itm) => {
		const interaction = JSON.parse(
			document
				.querySelector("#editor-btn[data-interaction]")
				.getAttribute("data-interaction"),
		);
		interaction.data.file = itm;
		interaction.data.path = "/sounds/";
		document
			.querySelector("#editor-btn[data-interaction]")
			.setAttribute("data-interaction", JSON.stringify(interaction));
		loadData(interaction.data);
		document.querySelector("#file.editor-data").value = itm;
		document.querySelector("#path.editor-data").value = "/sounds/";
		document.querySelector("#audio-file").innerText = itm;
		// document.querySelector("#audio-path").innerText = "/sounds/";

		universal.uiSounds.playSound("int_yes");
	};
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
	// document.querySelector("#audio-path").innerText = "/sounds/";
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
					"NativeBridge is not running. Freedeck may be trying to start it.",
				);
				universal.sendToast(
					"If this message persists, please restart Freedeck or",
				)
				universal.sendToast(
					"run 'nbui.exe' in your Documents/Freedeck folder."
				)
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

const setupLibraryFor = (type) => {
	if (type === "icon") {
		document.querySelector(".uploads-0").style.display = "none";
		document.querySelector("#uploads-0-title").style.display = "none";
		document.querySelector(".uploads-1").style.display = "flex";
		document.querySelector("#uploads-1-title").style.display = "block";
		document.querySelector("#library > body > center > p").textContent =
			"Select an icon to use, or upload a new one!";
		document.querySelector("#library > body > center > h1").textContent =
			"Available Icons";
		document.querySelector(".save-changes").style.display = "block";
	} else if (type === "sound") {
		document.querySelector(".uploads-0").style.display = "flex";
		document.querySelector("#uploads-0-title").style.display = "block";
		document.querySelector(".uploads-1").style.display = "none";
		document.querySelector("#uploads-1-title").style.display = "none";
		document.querySelector("#library > body > center > p").textContent =
			"Select an icon to use, or upload a new one!";
		document.querySelector("#library > body > center > h1").textContent =
			"Available Icons";
		document.querySelector(".save-changes").style.display = "block";
	} else {
		document.querySelector(".uploads-0").style.display = "flex";
		document.querySelector("#uploads-0-title").style.display = "block";
		document.querySelector(".uploads-1").style.display = "flex";
		document.querySelector("#uploads-1-title").style.display = "block";
		document.querySelector("#library > body > center > p").textContent =
			"Here you will find every sound or icon you've uploaded.";
		document.querySelector("#library > body > center > h1").textContent =
			"Library";
		document.querySelector(".save-changes").style.display = "none";
	}
};

document.querySelector("#upload-icon").onclick = (e) => {
	universal.uiSounds.playSound("int_confirm");
	if (document.querySelector(universal.ctx.view_container))
		document.querySelector(universal.ctx.view_container).style.display =
			"block";
	universal._Uploads_View = 1;
	universal.ctx.destructiveView("library");
	universal._libraryOnload = () => {
		setupLibraryFor("icon");
	};
	universal._libraryOnpaint = () => {
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
			universal.vopen("index.html");
		};
	};
	universal._Uploads_Select = (itm) => {
		const interaction = JSON.parse(
			document
				.querySelector("#editor-btn[data-interaction]")
				.getAttribute("data-interaction"),
		);
		interaction.data.icon = `/icons/${itm}`;
		document
			.querySelector("#editor-btn[data-interaction]")
			.setAttribute("data-interaction", JSON.stringify(interaction));
		document.querySelector("#editor-btn").style.backgroundImage =
			`url("${`/icons/${itm}`}")`;
		loadData(interaction.data);
		universal.uiSounds.playSound("int_yes");
	};
};

document.querySelector("#editor-close").onclick = () => {
	universal.uiSounds.playSound("int_no");
	document.querySelector("#editor").style.opacity = "0";
	document.querySelector("#sidebar").style.right = "0";
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
			modalContent,
		);
		if (returned === false) return;
		modal.remove();
	};
	modalContent.appendChild(modalButton);

	modal.appendChild(modalContent);

	document.body.appendChild(modal);
}

function showText(title, content, callback) {
	const modal = document.createElement("div");
	modal.className = "modal";

	const modalContent = document.createElement("div");
	modalContent.classList.add("modalContent");

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
	return modal;
}

/**
 * Create a list picker modal.
 * @param {String} title The title of the modal
 * @param {Array} listContent The content of the list
 * @param {void} callback What to do when submitted
 */
function showPick(title, listContent, callback, extraM = null, closable=true) {
	const modal = document.createElement("div");
	modal.className = "modal";

	const modalContent = document.createElement("div");
	modalContent.classList.add("modalContent");

	if(closable) {
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

	if(extraM != null) {
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
			modalContent,
		);
		if (returned === false) return;
		modal.remove();
	};
	modalContent.appendChild(modalButton);

	modal.appendChild(modalContent);

	document.body.appendChild(modal);
}

window.UniversalUI = {
	show: {
		showEditModal,
		showPick,
		showText
	}
}

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
						"Select a monitor device (where you will hear the sounds)",
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
								"Select your VB-Cable device (where you will play the sounds through)",
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
												universal.connHelpWizard();
										},
									);
								},
							);
						},
					);
				},
			);
		});
	});
};

if (universal.load("has_setup") === "false") {
	setupWizard();
}

universal.on(universal.events.user_mobile_conn, (isConn) => {
	if (universal.load("has_setup") === "false") return;
	if (isConn) document.querySelector(".mobd").style.display = "none";
	else document.querySelector(".mobd").style.display = "flex";
});

if (universal._information.mobileConnected)
	document.querySelector(".mobd").style.display = "none";

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

const lcfg = universal.lclCfg();

let tc = "repeat(5, 2fr)";
if (lcfg.tileRows) tc = tc.replace("5", lcfg.tileRows);
document.documentElement.style.setProperty("--tile-columns", tc);

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
			dat.incoming.appInformation.authorizationMessage,
			false
		);
		return;
	}
});

universal.listenFor("now-playing", (data) => {
	const { name, isMonitor } = data;
	if(isMonitor) return;
	const newEle = document.createElement("div");
	const filname = name.replace(/[^a-zA-Z0-9]/g, "");
	newEle.className = `np s-${filname}`;
 	newEle.innerText = name;
	document.querySelector("#np-sb").appendChild(newEle);
})

universal.listenFor("audio-end", (data) => {
	const filname = data.name.replace(/[^a-zA-Z0-9]/g, "");
	if(document.querySelector(`.s-${filname}`)) document.querySelector(`.s-${filname}`).remove();
});

window.showPick = showPick;

makeThanks();