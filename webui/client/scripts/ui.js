const Pages = {};

import otherHandler from "./ui/otherHandler.js";

/**
 * @name quickActions
 * @param {*} e The event that was triggered
 */
function quickActions(e) {}

let openCloseBootLog;
let bootLog;
let bootLogCenter;
let bootLogContainer;

function makeBootLog() {
	const thisbootLog = document.createElement("div");
	thisbootLog.id = "boot-log-div";
	thisbootLog.innerHTML = "<img src='/logo_big.png' class='n-icon'><h1>Freedeck</h1><div style='display:none;' id='boot-log'></div><center class='oclb'><button style='display:none;' id='oclb'>Close Boot Log</button></center>";
	document.body.appendChild(thisbootLog);
	bootLog = thisbootLog;
	bootLogCenter = document.querySelector("#boot-log-div > center");
	bootLogContainer = document.querySelector("#boot-log");
	bootLogContainer.style.display = 'none';
	openCloseBootLog = document.querySelector("#oclb");
	openCloseBootLog.style.display = 'none';
	openCloseBootLog.addEventListener("click", () => {
		closeBootLog();
	});
}

function showBootLog() {
	return new Promise((resolve, reject) => {
		universal.CLU("Boot / UI : WARNING!", "The boot log style hasn't been updated, and won't be! You may notice a few imperfections.");
		bootLogContainer.style.scale='1';
		bootLogContainer.style.display='block';
			openCloseBootLog.style.display = 'block';
			bootLog.style.animation = "pull-down 0.5s";
			bootLog.style.display = 'block';
	})
}

function closeBootLog() {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(true);
			bootLogContainer.style.scale='0';
			openCloseBootLog.style.display = 'none';
			if(universal.load("skipanim") === "true") {
				bootLog.style.display = 'none';
				if(window.splashScreen)
					window.splashScreen.unsplash();
			} else {
			setTimeout(() => {
					bootLogContainer.style.display = "none";
					if(window.splashScreen)
						window.splashScreen.unsplash();
					setTimeout(() => {
							bootLog.style.animation = "pull-up 0.5s";
							bootLog.querySelector("h1").style.animation = "real-fade-out 0.5s";
							bootLog.querySelector("img").style.animation = "real-fade-out 0.5s";
							setTimeout(() => {
								bootLog.style.display = 'none';
							}, 499);
						},200);
			}, 499);
			}
		}, 250); 
	})
}

function initialize() {
	universal.CLU("Boot / UI", "Initializing UI");
	universal.config.iconCountPerPage = Number.parseInt(universal.lclCfg().iconCountPerPage) || 12;
	universal.CLU("Boot / UI", "Set icon count");
	universal.theming.setTheme(
		universal.config.theme ? universal.config.theme : "default",
		false,
	);
	universal.CLU("Boot / UI", "Set local theme");
	if (universal.lclCfg()["font-size"] !== 15) {
		document.documentElement.style.setProperty(
			"--font-size",
			`${universal.lclCfg()["font-size"]}px`,
		);
	}
	universal.CLU("Boot / UI", "Set font size");
	reloadSounds();
	universal.CLU("Boot / UI", "Reloaded sounds");
	universal.CLU("Boot / UI", "UI initialized");
	universal.showBootLog = showBootLog;
	universal.closeBootLog = closeBootLog;
}

/**
 * @name reloadProfile
 * @description Reload the current profile
 */
function reloadProfile() {
	universal.config.sounds = universal.config.profiles[universal.config.profile];
	let max = 0;
	for (
		let i = 0;
		i < universal.config.sounds.length / universal.config.iconCountPerPage;
		i++
	) {
		Pages[i] = true;
		max++;
	}

	for (const sound of universal.config.sounds) {
		const k = Object.keys(sound)[0];
		const snd = sound[k];
		if (snd.pos >= max * universal.config.iconCountPerPage) {
			Pages[max] = true;
			max++;
		}
	}
}

/**
 * @name reloadPluginViews
 * @description reload plugin views for the editor
 */
