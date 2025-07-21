<template>
  
  <div class="w-full max-w-lg mx-auto">
    <h2 class="text-2xl font-bold mb-4  text-white text-center">Categories Summary</h2>
    <Pie ref="pieRef" :data="chartData" :options="chartOptions" @click="handleClick" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  categoriesSummary: {
    type: Array,
    required: true
  }
})

const drilledTypes = ref([]) 
const pieRef = ref(null)

const chartData = computed(() => {
  const labels = []
  const data = []

  props.categoriesSummary.forEach(cat => {
    if (drilledTypes.value.includes(cat.type) && cat.subcategories?.length) {
      
      cat.subcategories.forEach(sub => {
        labels.push(sub.name)
        data.push(sub.amount)
      })
    } else {
      
      labels.push(cat.type)
      data.push(cat.amount)
    }
  })

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: generateColors(labels.length)
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
  position: 'bottom',
  labels: {
    generateLabels: (chart) => {
      const data = chart.data
      return data.labels.map((label, i) => {
        const value = data.datasets[0].data[i]
        return {
          text: `${label} (${value})`,
          fillStyle: data.datasets[0].backgroundColor[i],
          strokeStyle: data.datasets[0].backgroundColor[i],
          fontColor: '#fff', 
          color: '#fff',     
          index: i
        }
      })
    }
  }
},
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.label
          const value = context.parsed
          return `${label} (${value})`
        }
      }
    }
  }
}

function generateColors(count) {
  const palette = ['#22c55e', '#3b82f6', '#facc15', '#ef4444', '#8b5cf6', '#f97316', '#14b8a6', '#e879f9', '#f87171', '#0ea5e9', '#f472b6']
  const colors = []
  for (let i = 0; i < count; i++) {
    colors.push(palette[i % palette.length])
  }
  return colors
}

function handleClick(event) {
  const chartInstance = pieRef.value?.chart
  if (!chartInstance) return

  const points = chartInstance.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false)

  if (points.length > 0) {
    const clickedLabel = chartData.value.labels[points[0].index]

    
    const clickedCat = props.categoriesSummary.find(cat => 
      cat.type === clickedLabel || 
      (cat.subcategories && cat.subcategories.some(sub => sub.name === clickedLabel))
    )

    if (clickedCat) {
      if (drilledTypes.value.includes(clickedCat.type)) {
        drilledTypes.value = drilledTypes.value.filter(t => t !== clickedCat.type)
      } else {
        drilledTypes.value.push(clickedCat.type)
      }
    }
  }
}
</script>