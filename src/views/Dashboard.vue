<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-white mb-6">Dashboard</h1>
    <DashboardStats
      :totalExpenses="totalExpenses"
      :thisMonthExpenses="thisMonthExpenses"
      :lastMonthExpenses="lastMonthExpenses"
      :monthlyBudget="monthlyBudget"
      :remainingBudget="remainingBudget"
      :startDate="startDate"
      :endDate="endDate"
    />

    <!-- Recent Transactions Component -->
    <RecentTransactions class="w-full lg:w-[1000px] mx-auto" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DashboardStats from '../components/DashboardStats.vue'
import RecentTransactions from '../components/RecentTransactions.vue'
import { getUserBudget } from '../services/budget'
import { getTransactionsByDateRange } from '../services/transaction'
import { getUserAccounts } from '../services/account'


const totalExpenses = ref(2400.50)
const thisMonthExpenses = ref(0)
const lastMonthExpenses = ref(0)
const monthlyBudget = ref(0)
const remainingBudget = ref(0)
const startDate = ref(null)
const endDate = ref(null)
const accounts = ref([])
const now = new Date();



function fetchBudget() {

  getUserBudget().then(response => {
    monthlyBudget.value = response.data.budgetAmount
    remainingBudget.value = response.data.remainingAmount
    startDate.value = response.data.startDate
    endDate.value = response.data.endDate
  }).catch(error => {
    console.error('Error fetching budget:', error)
  })
}

async function fetchAccounts() {
  try {
    const accRes = await getUserAccounts()
    accounts.value = accRes.data

  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

function fetchThisMonthExpenses() {
  
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const startDate = firstDay.toISOString().split('T')[0];
  const endDate = lastDay.toISOString().split('T')[0];

  for(const account of accounts.value) {
    getTransactionsByDateRange(account.id, startDate, endDate).then(response => {
      thisMonthExpenses.value += response.data.reduce((sum, tx) => sum + tx.amount, 0)
    }).catch(error => {
      console.error('Error fetching transactions:', error)
    })
  }
  
  
}

function fetchLastMonthExpenses() {
  const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);

  const startDate = firstDay.toISOString().split('T')[0];
  const endDate = lastDay.toISOString().split('T')[0];

  for(const account of accounts.value) {
    getTransactionsByDateRange(account.id, startDate, endDate).then(response => {
      lastMonthExpenses.value += response.data.reduce((sum, tx) => sum + tx.amount, 0)
    }).catch(error => {
      console.error('Error fetching transactions:', error)
    })
  }
  
}

onMounted(async() => {
  await fetchAccounts()
  fetchBudget()
  fetchThisMonthExpenses()
  fetchLastMonthExpenses()
  
})
</script>