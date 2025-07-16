<template>
  <div class="p-4 max-w-3xl w-full mx-auto">
    <h2 class="text-2xl font-bold text-white mb-6">Expenses by Category </h2>
    <div class="flex items-center gap-3 mb-4">
      <span class="text-gray-300">Year:</span>
      <VueDatePicker
        v-model="selectedYear"
        :format="'yyyy'"
        year-picker
        dark
        class="w-32"
      />
    </div>
    <div class="bg-neutral-800 rounded-xl p-4 w-full min-h-[400px]">
      <Bar
        v-if="chartData"
        :data="chartData"
        :options="chartOptions"
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
  Title, Tooltip, Legend, BarElement,
  CategoryScale, LinearScale
} from 'chart.js'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { getTransactionsByDateRange, getAllCategories, getSubcategories } from '../../services/transaction'
import { getUserAccounts } from '../../services/account'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const barColors = [
  '#ef4444', 
  '#f59e42', 
  '#facc15', 
  '#22c55e', 
  '#3b82f6', 
  '#a855f7', 
  '#ec4899', 
  '#14b8a6', 
  '#f87171', 
  '#0ea5e9',
  '#a3e635', 
  '#f97316',
]
const selectedYear = ref(new Date().getFullYear())
const chartData = ref(null)
const chartOptions = {
  indexAxis: 'y',   
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    x: { ticks: { color: '#fff' }, grid: { color: '#333' }, beginAtZero: true },
    y: { ticks: { color: '#fff' }, grid: { color: '#333' } }
  }
}

async function fetchChartData() {
  chartData.value = null
  const year = selectedYear.value
  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  
  const [accountsResponse, categoriesResponse, incomeSubcategoriesResponse] = await Promise.all([
  getUserAccounts(),
  getAllCategories(),
  getSubcategories('INCOME')
])
const accounts = accountsResponse.data
const categories = categoriesResponse.data


const incomeSubcategoryNames = new Set(incomeSubcategoriesResponse.data.map(sc => sc.categoryName))


const filteredCategories = categories.filter(
  c => !incomeSubcategoryNames.has(c.categoryName) && c.categoryName !== 'INCOME'
)

  
  const expenseTotals = {}
  filteredCategories.forEach(cat => { expenseTotals[cat.categoryName] = 0 })

  
  for (const account of accounts) {
    const txResponse = await getTransactionsByDateRange(account.id, startDate, endDate)
    const txs = txResponse.data
    txs.forEach(tx => {
      if (expenseTotals.hasOwnProperty(tx.categoryName)) {
        expenseTotals[tx.categoryName] += tx.amount
      }
    })
  }

  
  const categoryLabels = Object.keys(expenseTotals)
  const categoryAmounts = Object.values(expenseTotals)

  chartData.value = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Expenses',
        data: categoryAmounts,
        backgroundColor: barColors.slice(0, categoryLabels.length)
      }
    ]
  }
}

watch(selectedYear, fetchChartData)
onMounted(fetchChartData)
</script>