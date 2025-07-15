<template>
  <div class="p-6 max-w-5xl mx-auto w-full">
    <h2 class="text-2xl font-bold text-white mb-6">Income vs. Expenses by Month</h2>
    <div class="mb-4 flex items-center gap-4">
      <span class="text-gray-300">Year:</span>
      <VueDatePicker
        v-model="selectedYear"
        :format="'yyyy'"
        year-picker
        dark
        class="w-32"
      />
    </div>
    <div class="bg-neutral-800 rounded-xl p-6 w-full min-h-[500px] flex items-center justify-center">
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
import { ref, computed, watch, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { getTransactionsByDateRange,getSubcategories } from '../services/transaction'
import{ getUserAccounts} from '../services/account'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)


const selectedYear = ref(new Date().getFullYear())
const chartData = ref(null)
const chartOptions = {
  responsive: true,
  plugins: {
    legend: { labels: { color: '#fff' }, position: 'top' },
    title: { display: false }
  },
  scales: {
    x: { ticks: { color: '#fff' }, grid: { color: '#333' } },
    y: { ticks: { color: '#fff' }, grid: { color: '#333' }, beginAtZero: true }
  }
}

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]


async function fetchChartData() {
  chartData.value = null
  const year = selectedYear.value
  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  
  const accountsResponse = await getUserAccounts()
  const accounts = accountsResponse.data

  const expenseSubcategoriesResponse = await getSubcategories('EXPENSE')
  const expenseSubcategories = expenseSubcategoriesResponse.data
  const expenseCategoryNames = expenseSubcategories.map(sc => sc.categoryName)
   

  
  const income = Array(12).fill(0)
  const expense = Array(12).fill(0)

  
  for (const account of accounts) {
    const txResponse = await getTransactionsByDateRange(account.id, startDate, endDate)
    const txs = txResponse.data
    txs.forEach(tx => {
      const month = new Date(tx.date).getMonth() // 0-11
      if (expenseCategoryNames.includes(tx.categoryName)) {
        expense[month] += tx.amount
      } else {
        income[month] += tx.amount
      }
    })
  }

  chartData.value = {
    labels: months,
    datasets: [
      {
        label: 'Income',
        data: income,
        backgroundColor: '#22c55e'
      },
      {
        label: 'Expenses',
        data: expense,
        backgroundColor: '#ef4444'
      }
    ]
  }
}

watch(selectedYear, fetchChartData)
onMounted(fetchChartData)
</script>