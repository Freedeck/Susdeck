import { UI } from "../../../../client/scripts/ui";
import { SidebarSection, SidebarButton } from "../SidebarSection";

const style = new SidebarSection("", "");

style.children.push({
  build: () => {
    const h1 = document.createElement("h1");
    h1.classList.add("cpage");
    h1.innerText = "Page: 0/0";
    return h1;
  }
})

const previousPage = new SidebarButton("Previous Page", (e) => {
  if (UI.Pages[universal.page - 1]) {
		universal.page--;
		universal.save("page", universal.page);
		universal.uiSounds.playSound("page_down");
		UI.reloadSounds();
		universal.sendEvent("page_change");
    universal.sendEvent("animate_page");
  }
});

const nextPage = new SidebarButton("Next Page", (e) => {
  if (UI.Pages[universal.page + 1]) {
		universal.page++;
		universal.save("page", universal.page);
		universal.uiSounds.playSound("page_up");
		UI.reloadSounds();
		universal.sendEvent("page_change");
    universal.sendEvent("animate_page");
	}
});

style.children.push({
  build: () => {
    const div = document.createElement("div");
    div.classList.add("flex-wrap-r");
    div.appendChild(previousPage.build());
    div.appendChild(nextPage.build());
    return div;
  }
});


document.querySelector(".sidebar").appendChild(style.build());
