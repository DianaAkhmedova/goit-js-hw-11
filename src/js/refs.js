export function getRefs() {
  return {
    input: document.querySelector('[name="searchQuery"]'),
    form: document.querySelector('.search-form'),
    searchButton: document.querySelector('[type="submit"]'),
    gallery: document.querySelector('.gallery'),
    notification: document.querySelector('.notification'),
    sentinel: document.querySelector('#sentinel'),
  };
}
