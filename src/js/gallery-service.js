import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api';
const API_KEY = '32027481-190e41b90c8ab57a00c099eff';

export default class GalleryApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
  }

  fetchGallery() {
    const searchParams = new URLSearchParams({
      key: API_KEY,
      q: this.searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: this.page,
      per_page: 40,
    });
    const url = `${BASE_URL}/?${searchParams}`;

    // return fetch(url).then(response => {
    //   if (!response.ok) {
    //     onFetchError();
    //   }
    //   return response.json();
    // });

    return axios.get(url).then(({ data }) => {
      this.incrementPage();
      return data;
    });
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
