
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const movieResults = document.getElementById('movieResults');
const movieModal = document.getElementById('movieModal');
const closeModalButton = document.querySelector('.close-button');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const genreElement = document.getElementById('genre');
const imdbRatingElement = document.getElementById('imdbRating');
const directorElement = document.getElementById('director');
const actorsElement = document.getElementById('actors');
const runtimeElement = document.getElementById('runtime');
const recommendationsGrid = document.getElementById('recommendations');

const API_KEY = 'e8b97624';

async function searchMovies() {
    const query = searchInput.value.trim();
    if (query === '') return;

    const movieUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${API_KEY}`;
    try {
        movieResults.querySelector('.movie-grid').innerHTML = '';
        const spinner = document.createElement('div');
        spinner.classList.add('spinner');
        movieResults.appendChild(spinner);

        const response = await fetch(movieUrl);
        const data = await response.json();

        movieResults.removeChild(spinner);

        if (data.Response === 'True') {
            data.Search.forEach(movie => {
                const movieCard = createMovieCard(movie);
                movieResults.querySelector('.movie-grid').appendChild(movieCard);
            });
        } else {
            showError(data.Error);
        }
    } catch (error) {
        showError('An error occurred while fetching data.');
    }
}

function showError(message) {
    movieResults.querySelector('.movie-grid').innerHTML = `<p>${message}</p>`;
}

function createMovieCard(movie) {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');
    movieCard.innerHTML = `
        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300'}" alt="${movie.Title}">
        <h3>${movie.Title}</h3>
        <p>${movie.Year}</p>
    `;
    movieCard.addEventListener('click', () => openMovieModal(movie.imdbID));
    return movieCard;
}

async function openMovieModal(imdbID) {
    const movieUrl = `https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`;

    try {
        const response = await fetch(movieUrl);
        const movieData = await response.json();

        if (movieData.Response === 'True') {
            document.body.style.overflow = 'hidden';

            modalTitle.textContent = movieData.Title;
            modalDescription.textContent = movieData.Plot;
            genreElement.textContent = movieData.Genre;
            imdbRatingElement.textContent = movieData.imdbRating;
            directorElement.textContent = movieData.Director;
            actorsElement.textContent = movieData.Actors;
            runtimeElement.textContent = movieData.Runtime;

            fetchRecommendedMovies(movieData.Genre);

            document.body.classList.add('no-scroll');
            movieModal.style.display = 'flex';
            movieModal.setAttribute('aria-hidden', 'false');
        } else {
            showError('Movie details not found.');
        }
    } catch (error) {
        showError('An error occurred while fetching movie details.');
    }
}

function closeModal() {
  
    document.body.style.overflow = 'auto';

    document.body.classList.remove('no-scroll');
    movieModal.style.display = 'none';
    movieModal.setAttribute('aria-hidden', 'true');
}

async function fetchRecommendedMovies(genre) {
    const recommendedUrl = `https://www.omdbapi.com/?s=${encodeURIComponent(genre)}&type=movie&apikey=${API_KEY}`;
    try {
        const response = await fetch(recommendedUrl);
        const data = await response.json();

        if (data.Response === 'True') {
            recommendationsGrid.innerHTML = '';
            data.Search.slice(0, 5).forEach(movie => {
                const recommendationCard = createMovieCard(movie);
                recommendationsGrid.appendChild(recommendationCard);
            });
        } else {
            recommendationsGrid.innerHTML = '<p>No recommendations available.</p>';
        }
    } catch (error) {
        recommendationsGrid.innerHTML = '<p>An error occurred while fetching recommendations.</p>';
    }
}

searchButton.addEventListener('click', searchMovies);
closeModalButton.addEventListener('click', closeModal);

searchInput.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        searchMovies();
    }
});
