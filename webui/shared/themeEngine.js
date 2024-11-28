const listing = [];
const listingData = {};
let currentTheme = {};

function getPathFor(id) {
	console.log(id)
	if(id.endsWith("#")) {
		return `/hooks/_themes/${id.split("#")[0]}`;
	}
	return `/app/shared/theming/${id}`;
}

async function fetchAndParse(id) {
	const fetchable = await fetch(getPathFor(id));
	let theme;
	if (fetchable.status !== 200) {
		console.error(`Failed to fetch theme ${id}`);
		return universal.sendToast(`Failed to fetch theme ${id}`);
	}
	const rawData = await fetchable.text();
	const meta = rawData.match(/:theme-meta {([\s\S]*?)}/);
	if (!meta) {
		universal.sendToast(`Failed to parse theme ${id}`);
		return console.error(`Failed to parse theme ${id}`);
	}
	theme = {};
	const metaLines = meta[1].split("\n");
	for (const line of metaLines) {
		if (!line.trim()) continue;
		const [key, value] = line.trim().split(": ");
		theme[key.split("--")[1]] = value.split('";')[0].split('"')[1];
	}
	theme.raw = rawData;
	listingData[id] = theme;
	return theme;
}

async function initialize() {
  for(const t of universal._information.themes) {
    listing.push(t)
    universal.CLU("Boot / Theme Engine", `Added theme ${t}`);
  }
}

function setTheme(name, global = true) {
	const fu = listing.includes(name) ? name : "default";

	fetch(getPathFor(fu))
		.then((res) => res.text())
		.then((css) => {
			if (document.getElementById("theme")) {
				document.getElementById("theme").remove();
			}
			const stylea = document.createElement("style");
			stylea.id = "theme";
			stylea.innerText += css;
			document.body.appendChild(stylea);
			universal.save("theme", name);
			const dStyle = getComputedStyle(document.body);
			currentTheme = {
				name: dStyle.getPropertyValue("--theme-name"),
				author: dStyle.getPropertyValue("--theme-author"),
				description: dStyle.getPropertyValue("--theme-description"),
			};
			if (global) universal.send(universal.events.companion.set_theme, name);
			universal.save("theme", name);
		})
		.catch(() => {
			console.error("Failed to load theme.");
			universal.sendToast("Failed to load theme.");
		});
}

export default {
	listing,
  listingData,
  initialize,
	fetchAndParse,
	setTheme,
  currentTheme
};
