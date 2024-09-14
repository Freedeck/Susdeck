import { SidebarSection, SidebarButton } from "../SidebarSection";

const style = new SidebarSection("Folders", "es-profiles");

style.children.push(new SidebarButton("", ()=>{
  window.UniversalUI.show.showEditModal(
		"New Folder",
		"Enter a name for the new folder",
		(modal, value, feedback, title, button, input, content) => {
			if (value.length < 1) {
				feedback.innerText = "Please enter a name for the folder";
				return false;
			}
			universal.page = 0;
			universal.save("page", universal.page);
			universal.send(universal.events.companion.add_profile, value);
			return true;
		},
	);
}, "pf-add"))

style.children.push(new SidebarButton("", ()=>{
  window.UniversalUI.show.showEditModal(
		"Duplicate Folder",
		"Enter a name for the new folder",
		(modal, value, feedback, title, button, input, content) => {
			if (value.length < 1) {
				feedback.innerText = "Please enter a name for the folder";
				return false;
			}
			universal.send(universal.events.companion.dup_profile, value);
			return true;
		},
	);
}, "pf-dupe"))

style.children.push(new SidebarButton("", ()=>{
  window.UniversalUI.show.showEditModal(
		"Import Folder",
		"Enter the folder data to import",
		(modal, pfData, feedback, title, button, input, content) => {
			try {
				const data = JSON.parse(pfData);
				window.UniversalUI.show.showEditModal(
					"Import Folder",
					"Enter a name for the new folder",
					(modal, value, feedback, title, button, input, content) => {
						if (value.length < 1) {
							feedback.innerText = "Please enter a name for the folder";
							return false;
						}
						universal.send(universal.events.companion.import_profile, {
							name: value,
							data,
						});
					},
				);
				return true;
			} catch (e) {
				feedback.innerText = "Invalid JSON data";
				return false;
			}
		},
	);
}, "pf-imp"))

style.children.push(new SidebarButton("", ()=>{
  const profile = universal.config.profiles[universal.config.profile];
	const data = JSON.stringify(profile);
	const blob = new Blob([data], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = `${universal.config.profile}.json`;
	a.click();
	URL.revokeObjectURL(url);
}, "pf-exp"))


const profileTxt = document.createElement("h2");
// document.body.appendChild(profileTxt);

const profileSelect = document.createElement("select");

universal.listenFor("loadHooks", () => {
	for (const profile of Object.keys(universal.config.profiles)) {
		const option = document.createElement("option");
		option.innerText = profile;
		option.setAttribute("value", profile);
		profileSelect.appendChild(option);
	}
	profileTxt.innerHTML = `Folder:&nbsp<i>${universal.config.profile}</i>`;
	profileSelect.value = universal.config.profile;
})

profileSelect.onchange = () => {
	universal.page = 0;
	universal.save("page", universal.page);
	universal.send(universal.events.companion.set_profile, profileSelect.value);
};

style.children.push({build:()=>profileTxt});
style.children.push({build:()=>profileSelect});

document.querySelector(".sidebar").appendChild(style.build());
