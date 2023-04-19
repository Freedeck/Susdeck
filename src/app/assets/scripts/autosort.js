// Page sorter! No more manual pages!
const Pages = {};
const countOnEachPage = 8;
// eslint-disable-next-line no-undef
const pagesAmount = Sounds.length / countOnEachPage;
for (let i = 0; i < pagesAmount; i++) {
  Pages[i] = [];
}
let pageCounter = 0;
let index = 0;
// eslint-disable-next-line no-undef
Sounds.forEach(sound => {
  Pages[pageCounter].push(sound);
  if (index === countOnEachPage) {
    pageCounter++;
    index = 0;
  }
  index++;
});
