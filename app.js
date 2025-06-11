const apiKey = "7b1bdc4a5194d147c4d4b93d53b38c2f";

const ctxBar = document.getElementById('movieChart').getContext('2d');
const ctxPie = document.getElementById('genreChart').getContext('2d');
const ctxLine = document.getElementById('trendChart').getContext('2d');
const ctxLang = document.getElementById('languageChart').getContext('2d');

let chartBar, chartPie, chartLine, chartLang;
let genreMap = {};

async function loadGenres() {
  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=es`;
  const res = await fetch(url);
  const data = await res.json();

  const genreSelect = document.getElementById('genreFilter');
  data.genres.forEach(genre => {
    genreMap[genre.id] = genre.name;
    const option = document.createElement('option');
    option.value = genre.id;
    option.textContent = genre.name;
    genreSelect.appendChild(option);
  });
}

async function fetchMovies(filters) {
  const { year, genre, lang, country } = filters;
  let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=es&sort_by=popularity.desc`;

  if (year) url += `&primary_release_year=${year}`;
  if (genre) url += `&with_genres=${genre}`;
  if (lang) url += `&with_original_language=${lang}`;
  if (country) url += `&region=${country}`;

  const res = await fetch(url);
  const data = await res.json();
  const movies = data.results;

  // 🎯 Gráfico de barras - Top 10
  const titles = movies.map(m => m.title).slice(0, 10);
  const votes = movies.map(m => m.vote_average).slice(0, 10);

  if (chartBar) chartBar.destroy();
  chartBar = new Chart(ctxBar, {
    type: 'bar',
    data: {
      labels: titles,
      datasets: [{
        label: 'Puntaje promedio',
        data: votes,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 10
        }
      }
    }
  });

  // 🍿 Gráfico de torta - Géneros
  const genreCounts = {};
  movies.forEach(movie => {
    movie.genre_ids.forEach(id => {
      if (!genreCounts[id]) genreCounts[id] = 0;
      genreCounts[id]++;
    });
  });

  const genreLabels = Object.keys(genreCounts).map(id => genreMap[id]);
  const genreValues = Object.values(genreCounts);

  if (chartPie) chartPie.destroy();
  chartPie = new Chart(ctxPie, {
    type: 'pie',
    data: {
      labels: genreLabels,
      datasets: [{
        label: 'Distribución por género',
        data: genreValues,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6384', '#36A2EB'
        ]
      }]
    },
    options: { responsive: true }
  });

  // 🌍 Gráfico de doughnut - Idiomas
  const langCounts = {};
  movies.forEach(movie => {
    const lang = movie.original_language;
    if (!langCounts[lang]) langCounts[lang] = 0;
    langCounts[lang]++;
  });

  const langLabels = Object.keys(langCounts);
  const langValues = Object.values(langCounts);

  if (chartLang) chartLang.destroy();
  chartLang = new Chart(ctxLang, {
    type: 'doughnut',
    data: {
      labels: langLabels,
      datasets: [{
        label: 'Distribución por idioma',
        data: langValues,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#C9CBCF'
        ]
      }]
    },
    options: { responsive: true }
  });

  // 📈 Gráfico de línea - Películas por año
  fetchMovieTrends({ genre, lang, country });
}

async function fetchMovieTrends(filters) {
  const years = [2023, 2022, 2021, 2020, 2019];
  const counts = [];

  for (const year of years) {
    let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=es&sort_by=popularity.desc&primary_release_year=${year}`;
    if (filters.genre) url += `&with_genres=${filters.genre}`;
    if (filters.lang) url += `&with_original_language=${filters.lang}`;
    if (filters.country) url += `&region=${filters.country}`;

    const res = await fetch(url);
    const data = await res.json();
    counts.push(data.total_results || 0);
  }

  if (chartLine) chartLine.destroy();
  chartLine = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Películas populares por año',
        data: counts,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function getFilters() {
  return {
    year: document.getElementById('yearFilter').value,
    genre: document.getElementById('genreFilter').value,
    lang: document.getElementById('langFilter').value,
    country: document.getElementById('countryFilter').value
  };
}

['yearFilter', 'genreFilter', 'langFilter', 'countryFilter'].forEach(id => {
  document.getElementById(id).addEventListener('change', () => {
    fetchMovies(getFilters());
  });
});

loadGenres();
fetchMovies(getFilters());
