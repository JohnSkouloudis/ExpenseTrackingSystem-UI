<template>
  <div class="flex flex-wrap gap-4 justify-center p-4">

    <ChartBox>
      <PieChart v-if="categoriesSummary.length" :categoriesSummary="categoriesSummary" />
      <p v-else class="text-gray-400">Loading data...</p>
    </ChartBox>
    <ChartBox>
      <IncomeExpenseMonthlyBarChart />
    </ChartBox>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import PieChart from '../components/PieChart.vue'
import { getCategoriesSummary } from '../services/transaction'
import ChartBox from '../components/ChartBox.vue'
import IncomeExpenseMonthlyBarChart from '../components/IncomeExpenseMonthlyBarChart.vue'

const categoriesSummary = ref([])


onMounted(async () => {
  try {
    categoriesSummary.value = await getCategoriesSummary()
  } catch (error) {
    console.error('Failed to load category summary:', error)
  }
})


</script>

