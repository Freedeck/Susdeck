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
	for (const sound of universal.config.sounds) {
		const k = Object.keys(sound)[0];
		const snd = sound[k];
		let keyObject = document.querySelector(`.k-${snd.pos}`);

		if (snd.pos < universal.config.iconCountPerPage * universal.page) return;
		if (!keyObject) {
			if (universal.page === 0) return;
			const newPos =
				snd.pos - universal.config.iconCountPerPage * universal.page;
			snd.pos = newPos;
			keyObject = document.querySelector(`.k-${snd.pos}`);
			snd.pos = newPos + universal.config.iconCountPerPage * universal.page;
		}
		try {
			if (snd.pos >= universal.config.iconCountPerPage * (universal.page + 1))
				return;
			if (
				universal.lclCfg().center &&
				!keyObject.classList.contains("center")
			) {
				keyObject.classList.add("tiles-center");
			} else {
				keyObject.classList.remove("tiles-center");
			}
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
					return;
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
				keyObject.style.background = "yellow";
			}
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
	// document.getElementById('keys').style.maxHeight = document.querySelectorAll('.k').length * (10*12)/window.innerWidth + '%';
}

export const UI = {
	reloadSounds,
	reloadProfile,
	quickActions,
	Pages,
};
