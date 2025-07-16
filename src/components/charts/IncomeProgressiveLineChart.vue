<template>
  <div class="p-6 max-w-4xl w-full mx-auto">
    <h2 class="text-2xl font-bold text-white mb-6">
      Progress of Income Categories ({{ selectedYear }})
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
        <option value="day">By Day</option>
        <option value="week">By Week</option>
        <option value="month">By Month</option>
      </select>
    </div>
    <div class="bg-neutral-800 rounded-xl p-6 w-full min-h-[400px] flex items-center justify-center">
      <Line
        v-if="chartData"
        :data="chartData"
        :options="chartOptions"
        :height="400"
        :width="900"
      />
      <p v-else class="text-gray-400">Loading...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

import { getUserAccounts } from '../../services/account'
import { getTransactionsByDateRange, getSubcategories, getAllCategories } from '../../services/transaction'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, zoomPlugin)

const selectedYear = ref(new Date().getFullYear())
const groupBy = ref('day') // 'day', 'week', 'month'
const chartData = ref(null)
const colorPalette = [
  '#22c55e', '#4ade80', '#86efac', '#a7f3d0', '#34d399',
  '#10b981', '#16a34a', '#15803d', '#166534', '#0ea5e9',
  '#3b82f6', '#a855f7', '#f59e42', '#facc15', '#ef4444'
]


function formatDate(d) {
  return d.toISOString().split('T')[0]
}
function getAllDatesInYear(year) {
  const dates = []
  let d = new Date(`${year}-01-01`)
  while (d.getFullYear() === year) {
    dates.push(formatDate(new Date(d)))
    d.setDate(d.getDate() + 1)
  }
  return dates
}
function getAllWeeksInYear(year) {
  
  const weeks = []
  let d = new Date(`${year}-01-01`)
  let weekSet = new Set()
  while (d.getFullYear() === year) {
    const week = getISOWeek(d)
    weeks.push(`${year}-W${week.toString().padStart(2, '0')}`)
    d.setDate(d.getDate() + 1)
  }
  
  return Array.from(new Set(weeks))
}
function getAllMonthsInYear(year) {
  return Array.from({ length: 12 }, (_, i) =>
    `${year}-${String(i + 1).padStart(2, '0')}`
  )
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
}
function getPeriodKey(dateStr, mode) {
  const d = new Date(dateStr)
  if (mode === 'day') return formatDate(d)
  if (mode === 'month')
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  if (mode === 'week')
    return `${d.getFullYear()}-W${getISOWeek(d).toString().padStart(2, '0')}`
  return formatDate(d)
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
      callbacks: {
        label: ctx =>
          `${ctx.dataset.label}: €${ctx.parsed.y !== null ? ctx.parsed.y.toFixed(2) : 'No data'}`
      }
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
        y: { min: -50 }
      }
    }
  },
  elements: {
    line: { borderWidth: 2, tension: 0.4 },
    point: { radius: 2, hoverRadius: 7 }
  },
  scales: {
    x: { ticks: { color: '#fff' }, grid: { color: '#333' }, border: { color: '#fff' } },
    y: { ticks: { color: '#fff' }, grid: { color: '#333' }, border: { color: '#fff' }, beginAtZero: true }
  }
}

async function fetchChartData() {
  chartData.value = null
  const year = selectedYear.value
  let periods = []
  if (groupBy.value === 'day') periods = getAllDatesInYear(year)
  else if (groupBy.value === 'week') periods = getAllWeeksInYear(year)
  else periods = getAllMonthsInYear(year)

  
  const [accountsRes, categoriesRes, incomeSubsRes] = await Promise.all([
    getUserAccounts(),
    getAllCategories(),
    getSubcategories('INCOME')
  ])
  const accounts = accountsRes.data
  const incomeSubcategoryNames = new Set(incomeSubsRes.data.map(sc => sc.categoryName))

  
  const filteredCategories = categoriesRes.data.filter(
    c => incomeSubcategoryNames.has(c.categoryName) || c.categoryName === 'INCOME'
  ).map(c => c.categoryName)
  const catColors = {}
  filteredCategories.forEach((cat, idx) => {
    catColors[cat] = colorPalette[idx % colorPalette.length]
  })

  
  let allTx = []
  for (const acc of accounts) {
    const txRes = await getTransactionsByDateRange(
      acc.id, `${year}-01-01`, `${year}-12-31`
    )
    
    allTx.push(...txRes.data.filter(tx => filteredCategories.includes(tx.categoryName)))
  }
  allTx = allTx.sort((a, b) => new Date(a.date) - new Date(b.date))

  
  const perCategoryCumulative = {}
  filteredCategories.forEach(cat => {
    let sum = 0
    
    let txsByPeriod = {}
    allTx.forEach(tx => {
      if (tx.categoryName === cat) {
        const key = getPeriodKey(tx.date, groupBy.value)
        if (!txsByPeriod[key]) txsByPeriod[key] = []
        txsByPeriod[key].push(tx)
      }
    })
    
    const catTxPeriods = Object.keys(txsByPeriod)
    const lastPeriod = catTxPeriods.length
      ? catTxPeriods.reduce((a, b) => (a > b ? a : b))
      : null
    
    const dataArr = []
    for (const period of periods) {
      if (lastPeriod && period > lastPeriod) {
        dataArr.push({ x: period, y: null, _txs: [] })
      } else {
        const txs = txsByPeriod[period] || []
        for (const tx of txs) sum += tx.amount
        dataArr.push({ x: period, y: sum, _txs: txs })
      }
    }
    perCategoryCumulative[cat] = dataArr
  })

  
  const datasets = filteredCategories
    .filter(cat => perCategoryCumulative[cat].some(v => v.y > 0))
    .map((cat, idx) => ({
      label: cat,
      data: perCategoryCumulative[cat],
      borderColor: catColors[cat],
      backgroundColor: catColors[cat],
      fill: false,
      tension: 0.4,
      pointRadius: ctx => {
        const { dataIndex, dataset } = ctx
        const point = dataset.data[dataIndex]
        return (point && point._txs && point._txs.length) ? 2 : 0
      },
      pointHoverRadius: 7
    }))

  chartData.value = {
    labels: periods,
    datasets
  }
}

watch([selectedYear, groupBy], fetchChartData)
onMounted(fetchChartData)
</script>