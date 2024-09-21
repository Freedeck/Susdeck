const Pages = {};

import otherHandler from "./ui/otherHandler.js";

/**
 * @name quickActions
 * @param {*} e The event that was triggered
 */
function quickActions(e) {}

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
					indicator.className = "plugin-missing";
					keyObject.appendChild(indicator);
					continue;
				}
				let typeExists = false;
				for (const tyc of universal._tyc.keys()) {
					if (tyc.type === snd.type) typeExists = true;
				}
				if (!typeExists) {
					console.log("type missing", snd.type);
					const indicator = document.createElement("div");
					indicator.className = "plugin-type-missing";
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
			
			if (snd.data.longPress === "true") {
				out += "<p>Long press to activate.</p>";
			} else {
				out += "<p>Short press to activate.</p>"
			}
			
			if (snd.plugin) {
				out += `<p>This tile uses ${universal.cleanHTML(snd.plugin, false)}.</p>`;
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
export const UI = {
	reloadSounds,
	reloadProfile,
	quickActions,
	Pages,
};
