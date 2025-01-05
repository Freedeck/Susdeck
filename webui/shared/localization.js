/**
 * Adapted from https://phrase.com/blog/posts/step-step-guide-javascript-localization/
 */

const defaultLocale = "en";
//TODO: Add more locales here
const locales = {
  "en": "English",
  "es": "Español",
}
// The active locale
let locale;
// Gets filled with active locale translations
let translations = {};

function doLocalization() {
  setLocale(defaultLocale);
}

  // Load translations for the given locale and translate
  // the page to this locale
  async function setLocale(newLocale) {
    if (newLocale === locale) return;
    const newTranslations =
      await fetchTranslationsFor(newLocale);
    locale = newLocale;
    translations = newTranslations;
    translatePage();
  }
  // Retrieve translations JSON object for the given
  // locale over the network
  async function fetchTranslationsFor(newLocale) {
    const response = await fetch(`/app/shared/lang/${newLocale}.json`);
    return await response.json();
  }
  // Replace the inner text of each element that has a
  // data-i18n-key attribute with the translation corresponding
  // to its data-i18n-key
  function translatePage(specific=document) {
    console.log("translating page",specific);
    specific
      .querySelectorAll("[data-i18n-key]")
      .forEach(translateElement);
  }
  // Replace the inner text of the given HTML element
  // with the translation in the active locale,
  // corresponding to the element's data-i18n-key
  function translateElement(element) {
    const key = element.getAttribute("data-i18n-key");
    const translation = translations[key];
    console.log('Localizing:', key, translation);
    element.innerText = translation;
}

export {
  locales,
  doLocalization,
  setLocale,
  fetchTranslationsFor,
  translatePage,
  translateElement,
};