const editorButton = document.querySelector("#editor-btn");

document.querySelector("#color").onchange = (e) => {
  editorButton.style.backgroundColor =
    e.srcElement.value;
  document.querySelector("#color").dataset.has_set = "true";
  const interaction = JSON.parse(editorButton.getAttribute("data-interaction"));
  interaction.data.color = e.srcElement.value;
  editorButton
    .setAttribute("data-interaction", JSON.stringify(interaction));
  universal.loadEditorData(interaction.data);
};

document.querySelector("#name").onkeyup = (e) => {
  editorButton.innerText = e.srcElement.value;
}

const wants = [
  {
      class: "no-bg",
      data: "showBg",
      selector: "#sbg"
  },
  {
    class: "no-border",
    data: "noBorder",
    selector: "#nbo"
  },
  {
    class: "no-rounding",
    data: "noRounding",
    selector: "#nbr"
  },
  {
    class: "no-shadow",
    data: "noShadow",
    selector: "#nsh"
  }
]

for(const w of wants) {
  document.querySelector(w.selector).onclick = (e) => {
    const isCheck = e.srcElement.checked;
    if(isCheck) editorButton.classList.add(w.class);
    else editorButton.classList.remove(w.class);
  }
}

universal.listenFor("editTile", (d) => {
  const data = d.data;
  if(data.color) document.querySelector("#color").value = data.color;
  for(const w of wants) {
    if(data[w.data]) editorButton.classList.add(w.class);
    else editorButton.classList.remove(w.class);
  }
})