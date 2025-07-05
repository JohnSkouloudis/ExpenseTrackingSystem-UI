<template>
  <div class="min-h-screen flex items-center justify-center bg-[#121212] px-4">
    <div class="w-full max-w-xl min-h-[600px] bg-[#1c1f24] border-2 border-green-500 rounded-xl shadow-xl p-10 flex flex-col justify-center">
      <div class="flex flex-col items-center">
        <div class="bg-green-600 text-white p-3 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2 .9 2 2-.9 2-2 2m0-10v1m0 14v1m8-9h1m-18 0H3m15.36-5.36l.71.71M6.34 17.66l.71.71M17.66 17.66l-.71.71M6.34 6.34l-.71.71" />
          </svg>
        </div>

        <h2 class="text-white text-2xl font-bold mb-1">Create Account</h2>
        <p class="text-gray-400 text-sm mb-6">Join ExpenseTracker to manage your finances</p>
      </div>

      <p v-if="errorMessage" class="text-red-500 text-sm mb-4 text-center">{{ errorMessage }}</p>
      <p v-if="successMessage" class="text-green-500 text-sm mb-4 text-center">{{ successMessage }}</p>

      <form @submit.prevent="handleRegister" class="space-y-6">
        <div>
          <label class="text-white text-sm block mb-1">Username</label>
          <input
            v-model="username"
            type="text"
            placeholder="Your username"
            class="w-full px-4 py-2 bg-[#2a2e35] text-white rounded-md border border-[#3a3f46] focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>

        <div>
          <label class="text-white text-sm block mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="your@email.com"
            class="w-full px-4 py-2 bg-[#2a2e35] text-white rounded-md border border-[#3a3f46] focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>

        <div>
          <label class="text-white text-sm block mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Create a strong password"
            class="w-full px-4 py-2 bg-[#2a2e35] text-white rounded-md border border-[#3a3f46] focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-md transition"
        >
          Create Account
        </button>
      </form>

      <p class="text-gray-400 text-sm text-center mt-6">
        Already have an account?
        <RouterLink to="/login" class="text-green-400 hover:underline">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../services/auth'

const username = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const router = useRouter()

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  const result = await register(username.value, password.value, email.value)

  if (result.status === 201) {
    successMessage.value = result.data
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } else if (result.status === 400) {
    errorMessage.value = result.data || 'Registration failed. Please check your input.'
  } else {
    errorMessage.value = 'An unexpected error occurred.'
  }
}
</script>