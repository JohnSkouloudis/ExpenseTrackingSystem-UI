<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-white mb-4">Your Bank Accounts</h1>

    <!-- Create Account button -->
    <button
      @click="goToAddAccount"
      class="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
    >
      + Create Account
    </button>

    <div v-if="loading" class="text-gray-300">Loading accounts...</div>
    <div v-else>
      <div v-if="accounts && accounts.length" class="space-y-4">
        <div
          v-for="account in accounts"
          :key="account.id"
          class="bg-neutral-800 rounded-lg p-4 text-white flex justify-between items-center"
        >
          <div>
            <p class="font-semibold">{{ account.accountName }}</p>
            <p class="text-gray-400 text-sm">Balance: €{{ account.balance }}</p>
          </div>
          <button
            @click="handleDelete(account.id)"
            class="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
      <div v-else class="text-gray-300">No accounts found.</div>

      <!-- Pagination Controls -->
      <div class="flex justify-center items-center gap-4 mt-6">
        <button
          :disabled="currentPage === 0"
          @click="prevPage"
          class="px-3 py-1 rounded bg-green-600 disabled:bg-gray-600 hover:bg-green-700 transition"
        >
          &larr; Previous
        </button>
        <span class="text-gray-300">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
        <button
          :disabled="lastPage"
          @click="nextPage"
          class="px-3 py-1 rounded bg-green-600 disabled:bg-gray-600 hover:bg-green-700 transition"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getPaginatedAccounts } from '../services/account'
import { useRouter } from 'vue-router'

const router = useRouter()
const pageSize = 10
const accounts = ref([])
const currentPage = ref(0)
const loading = ref(false)
const lastPage = ref(false)
const totalPages = ref(1)

async function fetchAccounts() {
  loading.value = true
  try {
    const response = await getPaginatedAccounts(currentPage.value, pageSize)
    accounts.value = response.data.content
    lastPage.value = response.data.last
    totalPages.value = response.data.totalPages
  } catch (error) {
    console.error('Error fetching accounts:', error)
    accounts.value = []
    lastPage.value = true
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

function nextPage() {
  if (!lastPage.value) {
    currentPage.value++
  }
}

function prevPage() {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}


watch(currentPage, () => {
  fetchAccounts()
})


onMounted(() => {
  fetchAccounts()
})

function goToAddAccount() {
  
  router.push('/addAccount')
}
</script>