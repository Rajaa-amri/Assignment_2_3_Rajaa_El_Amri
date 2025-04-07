<template>
  <div class="q-pa-lg bg-netflix text-white">
    <h1 class="text-center text-h4 text-red q-mb-lg">Welcome to Movie Blog</h1>

    <div class="row q-gutter-md items-center q-mb-md justify-center">
      <q-btn
        @click="changeOrder"
        :label="asc ? 'Sort by rating: Ascending' : 'Sort by rating: Descending'"
        color="red"
        icon="sort"
        glossy
        rounded
        text-color="white"
      />
    </div>

    <div class="column q-gutter-md">
      <div
        v-for="movie in sortedMovies"
        :key="movie.id"
        class="q-pa-sm"
      >
        <q-card class="my-card bg-dark-card text-white">
          <div class="row no-wrap">
            <q-img
              :src="'https://image.tmdb.org/t/p/w200' + movie.poster_path"
              style="cursor: pointer; width: 150px;"
              class="rounded-borders"
              @click="goToDetail(movie.id)"
            />
            <div class="q-pa-md col">
              <div
                class="text-h6 text-weight-bold text-red cursor-pointer"
                @click="goToDetail(movie.id)"
              >
                {{ movie.title }}
              </div>
              <div class="q-mt-xs">
                <q-badge
                  :color="getRatingColor(movie.vote_average)"
                  align="top"
                  class="q-mb-xs"
                  text-color="white"
                >
                  Rating: {{ movie.vote_average.toFixed(1) }} / 5
                </q-badge>
              </div>
              <div v-if="movie.runtime" class="text-body2 text-grey-5">
                Duration: {{ movie.runtime }} minutes
              </div>
              <div v-if="movie.genres" class="text-body2 text-grey-5">
                Categories: {{ movie.genres.map(g => g.name).join(', ') }}
              </div>
              <q-btn
                color="red"
                icon="favorite"
                label="Add to Favorites"
                size="sm"
                class="q-mt-sm"
                @click="addToFavorites(movie)"
                glossy
                rounded
                text-color="white"
              />
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()
const { isAuthenticated, idTokenClaims } = useAuth0()

const movies = ref([])
const asc = ref(false)
const jwt = ref('')

onMounted(async () => {
  if (isAuthenticated.value) {
    jwt.value = idTokenClaims.value.__raw
  }
})
watch(isAuthenticated, (newVal) => {
  if (newVal) {
    jwt.value = idTokenClaims.value.__raw
  }
})

const fetchMovies = async () => {
  const response = await fetch(
    `https://api.themoviedb.org/3/discover/movie?page=1&sort_by=popularity.desc`,
    {
      headers: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ZGE3YzViNTJhYmE3NGFlMGM5ZTllZGY1N2MwNTMyOSIsInN1YiI6IjY1OTlkMGE1ODc0MWM0MDI1ODk0MWI2YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sQR8VoqyKp4TmWwd6XYB-jtDZ21wALDDFgUrXnyfYYk',
      },
    }
  )
  const data = await response.json()
  const results = data.results

  const detailedMovies = await Promise.all(
    results.map(async (movie) => {
      const details = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}`,
        {
          headers: {
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2ZGE3YzViNTJhYmE3NGFlMGM5ZTllZGY1N2MwNTMyOSIsInN1YiI6IjY1OTlkMGE1ODc0MWM0MDI1ODk0MWI2YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sQR8VoqyKp4TmWwd6XYB-jtDZ21wALDDFgUrXnyfYYk',
          },
        }
      )
      const movieDetails = await details.json()
      return {
        ...movie,
        vote_average: normalizeRating(movie.vote_average),
        runtime: movieDetails.runtime,
        genres: movieDetails.genres,
        release_date: movie.release_date,
      }
    })
  )
  movies.value = detailedMovies
}

onMounted(fetchMovies)

const normalizeRating = (rating) => Math.round((rating / 2) * 10) / 10

const changeOrder = () => {
  asc.value = !asc.value
}

const sortedMovies = computed(() =>
  [...movies.value].sort((a, b) =>
    asc.value
      ? a.vote_average - b.vote_average
      : b.vote_average - a.vote_average
  )
)

const getRatingColor = (rating) => {
  if (rating >= 4.5) return 'green'
  if (rating >= 3.5) return 'blue'
  if (rating >= 2.5) return 'orange'
  return 'red'
}

const goToDetail = (id) => {
  router.push(`/movie/${id}`)
}

async function addToFavorites(movie) {
  try {
    const response = await fetch('/api/movies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt.value}`,
      },
      body: JSON.stringify({
        title: movie.title,
        director: movie.director || '',
        year: movie.release_date?.split('-')[0],
        movieId: movie.id,
        ImdbRate: movie.vote_average,
        personalRating: 0,
      }),
    })
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    $q.notify({
      color: 'positive',
      position: 'bottom',
      message: 'Movie added to favorites',
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      position: 'bottom',
      message: 'Error adding movie to favorites',
    })
    console.error('Error adding favorite:', error)
  }
}
</script>

<style scoped>
.bg-netflix {
  background-color: #141414;
}

.text-red {
  color: #e50914 !important;
}

.bg-dark-card {
  background-color: #1f1f1f;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

.my-card:hover {
  transform: scale(1.01);
  transition: transform 0.2s ease-in-out;
}
</style>
