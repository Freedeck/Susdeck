import EditorViewLogic from "./EditorViewLogic.js";

const audioFile = document.querySelector("#audio-file");
const type = document.querySelector("#type");
const editorButton = document.querySelector("#editor-btn");

const playbackSoundView = document.querySelector(".view_nested_playback");

class Sound extends EditorViewLogic {
  constructor() {
    super("audio", "fd.sound");
  
    this.setOnRun(({interactionData}) => {
      audioFile.innerText = interactionData.data.file;
    })

    this.setOnFirstSetup(({interactionData}) => {
      interactionData.type = "fd.sound";
      interactionData.data.file = "Unset.mp3";
      interactionData.data.path = "/sounds/";
      editorButton.setAttribute("data-interaction", JSON.stringify(interactionData));
      audioFile.innerText = "Unset.mp3";
      type.value = "fd.sound";
    });
  }
}

export default Sound;