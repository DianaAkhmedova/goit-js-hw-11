import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import GalleryApiService from './js/gallery-service';
import { btnUp } from './js/btn-up';
import './css/styles.css';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  input: document.querySelector('[name="searchQuery"]'),
  form: document.querySelector('.search-form'),
  searchButton: document.querySelector('[type="submit"]'),
  gallery: document.querySelector('.gallery'),
  notification: document.querySelector('.notification'),
  sentinel: document.querySelector('#sentinel'),
};

const lightbox = new SimpleLightbox('.gallery a');
const galleryApiService = new GalleryApiService();
const observer = new IntersectionObserver(onEntry, {
  rootMargin: '150px',
});

observer.observe(refs.sentinel);

refs.searchButton.setAttribute('disabled', true);

function hundleImput(e) {
  const name = e.currentTarget.value;
  if (name.trim() !== '') {
    return refs.searchButton.removeAttribute('disabled');
  }

  return refs.searchButton.setAttribute('disabled', true);
}

function renderImg(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card"><div class="thumb"><a class="gallery__item" href=${largeImageURL}>
      <img class="gallery__image" src=${webformatURL} alt=${tags} loading="lazy" width=320 /></a></div>
      <div class="info">
        <p class="info-item">
          <b>Likes</b><span>${likes}</span>
        </p>
        <p class="info-item">
          <b>Views</b><span>${views}</span>
        </p>
        <p class="info-item">
          <b>Comments</b><span>${comments}</span>
        </p>
        <p class="info-item">
          <b>Downloads</b><span>${downloads}</span>
        </p>
      </div>
    </div>`
    )
    .join('');

  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function onSearch(e) {
  e.preventDefault();
  observer.unobserve(refs.sentinel);

  galleryApiService.query = e.currentTarget.elements.searchQuery.value;

  refs.searchButton.setAttribute('disabled', true);

  galleryApiService.resetPage();

  refs.notification.classList.add('visually-hidden');

  galleryApiService
    .fetchGallery()
    .then(({ hits, totalHits }) => {
      if (hits.length === 0) {
        onFetchError();
        return;
      }
      Notify.success(`Hooray! We found ${totalHits} images.`);
      // observer.observe(refs.sentinel);
      clearMarkup();

      renderImg(hits);
      scroll();
      observer.observe(refs.sentinel);
      lightbox.refresh();
    })
    .catch(error => console.log(error));
}

function onEntry(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting && galleryApiService.query !== '') {
      galleryApiService
        .fetchGallery()
        .then(({ hits, totalHits }) => {
          renderImg(hits);
          // scroll();
          lightbox.refresh();
          console.log(galleryApiService.page);
          console.log(Math.ceil(totalHits / 40));
          if (galleryApiService.page >= Math.ceil(totalHits / 40)) {
            Notify.info(
              "We're sorry, but you've reached the end of search results."
            );
            refs.notification.classList.remove('visually-hidden');
            observer.unobserve(refs.sentinel);
          }
        })
        .catch(error => console.log(error));
    }
  });
}

function onFetchError() {
  clearMarkup();
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function clearMarkup() {
  refs.gallery.innerHTML = '';
}

function scroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

refs.input.addEventListener('input', hundleImput);
refs.form.addEventListener('submit', onSearch);

btnUp.addEventListener();
