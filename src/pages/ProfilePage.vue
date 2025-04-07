<template>
  <div class="q-pa-md bg-netflix text-white" v-if="isAuthenticated">
    <!-- Benutzerprofil -->
    <q-card class="user-card q-mb-xl bg-dark-card text-white">
      <q-card-section class="text-center">
        <q-avatar size="100px" class="q-mb-sm">
          <img :src="user.picture" alt="Profile Picture" />
        </q-avatar>
        <div class="text-h6 text-red">{{ user.name }}</div>
        <div class="text-subtitle2 text-grey-5">{{ user.email }}</div>
      </q-card-section>
    </q-card>

    <h2 class="text-h5 text-center q-mb-lg text-red">Your Favorite Movies</h2>

    <!-- Favoritenliste -->
    <div class="column q-gutter-md">
      <div
        v-for="movie in movies"
        :key="movie.movieId"
        class="q-pa-sm"
      >
        <q-card class="my-card bg-dark-card text-white">
          <div class="row no-wrap">
            <q-img
              :src="'https://image.tmdb.org/t/p/w200' + movie.poster_path"
              style="width: 150px; cursor: pointer"
              class="rounded-borders"
              @click="$router.push('/movie/' + movie.movieId)"
            />
            <div class="q-pa-md col">
              <div class="text-h6 text-red cursor-pointer" @click="$router.push('/movie/' + movie.movieId)">
                {{ movie.title }}
              </div>
              <div class="text-body2 text-grey-5">
                Release Year: {{ movie.release_date?.split('-')[0] || 'Unknown' }}
              </div>
              <div class="text-body2 text-grey-5">
                Categories: {{ movie.genres.map(g => g.name).join(', ') }}
              </div>
              <div class="text-body2 text-grey-5">
                Languages: {{ movie.spoken_languages.map(l => l.english_name).join(', ') }}
              </div>
              <div class="text-body2 text-grey-5">
                Runtime: {{ movie.runtime }} min
              </div>
              <q-badge class="q-mt-sm bg-red text-white">
                TMDB Rating: {{ (movie.vote_average / 2).toFixed(1) }} / 5
              </q-badge>
              <q-badge class="q-ml-sm q-mt-sm bg-grey-9 text-red">
                Your Rating: {{ movie.personalRating }} / 5
              </q-badge>
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'

const { isAuthenticated, user, idTokenClaims } = useAuth0()
const jwt = ref('')
const movies = ref([])

const fetchFavorites = async () => {
  try {
    const response = await fetch('/api/movies', {
      headers: {
        Authorization: `Bearer ${jwt.value}`,
      },
    })
    if (!response.ok) throw new Error('Failed to fetch favorites')
    const savedMovies = await response.json()

    // Für jeden gespeicherten Film: Detaildaten von TMDB nachladen
    const enrichedMovies = await Promise.all(savedMovies.map(async (fav) => {
      try {
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/${fav.movieId}`, {
          headers: {
            Authorization: 'Bearer <DEIN_TMDB_API_TOKEN>',
          },
        })
        const tmdbData = await tmdbRes.json()
        return {
          ...tmdbData,
          movieId: fav.movieId,
          personalRating: fav.personalRating || 0,
        }
     } catch (err) {
  console.error('Failed to load TMDB data for movieId', fav.movieId, err)
  return fav // Fallback
}

    }))

    movies.value = enrichedMovies
  } catch (error) {
    console.error('Error loading favorite movies:', error)
  }
}

onMounted(async () => {
  if (isAuthenticated.value && idTokenClaims.value) {
    jwt.value = idTokenClaims.value.__raw
    await fetchFavorites()
  }
})

watch(isAuthenticated, async (newVal) => {
  if (newVal && idTokenClaims.value) {
    jwt.value = idTokenClaims.value.__raw
    await fetchFavorites()
  }
})
</script>

<style scoped>
.bg-netflix {
  background-color: #141414;
  color: white;
}

.text-red {
  color: #e50914 !important;
}

.bg-red {
  background-color: #e50914 !important;
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

.user-card {
  max-width: 400px;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
