/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// Page sorter! No more manual pages!
const Pages = {};
const countOnEachPage = susdeckUniversal.iconCount;

const pagesAmount = Sounds.length / countOnEachPage;
for (let i = 0; i < pagesAmount; i++) {
  Pages[i] = [];
}
let pageCounter = 0;
let index = 0;

Sounds.forEach(sound => {
  Pages[pageCounter].push(sound);
  if (index === countOnEachPage) {
    pageCounter++;
    index = 0;
  }
  index++;
});

function autosort (countOnEP) {
  const pagesAmount = Sounds.length / countOnEP;
  for (let i = 0; i < pagesAmount; i++) {
    Pages[i] = [];
  }
  let pageCounter = 0;
  let index = 0;

  Sounds.forEach(sound => {
    Pages[pageCounter].push(sound);
    if (index === countOnEP) {
      pageCounter++;
      index = 0;
    }
    index++;
  });
}
