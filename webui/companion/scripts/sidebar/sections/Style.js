import { UI } from "../../../../client/scripts/ui";
import { SidebarSection, SidebarSlider, SidebarCheck } from "../SidebarSection";

const style = new SidebarSection("Style");

const handleCheckFor = (e, property) => {
  universal.send(
    universal.events.default.config_changed,
		setToLocalCfg(property, e.target.checked),
	);
  universal.lclCfg()[property] = e.target.checked;
  UI.reloadSounds();
}


style.children.push(new SidebarCheck("Compact Mode", "es-center", (e) => handleCheckFor(e, "compact")));
style.children.push(new SidebarCheck("Scroll Long Text", "es-scroll", (e) => handleCheckFor(e, "scroll")));
style.children.push(new SidebarCheck("Fill Tiles", "es-fill", (e) => handleCheckFor(e, "fill")));

style.children.push(new SidebarSlider("Font Size", "es-fs", "px", "10", "25", "15", (e) => {
  universal.uiSounds.playSound("fdc_slider");
	document.documentElement.style.setProperty(
		"--font-size",
		`${e.target.value}px`,
	);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("font-size", e.target.value),
	);
}, () => {
  universal.uiSounds.playSound("fdc_slider");
	document.documentElement.style.setProperty("--font-size", "15px");
	setValue("#es-fs", 15);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("font-size", 15),
	);
}));

style.children.push(new SidebarSlider("Tile Size", "es-bs", "rem", "1", "12", "6", (e) => {
  universal.uiSounds.playSound("fdc_slider");
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("buttonSize", e.target.value),
	);
}, () => {
  universal.uiSounds.playSound("fdc_slider");
	setValue("#es-bs", 6);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("buttonSize", 6),
	);
}));

style.children.push(new SidebarSlider("Tile Count", "es-tc", " tiles", "12", "54", "12", (e) => {
  universal.uiSounds.playSound("fdc_slider");
	const count = document.querySelectorAll(".fdc-placeholder").length;
	const diff = e.target.value - count;
	if (diff > 0) {
		universal.lclCfg().iconCountPerPage = e.target.value;
		universal.config.iconCountPerPage = e.target.value;
		UI.reloadSounds();

		universal.send(
			universal.events.default.config_changed,
			setToLocalCfg("iconCountPerPage", universal.lclCfg().iconCountPerPage),
		);
	} else {
		for (let i = 0; i < Math.abs(diff); i++) {
			const last = document.querySelector(`.button.k-${count - i - 1}`);
			last.remove();
		}
	}
}, () => {
  setValue("#es-tc", 12);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("iconCountPerPage", 12),
	);
}));

style.children.push(new SidebarSlider("Columns", "es-tr", " cols", "4", "15", "5", (e) => {
  universal.uiSounds.playSound("fdc_slider");
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("tileCols", e.target.value),
	);
	let tc = "repeat(5, 2fr)";
	if (universal.lclCfg().tileCols) tc = tc.replace("5", e.target.value);
	document.documentElement.style.setProperty("--tile-columns", tc);
}, () => {
  universal.uiSounds.playSound("fdc_slider");
	setValue("#es-tr", 5);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("tileCols", 5),
	);
}));

style.children.push(new SidebarSlider("Hold Time", "es-lp", " sec", "2", "6", "3", (e) => {
  universal.uiSounds.playSound("fdc_slider");
  universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("longPressTime", e.target.value),
	);
}, () => {
  universal.uiSounds.playSound("fdc_slider");
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("longPressTime", 3),
	);
}));


document.querySelector(".sidebar").appendChild(style.build());

universal.listenFor("loadHooks", () => {
  document.querySelector("#es-scroll").checked = universal.lclCfg().scroll;
  document.querySelector("#es-center").checked = universal.lclCfg().compact;
  document.querySelector("#es-fill").checked = universal.lclCfg().fill;
  setValue("#es-fs", universal.lclCfg()["font-size"]);
  setValue("#es-bs", universal.lclCfg().buttonSize);
  setValue("#es-tc", universal.lclCfg().iconCountPerPage);
  setValue("#es-tr", universal.lclCfg().tileCols);
  setValue("#es-lp", universal.lclCfg().longPressTime);
})

const setToLocalCfg = (key, value) => {
	const cfg = universal.lclCfg();
	cfg[key] = value;
	return cfg;
};

function setValue(id, val) {
	document.querySelector(id).value = val;
	document
		.querySelector(id)
		.parentElement.querySelector(".fdc-slider-value").innerText =
		val + (document.querySelector(id).getAttribute("postfix") || "");
}