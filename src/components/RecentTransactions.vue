<template>
  <div class="bg-neutral-800 rounded-2xl p-4 w-full shadow">
    <h2 class="text-xl text-gray-400 font-semibold mb-4">Recent Transactions</h2>
    
    <div v-if="recentTransactions.length" class="space-y-3">
  <div
    v-for="tx in recentTransactions.slice(0, 5)"
    :key="tx.id"
    class="bg-neutral-700 rounded p-3 flex justify-between items-center"
  >
        <div>
          <p class="font-medium text-white truncate max-w-[200px]">{{ tx.description }}</p>
          <p class="text-gray-400 text-sm">{{ tx.date }}</p>
        </div>
        <p :class="tx.amount >= 0 ? 'text-green-400' : 'text-red-400'">
          €{{ tx.amount.toFixed(2) }}
        </p>
      </div>
    </div>
    <div v-else class="text-gray-400">No recent transactions found.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getRecentTransactions } from '../services/transaction'
import { getUserAccounts } from '../services/account'

const recentTransactions = ref([])
const accounts = ref([])

onMounted(async () => {
     const response = await getUserAccounts()
     accounts.value = response.data

    for(const account of accounts.value) {
        const transactions = await getRecentTransactions(account.id, 0, 5)
        recentTransactions.value.push(...transactions.data.content)
    }
    recentTransactions.value.sort((a, b) => new Date(b.date) - new Date(a.date))
  
})
</script>