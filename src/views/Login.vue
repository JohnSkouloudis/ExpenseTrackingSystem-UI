<template>
  <div class="min-h-screen flex items-center justify-center bg-[#121212] px-4">
    <div
      class="w-full max-w-xl min-h-[600px] bg-[#1c1f24] border-2 border-green-500 rounded-xl shadow-xl p-10 flex flex-col justify-center"
    >
      <div class="flex flex-col items-center">
        <div class="bg-green-600 text-white p-3 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2 .9 2 2-.9 2-2 2m0-10v1m0 14v1m8-9h1m-18 0H3m15.36-5.36l.71.71M6.34 17.66l.71.71M17.66 17.66l-.71.71M6.34 6.34l-.71.71" />
          </svg>
        </div>

        <h2 class="text-white text-2xl font-bold mb-1">Welcome Back</h2>
        <p class="text-gray-400 text-sm mb-6">Sign in to your ExpenseTracker account</p>
      </div>

      <p v-if="errorMessage" class="text-red-500 text-sm mb-4 text-center">{{ errorMessage }}</p>

      <form @submit.prevent="handleLogin" class="space-y-6">
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
          <label class="text-white text-sm block mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="w-full px-4 py-2 bg-[#2a2e35] text-white rounded-md border border-[#3a3f46] focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>

        <button
          type="submit"
          class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-md transition"
        >
          Sign In
        </button>
      </form>

      <p class="text-gray-400 text-sm text-center mt-6">
        Don’t have an account?
        <RouterLink to="/register" class="text-green-400 hover:underline">Sign up</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../services/auth'

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()

const handleLogin = async () => {
  errorMessage.value = ''
  const status = await login(username.value, password.value)

  if (status === 200) {
    router.push('/')
  } else if (status === 401) {
    errorMessage.value = 'Invalid username or password.'
  } else {
    errorMessage.value = 'Login failed. Please try again.'
  }
}
</script>