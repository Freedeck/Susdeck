import { SidebarSection } from "../SidebarSection";

const style = new SidebarSection("", "", ["mobd", "rem-mobd"]);

style.children.push(
  {
    build: () => {
      const elem = document.createElement("h2");
      elem.innerText = "Freedeck";
      elem.style.textAlign = "center";
      return elem;
    }
  }
)

style.children.push(
  {
    build: () => {
      const elem = document.createElement("p");
      elem.innerText = "Thank you for using Freedeck!";
      elem.style.textAlign = "center";
      elem.style.fontSize = "0.75em";
      return elem;
    }
  }
)

style.children.push(
  {
    build: () => {
      const elem = document.createElement("small");
      elem.innerHTML = 'Freedeck is open-source and can be found on <a href="https://github.com/Freedeck/Freedeck" target="_blank">GitHub.</a>'
      elem.style.textAlign = "center";
      return elem;
    }
  }
)

style.children.push(
  {
    build: () => {
      const elem = document.createElement("br");
      return elem;
    }
  }
)


document.querySelector(".sidebar").appendChild(style.build());
