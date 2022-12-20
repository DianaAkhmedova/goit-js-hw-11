import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import GalleryApiService from './js/gallery-service';
import { btnUp } from './js/btn-up';
import { getRefs } from './js/refs';
import { renderGallery } from './js/render-gallery';
import './css/styles.css';
import 'simplelightbox/dist/simple-lightbox.min.css';

const galleryApiService = new GalleryApiService();
const lightbox = new SimpleLightbox('.gallery a');
const observer = new IntersectionObserver(onEntry, {
  root: null,
  rootMargin: '0px 0px 200px 0px',
  threshold: 1.0,
});

const refs = getRefs();

refs.searchButton.setAttribute('disabled', true);

function hundleImput(e) {
  const name = e.currentTarget.value;
  if (name.trim() !== '') {
    return refs.searchButton.removeAttribute('disabled');
  }

  return refs.searchButton.setAttribute('disabled', true);
}

function fetchGalleryData() {
  return galleryApiService.fetchGallery().then(({ data }) => {
    galleryApiService.incrementPage();
    return data;
  });
}

function onSearch(e) {
  e.preventDefault();
  clearMarkup();

  galleryApiService.query = e.currentTarget.elements.searchQuery.value;

  refs.searchButton.setAttribute('disabled', true);

  galleryApiService.resetPage();

  refs.notification.classList.add('visually-hidden');

  fetchGalleryData()
    .then(({ hits, totalHits }) => {
      if (hits.length === 0) {
        onFetchError();
        return;
      }
      Notify.success(`Hooray! We found ${totalHits} images.`);
      renderGallery(hits);
      observer.observe(refs.sentinel);
      lightbox.refresh();
    })
    .catch(error => console.log(error));
}

function onEntry(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting && galleryApiService.page !== 1) {
      fetchGalleryData()
        .then(({ hits, totalHits }) => {
          renderGallery(hits);
          lightbox.refresh();
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

refs.input.addEventListener('input', hundleImput);
refs.form.addEventListener('submit', onSearch);

btnUp.addEventListener();
