import "./sidebar/sections/SidebarLoader.js";

import contextual from "./lib/ctxl.js";
universal.ctx = contextual;

document.body.appendChild(contextual.createViewContainer());
document.body.querySelector(contextual.view_container).style.display = 'none';

contextual.addView("marketplace");
contextual.addView("plugins");
contextual.addView("settings");
contextual.addView("library");
contextual.addView("prompts");

HTMLElement.prototype.setHTML = function (html) {
	this.innerHTML = html;
};

universal.listenFor("init", () => {
	const login = document.createElement("li");
	login.id = "constat";
	document.querySelector("#sidebar > ul").appendChild(login);
});

document.onkeydown = (ev) => universal.uiSounds.playSound("int_type");

const pages = ["library", "plugins", "marketplace", "settings", "prompts"];

const sidebarEle = document.createElement("div");
sidebarEle.id = "sidebar";
const sidebarUl = document.createElement("ul");
sidebarEle.appendChild(sidebarUl);
let sidebar = [];
universal.reloadRight = () => {
	sidebar = [
		{ Tiles: "index.html" },
		{ Library: "library.html" },
		{ Plugins: "plugins.html" },
		{ Marketplace: "marketplace.html" },
		{ Settings: "settings.html" },
		{ Connect: "/connect2.html?id=Companion&new_ip=true" },
	];
	if(universal.load("has_setup") === "false") {
		sidebar = [
			{ "Connect Device": "prompts.html" },
		]
	}
	if(universal.load("swc") === "true")
		sidebar.push({'Recompile': '+universal.send(universal.events.default.recompile)'})
	sidebarUl.setHTML(
		`<li style="font-size: .6em; background: none; margin: 0 auto;">
		<span style="display:flex;align-items:center;">
		<img src="/common/icons/fd.png" width="50" height="50" alt="Freedeck" />
		&nbsp;
		<h2>Freedeck</h2>
		</span>
		</li>`,
	);
	for (const itm of sidebar) {
		const name = Object.keys(itm)[0];
		const val = itm[name];
		const page = pages.find((p) => val.includes(p)) || val;
		if (val.startsWith("+")) {
			const ele = document.createElement("li");
			ele.setHTML(`<a onclick="${val.substring(1)}">${name}</a>`);
			sidebarUl.appendChild(ele);
			break;
		}
		const ele = document.createElement("li");
		ele.setAttribute("hovereffect", "yes");
		ele.setHTML(`<a onclick="universal.vopen('${page}')">${name}</a>`);
		sidebarUl.appendChild(ele);
	}
}

universal.reloadRight();
universal.vclose = () => {
	const view_container = document.querySelector(universal.ctx.view_container);
	setAnim(view_container, "pull-up 0.5s");
	setTimeout(() => {
		setDisplay(view_container, "none");
	}, 500);
}

universal.vopen = (v) => {
	universal.uiSounds.playSound("sidebar");
	const view_container = document.querySelector(universal.ctx.view_container);
	const leftSidebar = document.querySelector(".sidebar");

	if(view_container == null) return;

	if (!pages.includes(v)) {
		if(leftSidebar.style.display === 'none') document.querySelector(".toggle-sidebar button").click();
		setAnim(view_container, "pull-up 0.5s");
		setTimeout(() => {
			setDisplay(view_container, "none");
		}, 500);
		if (v.startsWith("/")) window.location.href = v;
		return;
	}

	setDisplay(view_container, "block");
	if(leftSidebar.style.display === 'flex') document.querySelector(".toggle-sidebar button").click();
	universal.ctx.destructiveView(v);
	setAnim(view_container, "pull-down 0.5s");
};

function setDisplay(ele, val) {
	if(ele) ele.style.display = val;
}

function setAnim(ele, val) {
	if(ele) ele.style.animation = val;
}

document.body.appendChild(sidebarEle);
