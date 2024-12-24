import EditorViewLogic from "./EditorViewLogic.js";

const editorButton = document.querySelector("#editor-btn");

class Profile extends EditorViewLogic {
  constructor() {
    super("profile", "fd.profile");
  
    this.setOnRun(({interactionData}) => {
      universal.generateProfileSelect();
      document.querySelector("#eprofile-select").value =
        interactionData.data.profile;
    })

    this.setOnFirstSetup(({interactionData}) => {
      const int = JSON.parse(editorButton.getAttribute("data-interaction"));
      int.type = "fd.profile";
      int.data.profile = "Default";
      editorButton.setAttribute("data-interaction", JSON.stringify(int));
      document.querySelector("#type").value = "fd.profile";
      universal.generateProfileSelect();
      document.querySelector("#eprofile-select").value = int.data.profile;
    });
  }
}

export default Profile;