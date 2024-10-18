import { SidebarSection, SidebarButton } from "../SidebarSection";

const style = new SidebarSection("Mobile Device", "MobileDevice", ["mobd", "rem-mobd"]);

style.children.push(new SidebarButton("Pair Mobile Device", (e) => {
  universal.connHelpWizard();
}, 'mobd-conn'));


document.querySelector(".sidebar").appendChild(style.build());
