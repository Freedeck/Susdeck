/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// Page sorter! No more manual pages!
const Pages = {};

const autosort = (countOnEP) => {
  let pagesAmount = Math.ceil(Sounds.length / universal.iconCount);
  let pageCounter = 0;
  let index = 0;
  pagesAmount = Math.ceil(Sounds.length / countOnEP); // Set the amount of pages
  for (let i = 0; i < pagesAmount; i++) {
    Pages[i] = []; // Loop through and clear each page
  }

  pageCounter = 0; // Start on page 0
  index = 0; // Alongside sound 0

  Sounds.forEach(sound => { // Loop through each sound
    if (sound.page) {
      if (!Pages[sound.page]) Pages[sound.page] = [];
      Pages[sound.page].push(sound);
      return;
    }
    Pages[pageCounter].push(sound); // Add it to a page
    sound.page = pageCounter; // Set the page
    if (index === countOnEP) { // However, if we reach the max icon count for the screen,
      pageCounter++; // Increment the page
      index = 0; // And reset the sound amount counter
      return;
    }
    index++; // Increment sound index/amount
  });
};
