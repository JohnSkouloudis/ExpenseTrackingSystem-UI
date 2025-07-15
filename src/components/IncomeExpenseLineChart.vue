<template>
  <div class="p-6 max-w-5xl mx-auto w-full">
    <h2 class="text-2xl font-bold text-white mb-6">Income vs. Expenses </h2>
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
        v-if="groupBy !== undefined"
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
      />
      <p v-else class="text-gray-400">Loading data...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { Line } from 'vue-chartjs'
import zoomPlugin from 'chartjs-plugin-zoom'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { getTransactionsByDateRange,getSubcategories } from '../services/transaction'
import { getUserAccounts } from '../services/account'

ChartJS.register(Title, Tooltip, Legend,zoomPlugin, LineElement, PointElement, CategoryScale, LinearScale)

const selectedYear = ref(new Date().getFullYear())
const groupBy = ref('month') // 'month' or 'week'
const chartData = ref(null)

const monthLabels = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]


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
    zoom: {
    zoom: {
      wheel: { enabled: true },
      pinch: { enabled: true },
      mode: 'xy',
    },
    pan: {
      enabled: true,
      mode: 'xy',
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

const periodLabel = computed(() => groupBy.value === 'week' ? 'by week' : 'by month')

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


  let labels, income, expense
  if (groupBy.value === 'month') {
    labels = monthLabels
    income = Array(12).fill(0)
    expense = Array(12).fill(0)
  } else {
    labels = getWeekLabels(year)
    income = Array(labels.length).fill(0)
    expense = Array(labels.length).fill(0)
  }

  
  for (const account of accounts) {
    const txResponse = await getTransactionsByDateRange(account.id, startDate, endDate)
    const txs = txResponse.data
    txs.forEach(tx => {
      const txDate = new Date(tx.date)
      let idx
      if (groupBy.value === 'month') {
        idx = txDate.getMonth()
      } else {
        
        const firstDay = new Date(year, 0, 1)
        const days = Math.floor((txDate - firstDay) / (1000 * 60 * 60 * 24))
        idx = Math.floor(days / 7)
      }
      if (expenseCategoryNames.includes(tx.categoryName)) {
        expense[idx] += tx.amount
      } else  {
        income[idx] += tx.amount
      }
    })
  }

  chartData.value = {
  labels,
  datasets: [
    {
      label: 'Income',
      data: income,
      fill: false,
      borderColor: '#22c55e',         
      backgroundColor: '#22c55e',
      tension: 0.2,                   
      borderWidth: 2,                 
      pointRadius: 2,                 
      pointHoverRadius: 7,            
      pointBackgroundColor: '#22c55e',
    },
    {
      label: 'Expenses',
      data: expense,
      fill: false,
      borderColor: '#ef4444',         
      backgroundColor: '#ef4444',
      tension: 0.2,
      borderWidth: 2,
      pointRadius: 2,
      pointHoverRadius: 7,
      pointBackgroundColor: '#ef4444',
    }
  ]
}
}

watch([selectedYear, groupBy], fetchChartData)
onMounted(fetchChartData)
</script>


<style scoped>
/*
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #4ade80;      
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #222;         
  border-radius: 4px;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #4ade80 #222;
}
*/
</style>
