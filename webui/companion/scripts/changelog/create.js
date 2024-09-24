import changes from './changes.json';

const makeThanks = () => {
  if(universal.load("thanks") !== '\x9Eée') return;
  const {major, other, known} = changes;
  const container = document.createElement("dialog");
  container.classList.add("dialog");
  container.id = "thanks";
  const content = document.createElement("div");
  content.classList.add("modalContent");
  const close = document.createElement("button");
  close.onclick = () => {
    document.querySelector("#thanks").style.display = "none";
		universal.save("thanks", "true");
  }
  close.innerText = "OK";

  const title = document.createElement("h1");
  title.innerText = "Thanks you for using Freedeck!";
  content.appendChild(title);
  const description = document.createElement("p");
  description.innerText = "A lot has changed since the previous update, so here are the changes."
  content.appendChild(description);

  const majorDetails = document.createElement("details");
  const summaryMajor = document.createElement("summary");
  summaryMajor.innerText = "Major Changes";
  majorDetails.appendChild(summaryMajor);
  const majorList = document.createElement("ul");
  for(const m of major) {
    
    if(Array.isArray(m)) {
      makeNested(m, majorList);
    } else {
      const item = document.createElement("li");
      item.innerHTML = formatting(m);
      majorList.appendChild(item);
    }
  };
  majorDetails.appendChild(majorList);
  content.appendChild(majorDetails);

  const otherDetails = document.createElement("details");
  const summaryOther = document.createElement("summary");
  summaryOther.innerText = "Other Changes";
  otherDetails.appendChild(summaryOther);
  const otherList = document.createElement("ul");
  for(const o of other) {
    const item = document.createElement("li");
    item.innerHTML = formatting(o);
    otherList.appendChild(item);
  };
  otherDetails.appendChild(otherList);

  content.appendChild(otherDetails);

  const knownDetails = document.createElement("details");
  const summaryKnown = document.createElement("summary");
  summaryKnown.innerText = "Known Issues";
  knownDetails.appendChild(summaryKnown);
  const knownList = document.createElement("ul");
  for(const k of known) {
    const item = document.createElement("li");
    item.innerHTML = formatting(k);
    knownList.appendChild(item);
  };
  knownDetails.appendChild(knownList);

  content.appendChild(knownDetails);

  const linebrak1 = document.createElement("br");
  content.appendChild(linebrak1);

  const discord = document.createElement("a");
  discord.href = "https://discord.gg/7gWrgyt7Aa";
  discord.innerText = "Join our Discord!";

  content.appendChild(discord);

  const linebrak2 = document.createElement("br");
  content.appendChild(linebrak2);

  const version = document.createElement("p");
  version.innerText = `Welcome to ${universal._information.version.human}.`;
  content.appendChild(version);

  const bb = document.createElement("br");
  content.appendChild(bb);

  content.appendChild(close);
  container.appendChild(content);
  document.body.appendChild(container);
}

const formatting = (data) => {
  const strong = /\*\*(.*?)\*\*/g;
  const em = /\*(.*?)\*/g;

  return data.replace(strong, "<strong>$1</strong>").replace(em, "<em>$1</em>");
}

const makeNested = (data, parent) => {
  for(const key in data) {
    const ul = document.createElement("ul");
    if(typeof data[key] === 'object') {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.innerText = key;
      details.appendChild(summary);
      const list = document.createElement("ul");
      makeNested(data[key], list);
      details.appendChild(list);
      ul.appendChild(details);
      } else {
      const item = document.createElement("li");
      item.innerHTML = formatting(data[key]);
      ul.appendChild(item);
    }
    parent.appendChild(ul);
  }
}

export {makeThanks};