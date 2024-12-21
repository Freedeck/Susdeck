window.onerror = (message, source, lineno, colno, error) => {
  let modal = document.createElement("dialog");
  if(!document.querySelector("#error-dialog")) {
    modal.id = "error-dialog";
    modal.classList.add("dialog");
    const content = document.createElement("div");
    content.innerHTML = `
    <h1>Freedeck</h1>
    <p>
      Freedeck has encountered an unrecoverable error. Please reload the app to continue.
      If that doesn't work, you may need to close and reopen the app.
    </p>
    <details open>
      <summary>Error Details</summary>
      <small>
        ${message} in ${source} at line ${lineno}:${colno}
      </small>
    </details>
    <br>
    <div class='flex-wrap-r'>
    <a style='display:block;width:100%;font-size:1.5em;text-align:center;' href='javascript:window.location.reload();'>Reload</a>
    <a style='display:block;width:100%;font-size:1.5em;text-align:center;' href='javascript:window.ErrorIgnore();'>Ignore</a>
    </div>
    <small>Ignoring the error may cause Freedeck to be unusable.</small>
    `

    modal.appendChild(content);
    document.body.appendChild(modal);
    modal.showModal();
  } else modal = document.querySelector("#error-dialog");

  console.log(message, source, lineno, colno, error);
};

window.ErrorIgnore = () => {
  document.querySelector("#error-dialog").remove();
}