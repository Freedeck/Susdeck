import EditorViewLogic from "./EditorViewLogic.js";

const type = document.querySelector("#type");
const editorButton = document.querySelector("#editor-btn");

class Macro extends EditorViewLogic {
  constructor() {
    super("macro", "fd.macro", "fd.macro_text");
  
    this.setOnRun(({interactionData}) => {
      const data = interactionData.data;
      if(data.macro) {
        document.querySelector("#macro-type").value = interactionData.type === "fd.macro" ? "macro" : "text";
        document.querySelector("#macro-macro").value = data.macro;
      }
    })

    this.setOnFirstSetup(() => {
      const int = JSON.parse(editorButton.getAttribute("data-interaction"));
      int.type = "fd.macro_text";
      type.value = "fd.macro_text";
      editorButton.setAttribute("data-interaction", JSON.stringify(int));
    })
  }
}

export default Macro;