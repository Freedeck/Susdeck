/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// Page sorter! No more manual pages!
const Pages = {};
const countOnEachPage = universal.iconCount;
let pagesAmount = Sounds.length / countOnEachPage;
let pageCounter = 0;
let index = 0;

function autosort (countOnEP) {
  pagesAmount = Math.floor(Sounds.length / countOnEP); // Set the amount of pages
  for (let i = 0; i < pagesAmount; i++) {
    Pages[i] = []; // Loop through and clear each page
  }

  pageCounter = 0; // Start on page 0
  index = 0; // Alongside sound 0

  Sounds.forEach(sound => { // Loop through each sound
    Pages[pageCounter].push(sound); // Add it to a page
    if (index === countOnEP) { // However, if we reach the max icon count for the screen,
      pageCounter++; // Increment the page
      index = 0; // And reset the sound amount counter
      return;
    }
    index++; // Increment sound index/amount
  });
}
