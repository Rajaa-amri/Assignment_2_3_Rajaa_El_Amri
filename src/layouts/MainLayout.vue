<template>
  <q-layout view="hHh lpR fFf" class="q-pa-none layout-netflix">
    <!-- Header -->
    <q-header elevated class="bg-dark text-white">
      <q-toolbar class="justify-between">
        <div class="flex items-center">
          <q-btn flat round dense icon="home" class="text-white" @click="$router.push('/')" />
          <q-toolbar-title class="text-white cursor-pointer" @click="$router.push('/')">
            Movie Blog
          </q-toolbar-title>
        </div>

        <!-- Suchfeld -->
        <div class="search-container flex justify-center">
          <q-input
            v-model="search"
            dense
            standout
            clearable
            placeholder="Search for a movie..."
            class="text-white search-input"
            color="red"
            bg-color="black"
            style="border-radius: 8px; max-width: 400px;"
          >
            <template v-slot:append>
              <q-icon name="search" class="text-white" />
            </template>
          </q-input>
        </div>

        <!-- Benutzer Dropdown -->
        <div class="flex items-center">
          <q-btn-dropdown
            flat
            round
            dense
            icon="account_circle"
            class="text-white"
            v-if="isAuthenticated !== null"
          >
            <q-list style="min-width: 150px">
              <q-item
                v-if="!isAuthenticated"
                clickable
                v-close-popup
                @click="loginUser"
              >
                <q-item-section avatar>
                  <q-icon name="login" class="text-red" />
                </q-item-section>
                <q-item-section class="text-red">Login</q-item-section>
              </q-item>

              <template v-else>
                <q-item clickable v-close-popup @click="$router.push({ path: '/profile' })">
                  <q-item-section avatar>
                    <q-icon name="person" class="text-red" />
                  </q-item-section>
                  <q-item-section class="text-red">Profile</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="logoutUser">
                  <q-item-section avatar>
                    <q-icon name="logout" class="text-red" />
                  </q-item-section>
                  <q-item-section class="text-red">Logout</q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Seiteninhalt -->
    <q-page-container class="q-pa-none content-container bg-page">
      <router-view />
    </q-page-container>

    <!-- Footer -->
    <q-footer class="bg-dark text-white q-pa-md text-center">
      <div class="footer-content text-center q-mx-auto">
        <div>© 2025 Movie Blog. All rights reserved.</div>
        <div class="social-icons q-mt-sm">
          <q-btn flat round dense icon="mdi-facebook" class="text-white" />
          <q-btn flat round dense icon="mdi-twitter" class="text-white" />
          <q-btn flat round dense icon="mdi-instagram" class="text-white" />
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth0 } from '@auth0/auth0-vue'

const search = ref('')
const { loginWithRedirect, logout, isAuthenticated } = useAuth0()

function loginUser() {
  loginWithRedirect()
}

function logoutUser() {
  logout()
}
</script>

<style scoped>
.layout-netflix {
  background-color: #141414;
  color: #fff;
}

.q-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.q-page-container {
  padding-bottom: 0;
  flex: 1;
  background-color: #141414;
}

.q-footer {
  background-color: #1c1c1c;
  padding: 10px 0;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.4);
}

/* 🎯 Text & Icon-Farbe im Dropdown-Menü */
.q-item-section.text-white,
.q-item-section.text-black {
  color: #e50914 !important;
}

/* 🎯 Suchfeld Styling */
.search-input ::v-deep(.q-field__control) {
  background-color: #000 !important;
  color: #e50914 !important;
  border: 1px solid #e50914 !important;
}

.search-input ::v-deep(.q-field__native) {
  color: #e50914 !important;
}

.search-input ::v-deep(.q-placeholder) {
  color: #e50914 !important;
  opacity: 0.6;
}

.search-input ::v-deep(.q-field--highlighted),
.search-input ::v-deep(.q-field__focusable:focus-within) {
  border-color: #e50914 !important;
}
</style>

