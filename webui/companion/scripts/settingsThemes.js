universal.listenFor("loadHooks", () => {
	st_ldt();
});

window.st_ldt = async () => {
	document.querySelector(".themelist").innerHTML = "";
	for (const id of universal.theming.listing) {
		let theme = universal.theming.listingData[id];
		if (!theme) {
			theme = await universal.theming.fetchAndParse(id);
		}
		const element = document.createElement("div");
		element.className = "theme";
		const title = document.createElement("h2");
		title.innerText = theme.name;
		element.appendChild(title);
		const desc = document.createElement("p");
		desc.innerText = theme.description;
		const apply = document.createElement("i");
		apply.innerText = "Click to apply.";
		element.onclick = () => {
			universal.save("theme", id);
			universal.send(universal.events.companion.set_theme, id);
			universal.theming.setTheme(
				id, true
			);
			st_ldt();
		};
		if (universal.load("theme") === id) {
			title.innerText += " (Active)";
			element.style.backgroundColor = "rgba(0, 0, 0, 0.725)";
			apply.innerText = "";
		}
		element.appendChild(desc);
		element.appendChild(apply);
		document.querySelector(".themelist").appendChild(element);
	}
};
