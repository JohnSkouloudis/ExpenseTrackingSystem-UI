<template>
  <div class="p-6 max-w-4xl w-full mx-auto">
    <h2 class="text-2xl font-bold text-white mb-6">
       Expenses During Budget Period
    </h2>
    <div class="mb-4 text-gray-300">
      <span class="mr-4">
        <span class="font-semibold text-white">Period:</span>
        {{ budgetPeriodLabel }}
      </span>
      <span>
        <span class="font-semibold text-white">Budget:</span>
        €{{ budgetAmount.toFixed(2) }}
      </span>
    </div>
    <div class="bg-neutral-800 rounded-xl p-6 w-full min-h-[400px] flex items-center justify-center">
      <Line
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
import { ref, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { getUserBudget } from '../services/budget'
import { getUserAccounts } from '../services/account'
import { getTransactionsByDateRange, getAllCategories } from '../services/transaction'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, annotationPlugin)

const budgetAmount = ref(0)
const budgetStart = ref('')
const budgetEnd = ref('')
const budgetPeriodLabel = ref('')

let maxValue = 1000

const chartData = ref(null)
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context) {
          const txs = context.raw && context.raw._txs ? context.raw._txs : []
          if (!txs.length) return `No transactions`
          return txs.map(tx =>
            `${tx.categoryName}: €${tx.amount.toFixed(2)}`
          )
        }
      },
      backgroundColor: '#222',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#fff',
      borderWidth: 1,
      padding: 10,
      displayColors: false
    },
    annotation: {
      annotations: {}
    },
    
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
        x: { min: -50 },
        y: { min: -50 ,max:undefined }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#fff', autoSkip: true, maxTicksLimit: 14 },
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


function formatDate(d) {
  return d.toISOString().split('T')[0]
}
function getPreviousDate(dateStr) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() - 1)
  return formatDate(d)
}

async function fetchChartData() {
  chartData.value = null

  
  const budgetRes = await getUserBudget()
  budgetAmount.value = budgetRes.data.budgetAmount
  budgetStart.value = budgetRes.data.startDate
  budgetEnd.value = budgetRes.data.endDate
  budgetPeriodLabel.value = `${budgetStart.value} to ${budgetEnd.value}`

  chartOptions.scales.y.max = budgetAmount.value + 50
  chartOptions.scales.y.max = budgetAmount.value + 50
  chartOptions.plugins.zoom.limits.y.max = budgetAmount.value + 50
  
  const accountsRes = await getUserAccounts()
  const accounts = accountsRes.data

  
  const categoriesRes = await getAllCategories()
  const categories = categoriesRes.data.filter(c => c.categoryName !== 'INCOME')
  const colorPalette = [
    '#ef4444', '#f59e42', '#facc15', '#22c55e', '#3b82f6', '#a855f7',
    '#ec4899', '#14b8a6', '#f87171', '#0ea5e9', '#a3e635'
  ]
  const catColors = {}
  categories.forEach((cat, idx) => {
    catColors[cat.categoryName] = colorPalette[idx % colorPalette.length]
  })

  
  let allTx = []
  for (const acc of accounts) {
    const txRes = await getTransactionsByDateRange(acc.id, budgetStart.value, budgetEnd.value)
    allTx.push(...txRes.data.filter(tx => tx.categoryName !== 'INCOME'))
  }
  allTx = allTx.sort((a, b) => new Date(a.date) - new Date(b.date))

  
  const txsByDate = {}
  allTx.forEach(tx => {
    if (!txsByDate[tx.date]) txsByDate[tx.date] = []
    txsByDate[tx.date].push(tx)
  })

  
  const lastTxDate = allTx.length ? allTx[allTx.length - 1].date : null

  
  const start = new Date(budgetStart.value)
  const end = new Date(budgetEnd.value)
  const dateLabels = []
  let runningTotal = 0
  let dataPoints = []

  
  const preStart = getPreviousDate(budgetStart.value)
  dateLabels.push(preStart)
  dataPoints.push({ x: preStart, y: 0, _txs: [] })

  let lastDayReached = false
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const label = formatDate(d)
    dateLabels.push(label)

    if (lastDayReached) continue 

    const txs = txsByDate[label] || []
    for (const tx of txs) {
      runningTotal += tx.amount
    }
    dataPoints.push({
      x: label,
      y: runningTotal,
      _txs: txs
    })
    if (label === lastTxDate) lastDayReached = true
  }

  chartData.value = {
    labels: dateLabels,
    datasets: [
      {
        label: 'Cumulative Expenses',
        data: dataPoints,
        borderColor: '#3b82f6',
        backgroundColor: '#3b82f6',
        fill: false,
        tension: 0.4,
       
        borderWidth: 2,
        
        pointRadius: (ctx) => {
          const { dataIndex, dataset } = ctx
          if (dataIndex === 0) return 0
          const point = dataset.data[dataIndex]
          return (point && point._txs && point._txs.length) ? 3 : 0
        },
        pointHoverRadius: (ctx) => {
          const { dataIndex, dataset } = ctx
          if (dataIndex === 0) return 0
          const point = dataset.data[dataIndex]
          return (point && point._txs && point._txs.length) ? 7 : 0
        },
        pointBackgroundColor: (ctx) => {
          const { dataIndex, dataset } = ctx
          const point = dataset.data[dataIndex]
          return (point && point._txs && point._txs.length)
            ? catColors[point._txs[0].categoryName] || '#666'
            : 'rgba(0,0,0,0)'
        }
      }
    ]
  }

  
  chartOptions.plugins.annotation.annotations = {
    budgetLine: {
      type: 'line',
      yMin: budgetAmount.value,
      yMax: budgetAmount.value,
      borderColor: '#22c55e',
      borderWidth: 3,
      borderDash: [8, 8],
      label: {
        display: true,
        content: `Budget: €${budgetAmount.value.toFixed(2)}`,
        color: '#fff',
        backgroundColor: '#22c55e',
        position: 'end'
      }
    }
  }
}

onMounted(fetchChartData)
</script>




