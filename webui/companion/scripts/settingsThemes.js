universal.listenFor("loadHooks", () => {
	st_ldt();
});

window.st_ldt = async () => {
	document.querySelector(".themelist").innerHTML = "";
	for (const id of universal.themes) {
		let theme = universal._data_themes_cache[id];
		if (!theme) {
			theme = await universal.themeParse(id);
		}
		const element = document.createElement("div");
		element.className = "theme";
		const title = document.createElement("h2");
		title.innerText = theme.name;
		element.appendChild(title);
		const desc = document.createElement("p");
		desc.innerText = theme.description;
		const apply = document.createElement("p");
		apply.innerText = "Click to apply.";
		element.onclick = () => {
			universal.save("theme", id);
			universal.send(universal.events.companion.set_theme, id);
			universal.setTheme(
				id, true
			);
			st_ldt();
		};
		if (universal.load("theme") === id) {
			title.innerText += " (Active)";
			apply.disabled = true;
			apply.style.backgroundColor = "rgba(0, 0, 0, 0.125)";
			apply.innerText = "In Use";
		}
		element.appendChild(desc);
		element.appendChild(apply);
		document.querySelector(".themelist").appendChild(element);
	}
};
