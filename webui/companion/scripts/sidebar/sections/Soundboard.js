import { SidebarSection, SidebarSlider, SidebarButton } from "../SidebarSection";

const style = new SidebarSection("Soundboard");

style.children.push({build:()=>{
  const d = document.createElement("div");
  d.id = "np-sb";
  return d;
}})

style.children.push(new SidebarButton("Stop All", (e) => {universal.audioClient.stopAll();}));

style.children.push(new SidebarSlider("Pitch", "pitch", "%", "0.1", "2", "1", (e) => {
  universal.audioClient.setPitch(e.target.value)
}, () => {
  universal.audioClient.setPitch(1);
}, 0.1));

style.children.push(new SidebarSlider("Volume", "v", "%", "0", "100", "100", (e) => {
  universal.audioClient.setVolume(e.target.value / 100)
}, () => {
  universal.audioClient.setVolume(1)
}));

document.querySelector(".sidebar").appendChild(style.build());

universal.listenFor("loadHooks", () => {
  if(universal.load("pitch"))
    setValue("#pitch", Number.parseInt(universal.load("pitch")));
  if(universal.load("vol"))
    setValue("#v", universal.load("vol") * 100);
})

function setValue(id, val) {
	document.querySelector(id).value = val;
	document
		.querySelector(id)
		.parentElement.querySelector(".fdc-slider-value").innerText =
		val + (document.querySelector(id).getAttribute("postfix") || "");
}