<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { authService } from '../services/api'
import { apiError } from '../utils/errors'

const router = useRouter()
const form = ref({
  username: '', first_name: '', middle_name: '', last_name: '', contact_number: '',
  role: 'tenant', passcode: '', password: '', confirm_password: '',
})
const error = ref('')
const isSubmitting = ref(false)

async function handleRegister() {
  error.value = ''
  if (form.value.password !== form.value.confirm_password) {
    error.value = 'Passwords do not match.'
    return
  }
  if (form.value.password.length < 8) {
    error.value = 'Password must be at least 8 characters.'
    return
  }
  try {
    isSubmitting.value = true
    const payload: Record<string, string> = {
      username: form.value.username,
      first_name: form.value.first_name,
      middle_name: form.value.middle_name,
      last_name: form.value.last_name,
      contact_number: form.value.contact_number,
      password: form.value.password,
      role: form.value.role,
    }
    if (form.value.role === 'landlord') payload.passcode = form.value.passcode
    await authService.register(payload)
    router.push({ name: 'login', query: { registered: '1' } })
  } catch (err: any) {
    // Catch Django's specific duplication error for the username field
    const data = err.response?.data
    if (data?.username) {
      error.value = `Username: ${data.username[0]}` // "A user with that username already exists shit is gonna pop up"
    } else if (data?.passcode) {
      error.value = data.passcode[0]
    } else {
      error.value = apiError(err, 'Could not create the account. Please try again.')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="grid min-h-screen place-items-center p-4">
    <div class="brut-card w-full max-w-md p-6 sm:p-8">
      <h1 class="brut-title text-5xl">Create account</h1>
      <p class="mb-6 mt-1 text-muted">Tenants and landlords both start here.</p>

      <p v-if="error" class="brut-flat mb-4 bg-rust p-3 text-white" role="alert">{{ error }}</p>

      <form class="space-y-4" @submit.prevent="handleRegister">
        <div>
          <label class="label" for="role">Account type</label>
          <select id="role" v-model="form.role" class="field">
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
          </select>
        </div>
        <div v-if="form.role === 'landlord'">
          <label class="label" for="passcode">Landlord passcode</label>
          <input id="passcode" v-model="form.passcode" class="field" type="password" inputmode="numeric" required />
        </div>
        <div>
          <label class="label" for="username">Username</label>
          <input id="username" v-model="form.username" class="field" type="text" autocomplete="username" required />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="label" for="first">First name</label>
            <input id="first" v-model="form.first_name" class="field" type="text" required />
          </div>
          <div>
            <label class="label" for="last">Last name</label>
            <input id="last" v-model="form.last_name" class="field" type="text" required />
          </div>
        </div>
        <div>
          <label class="label" for="middle">Middle name (optional)</label>
          <input id="middle" v-model="form.middle_name" class="field" type="text" />
        </div>
        <div>
          <label class="label" for="contact">Contact number</label>
          <input id="contact" v-model="form.contact_number" class="field" type="tel" placeholder="09XXXXXXXXX" maxlength="15" required />
        </div>
        <div>
          <label class="label" for="password">Password</label>
          <input id="password" v-model="form.password" class="field" type="password" autocomplete="new-password" required />
          <p class="hint">At least 8 characters.</p>
        </div>
        <div>
          <label class="label" for="confirm">Confirm password</label>
          <input id="confirm" v-model="form.confirm_password" class="field" type="password" autocomplete="new-password" required />
        </div>
        <button type="submit" class="btn btn-teal w-full" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm">
        Already have an account?
        <RouterLink to="/login" class="font-semibold text-teal-dark underline">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>