<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/api'
import { saveSession } from '../services/session'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const isSubmitting = ref(false)

async function handleLogin() {
  if (!username.value || !password.value) return
  try {
    isSubmitting.value = true
    error.value = ''
    const { data } = await authService.login({ username: username.value, password: password.value })
    saveSession(data.tokens.access, data.tokens.refresh, data.account, username.value)
    router.push('/overview')
  } catch (err: any) {
    // Reads the exact error message sa Django backend natin
    const msg = err.response?.data?.message || err.response?.data?.detail
    error.value = msg || 'Sign in failed. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="grid min-h-screen place-items-center p-4">
    <div class="brut-card w-full max-w-md p-6 sm:p-8">
      <h1 class="brut-title text-5xl">BHMS.</h1>
      <p class="mb-6 mt-1 text-muted">Sign in to manage your boarding house.</p>

      <p v-if="error" class="brut-flat mb-4 bg-rust p-3 text-white" role="alert">{{ error }}</p>

      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="label" for="username">Username</label>
          <input id="username" v-model="username" class="field" type="text" autocomplete="username" required />
        </div>
        <div>
          <label class="label" for="password">Password</label>
          <input id="password" v-model="password" class="field" type="password" autocomplete="current-password" required />
        </div>
        <button type="submit" class="btn btn-teal w-full" :disabled="isSubmitting">
          {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-muted">
        Don't have an account? Ask your landlord to create one for you.
      </p>
    </div>
  </div>
</template>