function reloadPluginViews() {
	for (const view of document.querySelectorAll(".plugin-view")) {
		view.remove();
	}
	for (const plkey in universal.plugins) {
		const plugin = universal.plugins[plkey];
		if(Object.keys(plugin.views).length === 0) continue;
		for (const view in plugin.views) {
			const viewData = plugin.views[view];
			const viewElement = document.createElement("div");
			viewElement.classList.add("plugin-view");
			viewElement.classList.add("editor-section");
			viewElement.style.display = "none";
			viewElement.id = `plugin-view-${btoa(view).toLowerCase().split("=")[0]}`;
			(async () => {
				const data = await fetch(`/hooks/_views/${plugin.id}/${viewData}/view.html`);
				const text = await data.text();
				viewElement.innerHTML = text;
				const script = document.createElement("script");
				script.src = `/hooks/_views/${plugin.id}/${viewData}/script.js`;
				script.type = "module";
				document.body.appendChild(script);
			})();
			document.querySelector("#editor-div").insertBefore(viewElement, document.querySelector(".editor-options"));
			const selectorBtn = document.createElement("button");
			selectorBtn.innerText = view;
			selectorBtn.onclick = () => {
				document.querySelector("#none-only").style.display = "none";
				for (const v of document.querySelectorAll(".plugin-view")) {
					v.style.display = "none";
				}
				const editor = document.querySelector("#editor-btn");
				const int = JSON.parse(editor.getAttribute("data-interaction"));
				int.data._view = btoa(view).toLowerCase().split("=")[0];
				universal.setEditorData("_view", btoa(view).toLowerCase().split("=")[0], int);
				editor.setAttribute("data-interaction", JSON.stringify(int));
				document.querySelector(`#plugin-view-${btoa(view).toLowerCase().split("=")[0]}`).style.display = "block";
			}
			document.querySelector(".plugin-view-listing").appendChild(selectorBtn);
		}
	}
}
window.RplTest = reloadPluginViews;

/**
 * @name reloadSounds
 * @description Reload all of the sounds in the client's DOM.
 */
