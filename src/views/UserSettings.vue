<template>
  <div>
    <h2 class="text-xl font-bold text-white mb-6">Update User Info</h2>
    <!-- Username -->
    <form @submit.prevent="updateUsername" class="max-w-sm space-y-4">
      <div>
        <label class="block text-gray-300 mb-1">New Username</label>
        <input v-model="username" class="w-full p-2 rounded bg-neutral-800 text-white" type="text" required />
      </div>
      <button type="submit" class="bg-green-600 px-4 py-2 text-white rounded hover:bg-green-700">Change Username</button>
    </form>
    <!-- Password -->
    <form @submit.prevent="updatePassword" class="max-w-sm mt-8 space-y-4">
      <div>
        <label class="block text-gray-300 mb-1">New Password</label>
        <input v-model="password" class="w-full p-2 rounded bg-neutral-800 text-white" type="password" required />
      </div>
      <button type="submit" class="bg-green-600 px-4 py-2 text-white rounded hover:bg-green-700">Change Password</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const username = ref('')
const password = ref('')
function updateUsername() { alert('Username updated!') }
function updatePassword() { alert('Password updated!') }
</script>