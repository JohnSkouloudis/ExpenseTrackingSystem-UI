<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    
    
    <div class="bg-neutral-800 rounded-2xl p-6 flex flex-col shadow">
      <span class="text-gray-400 font-semibold mb-1">Days Left for Budget</span>
      <span class="text-3xl font-bold text-white">
        <template v-if="daysLeft !== null">{{ daysLeft }}</template>
        <template v-else>—</template>
      </span>
      <span class="text-gray-400 text-xs mt-2">
        <template v-if="daysLeft === 1">1 day remaining</template>
        <template v-else-if="daysLeft > 1"> days remaining</template>
        <template v-else>No days left</template>
      </span>
    </div>

    
    <div class="bg-neutral-800 rounded-2xl p-6 flex flex-col shadow">
      <span class="text-gray-400 font-semibold mb-1">Total Expenses this Month</span>
      <span class="text-3xl font-bold text-white">${{ thisMonthExpenses.toFixed(2) }}</span>
      <span
        class="text-xs mt-2"
        :class="diffThisMonth >= 0 ? 'text-green-400' : 'text-red-400'"
      >
        <span v-if="diffThisMonth >= 0">↑</span>
        <span v-else>↓</span>
        ${{ Math.abs(diffThisMonth).toFixed(2) }} from last month
      </span>
    </div>

    
    <div class="bg-neutral-800 rounded-2xl p-6 flex flex-col shadow">
  <span class="text-gray-400 font-semibold mb-1">Target Budget</span>
  <span class="text-3xl font-bold text-white">${{ monthlyBudget.toFixed(2) }}</span>
  <span class="text-gray-400 text-xs mt-2">
    <template v-if="props.startDate && props.endDate">
      <span class="font-semibold text-gray-300">Duration:</span>
      {{ props.startDate }} &mdash; {{ props.endDate }}
    </template>
    <template v-else>
      Target spending limit
    </template>
  </span>
</div>

    
    <div class="bg-neutral-800 rounded-2xl p-6 flex flex-col shadow">
      <span class="text-gray-400 font-semibold mb-1">Budget Used</span>
      <span class="text-3xl font-bold text-white">{{ budgetUsedPercent }}%</span>
      <div class="h-2 rounded bg-neutral-700 mt-4">
        <div
          class="h-2 rounded  transition-all duration-300"
          :class="budgetBarClass"
          :style="{ width: Math.min(budgetUsedPercent, 100) + '%' }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  thisMonthExpenses: { type: Number, required: true },
  lastMonthExpenses: { type: Number, required: true },
  monthlyBudget: { type: Number, required: true },
  remainingBudget: { type: Number, required: true },
  startDate: { type: String, default: null },
  endDate: { type: String, default: null }
})

const daysLeft = computed(() => {
  const end = new Date(props.endDate)
  const now = new Date()
  return Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)))
})

const diffThisMonth = computed(() => props.thisMonthExpenses - props.lastMonthExpenses)
const budgetUsedPercent = computed(() =>
  props.monthlyBudget
    ?  (100 - (props.remainingBudget / props.monthlyBudget) * 100).toFixed(1)
    : 0
)

const budgetBarClass = computed(() =>
  budgetUsedPercent.value >= 100
    ? 'bg-red-500'
    : 'bg-green-500'
)
</script>