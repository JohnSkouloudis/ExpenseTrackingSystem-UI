<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-white mb-4">Account Transactions</h1>

  
    <div class="flex flex-wrap gap-4 items-center mb-4">
      <button
        @click="goToAddTransaction"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
      >
        + Add Transaction
      </button>

      <div class="relative">
        <button
          @click="showExportPicker = !showExportPicker"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center"
        >
          Export to CSV
          <svg xmlns="http://www.w3.org/2000/svg" class="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        
        <div
          v-if="showExportPicker"
          class="absolute z-10 mt-2 bg-neutral-800 p-4 rounded shadow-lg w-[400px]"
        >
        
          <VueDatePicker
            v-model="exportDateRange"
            range
            :enable-time-picker="false"
            :format="'yyyy-MM-dd'"
            dark="true"
          />
        
          <button
            @click="handleExportCsv"
            class="mt-2 w-full bg-green-600 text-white rounded hover:bg-green-700 transition py-1"
          >
            Download CSV
          </button>
        </div>
      </div>
    </div>

    
    <div class="mb-4">
      <label class="block  text-gray-300 mb-1">Select Account:</label>
      <select
        v-model="selectedAccountId"
        @change="handleAccountChange"
        class="w-full p-2 rounded bg-neutral-700 text-white focus:outline-none focus:ring focus:ring-green-500"
      >
        <option
          v-for="account in accounts"
          :key="account.id"
          :value="account.id"
        >
          {{ account.accountName }} — €{{ account.balance }}
        </option>
      </select>
    </div>

    
    <div v-if="loading" class="text-gray-300">Loading transactions...</div>
    <div v-else>
      <div v-if="transactions && transactions.length" class="space-y-4">
        <div
          v-for="tx in transactions"
          :key="tx.id"
          class="bg-neutral-800 rounded-lg p-4 text-white"
        >
          <div class="flex justify-between items-center">
            <div>
              <p class="font-semibold truncate max-w-[250px]">{{ tx.description }}</p>
              <p :class="tx.amount >= 0 ? 'text-green-400' : 'text-red-400'">
                €{{ tx.amount.toFixed(2) }}
              </p>
            </div>
            <button
              @click="toggleTransactionDetails(tx.id)"
              class="text-gray-300 hover:text-green-500 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                :class="expandedTransactionId === tx.id ? 'transform rotate-90' : ''"
                class="h-5 w-5 transition-transform duration-200"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <p class="text-gray-400 text-sm">Date: {{ tx.date }}</p>

          <p :class="['flex items-center gap-1 text-sm font-medium', getCategoryColor(tx.categoryName)]">
            <span class="w-2 h-2 rounded-full inline-block" :class="getCategoryColor(tx.categoryName)"></span>
            {{ tx.categoryName }}
          </p>

          <TransactionDetails
            v-if="expandedTransactionId === tx.id"
            :details="transactionDetails"
          />
        </div>
      </div>
      <div v-else class="text-gray-300">No transactions found.</div>

      
      <div class="flex justify-center items-center gap-4 mt-6">
        <button
          :disabled="currentPage === 0"
          @click="prevPage"
          class="px-3 py-1 rounded bg-green-600 disabled:bg-gray-600 hover:bg-green-700 transition"
        >
          &larr; Previous
        </button>
        <span class="text-gray-300">Page {{ currentPage + 1 }}</span>
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
import { getUserAccounts } from '../services/account'
import { getPaginatedTransactions , getAllCategories, getTransactionDetails,exportToCSV } from '../services/transaction'
import { useRouter } from 'vue-router'
import TransactionDetails from '../components/TransactionDetails.vue'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const router = useRouter()
const categoryMap = ref({})

const showExportPicker = ref(false)
const exportDateRange = ref(null)

const accounts = ref([])
const selectedAccountId = ref(null)

const transactions = ref([])
const currentPage = ref(0)
const pageSize = 10
const lastPage = ref(false)
const loading = ref(false)
const expandedTransactionId = ref(null)
const transactionDetails = ref({})


const colorPalette = [
  'text-rose-400',
  'text-yellow-400',
  'text-purple-400',
  'text-blue-400',
  'text-green-400',
  'text-pink-400',
  'text-teal-400',
  'text-orange-400',
  'text-indigo-400',
  'text-amber-400'
]

 function handleExportCsv() {
  if (!exportDateRange.value || !exportDateRange.value[0] || !exportDateRange.value[1]) {
    alert('Please select a valid date range.')
    return
  }

  const startDate = exportDateRange.value[0].toISOString().split('T')[0]
  const endDate = exportDateRange.value[1].toISOString().split('T')[0]

  exportToCSV(startDate, endDate)
  
}

function assignCategoryColors(categories) {
  const map = {}
  categories.forEach((cat, index) => {
    map[cat.categoryName] = colorPalette[index % colorPalette.length]
  })
  categoryMap.value = map
}

function getCategoryColor(name) {
  return categoryMap.value[name] || 'text-gray-400'
}



async function fetchAccounts() {
  try {
    const response = await getUserAccounts()
    accounts.value = response.data

    if (accounts.value.length) {
      selectedAccountId.value = accounts.value[0].id
    }
  } catch (error) {
    console.error('Error fetching accounts:', error)
  }
}

async function fetchTransactions() {
  if (!selectedAccountId.value) return

  loading.value = true
  try {
    const response = await getPaginatedTransactions(selectedAccountId.value, currentPage.value, pageSize)

    transactions.value = response.data.content
    lastPage.value = response.data.last
  } catch (error) {
    console.error('Error fetching transactions:', error)
    transactions.value = []
    lastPage.value = true
  } finally {
    loading.value = false
  }
}

function goToAddTransaction() {
  
  router.push('/addTransaction')
}

function handleAccountChange() {
  currentPage.value = 0
  fetchTransactions()
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

async function toggleTransactionDetails(id) {
  if (expandedTransactionId.value === id) {
    expandedTransactionId.value = null
    return
  }

  try {
    const res = await getTransactionDetails(id)
    transactionDetails.value = res.data
    expandedTransactionId.value = id
  } catch (err) {
    console.error('Error loading details:', err)
    alert('Failed to load transaction details.')
  }
}

watch(currentPage, () => {
  fetchTransactions()
})

watch(selectedAccountId, () => {
  currentPage.value = 0
  fetchTransactions()
})

onMounted(async () => {
  await fetchAccounts()
  fetchTransactions()

  try {
    const response = await getAllCategories()
    assignCategoryColors(response.data)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }

})
</script>

