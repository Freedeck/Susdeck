/* eslint-disable no-undef */
// Page sorter! No more manual pages!
const Pages = {};
const currentTheme = susdeckUniversal.load('theme');
const sUTheme = susdeckUniversal.themes[currentTheme];
let countOnEachPage = 8;

sUTheme.forEach(property => {
  Object.keys(property).forEach(key => {
    if (key === 'icon-count') {
      countOnEachPage = property[key];
    }
  });
});

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
