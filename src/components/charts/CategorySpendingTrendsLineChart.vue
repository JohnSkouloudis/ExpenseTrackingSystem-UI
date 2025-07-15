<template>
  <div class="p-6 max-w-5xl mx-auto w-full">
    <h2 class="text-2xl font-bold text-white mb-6">
      Expenses by Category Over Time 
    </h2>
    <div class="mb-4 flex items-center gap-4">
      <span class="text-gray-300">Year:</span>
      <VueDatePicker
        v-model="selectedYear"
        :format="'yyyy'"
        year-picker
        dark
        class="w-32"
      />
      <select
        v-model="groupBy"
        class="ml-4 px-2 py-1 rounded bg-neutral-700 text-white focus:outline-none focus:ring focus:ring-green-500"
      >
        <option value="month">By Month</option>
        <option value="week">By Week</option>
      </select>
    </div>
    <div class="bg-neutral-800 rounded-xl p-6 w-full min-h-[500px] flex items-center justify-center ">
      <Line
        v-if="chartData"
        :data="chartData"
        :options="chartOptions"
        :height="400"
        :width="1200"
      />
      <p v-else class="text-gray-400">Loading data...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Line } from 'vue-chartjs'
import zoomPlugin from 'chartjs-plugin-zoom'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend, LineElement, PointElement,
  CategoryScale, LinearScale
} from 'chart.js'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { getTransactionsByDateRange, getSubcategories, getAllCategories } from '../../services/transaction'
import { getUserAccounts } from '../../services/account'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, zoomPlugin)

const lineColors = [
  '#ef4444', '#f59e42', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6',
  '#f87171', '#0ea5e9', '#a3e635'
]

const selectedYear = ref(new Date().getFullYear())
const groupBy = ref('month')
const chartData = ref(null)
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getWeekLabels(year) {
  const labels = []
  const date = new Date(year, 0, 1)
  let week = 1
  while (date.getFullYear() === year) {
    labels.push(`Week ${week}`)
    date.setDate(date.getDate() + 7)
    week++
  }
  return labels
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#fff' }, position: 'top' },
    title: { display: false },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: '#222',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#fff',
      borderWidth: 1,
      padding: 10,
      displayColors: true
    },
    zoom: {
      zoom: {
        wheel: { enabled: true },
        pinch: { enabled: true },
        mode: 'xy'
      },
      pan: {
        enabled: true,
        mode: 'xy'
      },
      limits: {
        x: { min: 0 },
        y: { min: -200 }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#fff' },
      grid: { color: '#333' },
      border: { color: '#fff' }
    },
    y: {
      ticks: { color: '#fff' },
      grid: { color: '#333' },
      border: { color: '#fff' },
      beginAtZero: true
    }
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
  const allCategories = categoriesResponse.data
  const incomeSubNames = new Set(incomeSubcategoriesResponse.data.map(sc => sc.categoryName))
  const expenseCategories = allCategories
    .filter(c => !incomeSubNames.has(c.categoryName) && c.categoryName !== 'INCOME')
    .map(c => c.categoryName)

  // Decide number of periods
  const numPeriods = groupBy.value === 'month' ? 12 : getWeekLabels(year).length
  const labels = groupBy.value === 'month' ? months : getWeekLabels(year)

  // Prepare category -> [amounts per period]
  const dataPerCategory = {}
  expenseCategories.forEach(cat => {
    dataPerCategory[cat] = Array(numPeriods).fill(0)
  })

  // Fill data: for each account, fetch transactions and sum per category/month or week
  for (const account of accounts) {
    const txResponse = await getTransactionsByDateRange(account.id, startDate, endDate)
    const txs = txResponse.data
    txs.forEach(tx => {
      if (dataPerCategory[tx.categoryName]) {
        let idx
        if (groupBy.value === 'month') {
          idx = new Date(tx.date).getMonth()
        } else {
          const txDate = new Date(tx.date)
          const firstDay = new Date(year, 0, 1)
          const days = Math.floor((txDate - firstDay) / (1000 * 60 * 60 * 24))
          idx = Math.floor(days / 7)
        }
        if (idx >= 0 && idx < dataPerCategory[tx.categoryName].length) {
          dataPerCategory[tx.categoryName][idx] += tx.amount
        }
      }
    })
  }

  // Build datasets only for categories that have data
  const datasets = []
  let colorIdx = 0
  for (const [cat, values] of Object.entries(dataPerCategory)) {
    if (values.some(val => val > 0)) {
      datasets.push({
        label: cat,
        data: values,
        borderColor: lineColors[colorIdx % lineColors.length],
        backgroundColor: lineColors[colorIdx % lineColors.length],
        fill: false,
        tension: 0.2,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: lineColors[colorIdx % lineColors.length]
      })
      colorIdx++
    }
  }

  chartData.value = {
    labels,
    datasets
  }
}

watch([selectedYear, groupBy], fetchChartData)
onMounted(fetchChartData)
</script>