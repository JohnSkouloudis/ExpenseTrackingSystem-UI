<template>
  <div class="p-6 max-w-md mx-auto">
    <h1 class="text-2xl font-bold text-white mb-6">Add New Account</h1>

    <form @submit.prevent="submitForm" class="space-y-4 bg-neutral-800 p-6 rounded-xl">
      <div>
        <label class="block text-gray-300 mb-1">Account Name</label>
        <input
          v-model="account.accountName"
          type="text"
          class="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring focus:ring-green-500"
          required
        />
      </div>

      <div>
        <label class="block text-gray-300 mb-1">Balance (€)</label>
        <input
          v-model="account.balance"
          type="number"
          step="0.01"
          class="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring focus:ring-green-500"
          required
        />
      </div>

      <button
        type="submit"
        class="w-full bg-green-600 hover:bg-green-700 transition text-white font-semibold py-2 rounded"
      >
        Create Account
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { addAccount } from '../services/account'


const router = useRouter()

const account = ref({
  accountName: '',
  balance: 0
})



async function submitForm() {
  try {
    const response = await addAccount(account.value.accountName, account.value.balance)

    if(response.status ===200){
        alert('Account created successfully!')
        router.push('/accounts')
    }
  } catch (error) {
    console.error('Error creating account:', error)
    alert('Failed to create account.')
  }
}
</script>