function reloadSounds() {
	if (universal.lclCfg().fill) {
		const style = document.createElement("style");
		style.type = "text/css";
		style.id = "fill";
		const styles = `
				#keys .button {
				width: unset; height: unset;
				}
		`;
		if (style.styleSheet) style.styleSheet.cssText = styles;
		else style.appendChild(document.createTextNode(styles));
		document.head.appendChild(style);
	} else {
		const style = document.getElementById("fill");
		if (style) style.remove();
	}
	if (universal.lclCfg().compact) {
		universal.keys.style.width = "unset";
		universal.keys.style.height = "unset";
	} else {
		universal.keys.style.width = "100%";
		universal.keys.style.height = "100%";
	}
	universal.config.iconCountPerPage = universal.lclCfg().iconCountPerPage;
	universal.page =
		universal.load("page") !== "\x9Eée"
			? Number.parseInt(universal.load("page"))
			: 0;
	reloadProfile();
	for (const key of document.querySelectorAll("#keys > .button")) {
		key.remove();
	}
	if (document.querySelector(".k")) {
		for (const k of document.querySelectorAll(".k")) {
			k.remove();
		}
	}
	if (document.querySelector(".cpage")) {
		document.querySelector(".cpage").innerText =
			`Page: ${universal.page + 1}/${Object.keys(Pages).length}`;
	}
	universal.keySet();
	for (const el of document.querySelectorAll(".tile-tooltip")) {
		el.remove();
	}
	for (const sound of universal.config.sounds) {
		const k = Object.keys(sound)[0];
		const snd = sound[k];
		let keyObject = document.querySelector(`.k-${snd.pos}`);

		if (snd.pos < universal.config.iconCountPerPage * universal.page) continue;
		if (!keyObject) {
			if (universal.page === 0) continue;
			const newPos =
				snd.pos - universal.config.iconCountPerPage * universal.page;
			snd.pos = newPos;
			keyObject = document.querySelector(`.k-${snd.pos}`);
			snd.pos = newPos + universal.config.iconCountPerPage * universal.page;
		}
		try {
			if (snd.pos >= universal.config.iconCountPerPage * (universal.page + 1))
				continue;
			keyObject.setAttribute("data-interaction", JSON.stringify(snd));
			keyObject.setAttribute("data-name", k);
			keyObject.className = keyObject.className.replace("unset", "");

			if (snd.data.icon)
				keyObject.style.backgroundImage = `url("${snd.data.icon}")`;
			if (snd.data.color) keyObject.style.backgroundColor = snd.data.color;
			if (snd.data.fontSize) keyObject.style.fontSize = snd.data.fontSize;

			otherHandler(snd.type, keyObject, snd, sound);

			if (!snd.type.includes("fd.")) {
				if (!universal.plugins[snd.plugin]) {
					console.log("plugin missing", snd.plugin);
					const indicator = document.createElement("div");
					indicator.className = "indicator-red";
					keyObject.appendChild(indicator);
				}
				let typeExists = false;
				for (const tyc of universal._tyc.keys()) {
					if (tyc.type === snd.type) typeExists = true;
				}
				if (!typeExists && universal.plugins[snd.plugin]) {
					console.log("type missing", snd.type);
					const indicator = document.createElement("div");
					indicator.className = "indicator-yellow";
					keyObject.appendChild(indicator);
				}
			}

			// check if two sounds share the same pos, if they do make this button color yellow
			const sounds = universal.config.sounds.filter((sound) => {
				const ev = universal.page > 0 ? 1 : 0;
				const k = Object.keys(sound)[0];
				return (
					sound[k].pos ===
					snd.pos + universal.page * universal.config.iconCountPerPage + ev
				);
			});
			if (sounds.length > 1) {
				keyObject.classList.add("duplicate");
			}

			if (universal.name !== "Companion") continue;
			let out = "";
			out += `<h4>${universal.cleanHTML(k, false)}</h4>`;
			

			if(snd.renderType !== "text") {
				out += (snd.data.longPress === "true" ? "<p>Long press to activate.</p>" : "<p>Short press to activate.</p>")
			} else {
				out += "<p>Not pressable.</p>";
			}
			

			if (snd.plugin) {
				if(universal.plugins[snd.plugin])
					out += `<p>This tile uses ${universal.cleanHTML(snd.plugin, false)}.</p>`;
				else
					out += `<p>${universal.cleanHTML(snd.plugin, false)} could not be found.</p>`
				for (const i of Array.from(universal._tyc.keys())) {
					if (i.type === snd.type) {
						out += `<code>${i.name}</code>`;
						break;
					}
				}
			}
			if (snd.type === "fd.sound") {
				out += "<p>Plays sound:</p>";
				out += `<code>${universal.cleanHTML(snd.data.path, false)}${universal.cleanHTML(snd.data.file, false)}</code>`;
			}
			if (snd.type === "fd.profile") {
				out += "<p>Opens folder:</p>";
				out += `<code>${universal.cleanHTML(snd.data.profile, false)}</code>`;
			}
			if (snd.type === "fd.none") {
				out += "<p>Does nothing.</p>";
			} else if(snd.type === "fd.select") {
				out += "<p>No plugin selected.</p>"
			}

			out += "<p>Right click to edit.</p>";
			out += `<details><summary>Advanced (press V)</summary><p>Type: ${snd.type}</p><p>Pos: ${snd.pos}</p><p>Data size: ${Object.keys(snd.data).length}</p></details>`;

			const tt = universal.createTooltipFor(keyObject, out);
			tt.classList.add("tile-tooltip");
			
			window.addEventListener("keydown", (e) => {
				if (e.key === "v") {
					tt.querySelector("details").open = !tt.querySelector("details").open;
				}
			})
		} catch (e) {
			console.log(
				`while rendering sound: ${k}`,
				sound[k].pos,
				universal.page,
				sound[k].pos - universal.config.iconCountPerPage * universal.page,
			);
			console.error(e);
		}
	}
	universal.sendEvent("page_change");
	// document.getElementById('keys').style.maxHeight = document.querySelectorAll('.k').length * (10*12)/window.innerWidth + '%';
}

function visualIdTileChangeText(tileId, text) {
	for(const button of document.querySelectorAll(".button")) {
		if (button.getAttribute("data-interaction")) {
			const dat = JSON.parse(button.getAttribute("data-interaction"));
			if (dat.uuid === tileId && button.id !== "editor-btn") {
				const txt = button.querySelector(".button-text p");
				txt.innerText = text;
			}
		}
	};
}

function visualTypeTileChangeText(tileId, text) {
	for(const button of document.querySelectorAll(".button")) {
		if (button.getAttribute("data-interaction")) {
			const dat = JSON.parse(button.getAttribute("data-interaction"));
			if (dat.type === tileId && button.id !== "editor-btn") {
				const txt = button.querySelector(".button-text p");
				txt.innerText = text;
			}
		}
	};
}

export const UI = {
	reloadSounds,
	reloadProfile,
	quickActions,
	Pages,
	initialize,
	makeBootLog,
	closeBootLog,
	showBootLog,
	visual: {
		idChangeText: visualIdTileChangeText,
		typeChangeText: visualTypeTileChangeText
	},
	reloadPluginViews
};
