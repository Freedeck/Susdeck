import { SidebarSection } from "../SidebarSection";

const style = new SidebarSection("Client", "es-client");

document.querySelector(".sidebar").appendChild(style.build());
