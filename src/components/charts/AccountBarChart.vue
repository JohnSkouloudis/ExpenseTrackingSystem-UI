<template>
  <div class="bg-neutral-800 rounded-2xl p-6 w-full max-w-5xl mx-auto">
    <h2 class="text-xl text-white font-bold mb-4">Accounts Summary ({{ selectedYear }})</h2>
    <div class="flex items-center mb-4 gap-3">
      <span class="text-gray-300">Year:</span>
      <VueDatePicker
        v-model="selectedYear"
        :format="'yyyy'"
        year-picker
        dark
        class="w-32"
      />
    </div>
    <div class="min-h-[420px] w-full flex items-center justify-center">
      <Bar
        v-if="chartData"
        :data="chartData"
        :options="chartOptions"
        :height="400"
        :width="900"
      />
      <p v-else class="text-gray-400">Loading data...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale
} from 'chart.js'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

import { getUserAccounts } from '../../services/account'
import { getTransactionsByDateRange, getSubcategories,getAllCategories } from '../../services/transaction'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const selectedYear = ref(new Date().getFullYear())
const chartData = ref(null)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#fff' }, position: 'top' },
    title: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
      callbacks: {
        label: ctx => {
          if (ctx.dataset.label === "Transaction Count") return `Transactions: ${ctx.parsed.y}`
          if (ctx.dataset.label === "Total Expenses") return `Expenses: €${ctx.parsed.y.toFixed(2)}`
          if (ctx.dataset.label === "Total Income") return `Income: €${ctx.parsed.y.toFixed(2)}`
          return ctx.parsed.y
        }
      }
    }
  },
  scales: {
    x: { ticks: { color: '#fff' }, grid: { color: '#333' }, border: { color: '#fff' }, stacked: false },
    y: { ticks: { color: '#fff' }, grid: { color: '#333' }, border: { color: '#fff' }, beginAtZero: true }
  }
}

async function fetchChartData() {
  chartData.value = null
  const year = selectedYear.value
  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  
  const [accountsRes, incomeSubsRes] = await Promise.all([
    getUserAccounts(),
    getSubcategories('INCOME')
  ])
  const accounts = accountsRes.data
  const incomeCatsSet = new Set(incomeSubsRes.data.map(sc => sc.categoryName))
  incomeCatsSet.add('INCOME')
  
  const labels = accounts.map(acc => acc.accountName)
  const transactionCounts = []
  const totalExpenses = []
  const totalIncomes = []

  for (const acc of accounts) {
    const txRes = await getTransactionsByDateRange(acc.id, startDate, endDate)
    const txs = txRes.data

    transactionCounts.push(txs.length)
    let expenseSum = 0
    let incomeSum = 0

    for (const tx of txs) {
      if (incomeCatsSet.has(tx.categoryName)) {
        incomeSum += tx.amount
      } else {
        expenseSum += tx.amount
      }
    }
    totalExpenses.push(expenseSum)
    totalIncomes.push(incomeSum)
  }

  chartData.value = {
    labels,
    datasets: [
      {
        label: "Transaction Count",
        data: transactionCounts,
        backgroundColor: "#f59e42"
      },
      {
        label: "Total Expenses",
        data: totalExpenses,
        backgroundColor: "#ef4444"
      },
      {
        label: "Total Income",
        data: totalIncomes,
        backgroundColor: "#22c55e"
      }
    ]
  }
}

watch(selectedYear, fetchChartData)
onMounted(fetchChartData)
</script>