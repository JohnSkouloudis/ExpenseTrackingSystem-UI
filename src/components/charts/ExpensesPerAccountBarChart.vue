<template>
  <div class="bg-neutral-800 rounded-2xl p-6 w-full max-w-3xl mx-auto">
    <h2 class="text-xl text-white font-bold mb-4">Expenses for each Account </h2>
    <div class="flex flex-wrap items-center gap-4 mb-4">
      <div>
        <label class="text-gray-400 mr-1">Account:</label>
        <select
          v-model="selectedAccountId"
          class="rounded bg-neutral-700 text-white px-2 py-1"
          @change="fetchChartData"
        >
          <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
            {{ acc.accountName }}
          </option>
        </select>
      </div>
      <div>
        <label class="text-gray-400 mr-1">Year:</label>
        <VueDatePicker
          v-model="selectedYear"
          :format="'yyyy'"
          year-picker
          dark
          class="w-32"
        />
      </div>
    </div>
    <div class="min-h-[340px] w-full flex items-center justify-center">
      <Bar
        v-if="chartData"
        :data="chartData"
        :options="chartOptions"
        :height="320"
        :width="700"
      />
      <p v-else class="text-gray-400">Loading...</p>
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
import { getTransactionsByDateRange, getAllCategories, getSubcategories } from '../../services/transaction'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const selectedYear = ref(new Date().getFullYear())
const selectedAccountId = ref(null)
const accounts = ref([])
const chartData = ref(null)
const expenseCategories = ref([])

const colorPalette = [
  '#ef4444', '#f59e42', '#facc15', '#22c55e', '#3b82f6',
  '#a855f7', '#ec4899', '#14b8a6', '#f87171', '#0ea5e9', '#a3e635'
]
  

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => `€${ctx.parsed.y.toFixed(2)}`
      }
    }
  },
  scales: {
    x: { ticks: { color: '#fff' }, grid: { color: '#333' }, border: { color: '#fff' } },
    y: { ticks: { color: '#fff' }, grid: { color: '#333' }, border: { color: '#fff' }, beginAtZero: true }
  }
}


onMounted(async () => {
  const accRes = await getUserAccounts()
  accounts.value = accRes.data
  if (accounts.value.length) {
    selectedAccountId.value = accounts.value[0].id
    await fetchExpenseCategories()
    await fetchChartData()
  }
})

watch([selectedYear, selectedAccountId], fetchChartData)


async function fetchExpenseCategories() {
  const [allCats, expenseSubs] = await Promise.all([
    getAllCategories(),
    getSubcategories('EXPENSE')
  ])
  const expenseSubNames = new Set(expenseSubs.data.map(sc => sc.categoryName))
  expenseCategories.value = allCats.data
    .filter(cat => expenseSubNames.has(cat.categoryName) && cat.categoryName !== 'INCOME')
    .map(cat => cat.categoryName)
}


async function fetchChartData() {

  
  chartData.value = null
  if (!selectedAccountId.value || !selectedYear.value) return
  
  const year = selectedYear.value
  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`
  
  await fetchExpenseCategories()

  const txRes = await getTransactionsByDateRange(selectedAccountId.value, startDate, endDate)
  const txs = txRes.data


  
  const sums = {}
  expenseCategories.value.forEach(cat => { sums[cat] = 0 })
  txs.forEach(tx => {
    if (sums.hasOwnProperty(tx.categoryName)) {
      sums[tx.categoryName] += tx.amount
    }
  })

  
  const labels = []
  const data = []
  const backgroundColors = []

  
  expenseCategories.value.forEach((cat, idx) => {
    if (sums[cat] > 0) {
      labels.push(cat)
      data.push(sums[cat])
      backgroundColors.push(colorPalette[idx % colorPalette.length])
    }
  })

  chartData.value = {
    labels,
    datasets: [
      {
        label: 'Expenses',
        data,
        backgroundColor: backgroundColors
      }
    ]
  }
}
</script>
