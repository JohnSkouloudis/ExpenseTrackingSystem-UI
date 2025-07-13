<template>
  <div>
    <h2 class="text-xl font-bold text-white mb-6">Manage Budget</h2>
    
    <form @submit.prevent="createBudget" class="max-w-sm space-y-4">
      <div>
        <label class="block text-gray-300 mb-1">Budget Amount ($)</label>
        <input v-model.number="budgetAmount" class="w-full p-2 rounded bg-neutral-800 text-white" type="number" min="0" step="0.01" required />
      </div>
      <div>
        <label class="block text-gray-300 mb-1">Start Date</label>
        <VueDatePicker
            readonly="true"
            v-model="startDate"
            :enable-time-picker="false"
            :format="'yyyy-MM-dd'"
            dark="true"
          />
      </div>
      <div>
        <label class="block text-gray-300 mb-1">End Date</label>
        <VueDatePicker
            v-model="endDate"
            :enable-time-picker="false"
            :min-date="now"
            :format="'yyyy-MM-dd'"
            dark="true"
          />
      </div>
      <div class="flex gap-2">
        <button v-if="hasBudget" type="button" @click="updateBudget" class="bg-orange-600 px-4 py-2 text-white rounded hover:bg-orange-700">Update Budget</button>
        <button v-else type="submit" class="bg-green-600 px-4 py-2 text-white rounded hover:bg-green-700">Create Budget</button>
        <button v-if="hasBudget" type="button" @click="deleteBudget" class="bg-red-600 px-4 py-2 text-white rounded hover:bg-red-700">Delete Budget</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import { ref,onBeforeMount } from 'vue'
import { getUserBudget , deleteUserBudget ,createUserBudget,updateUserBudget} from '../services/budget'

const budgetAmount = ref(null)
const startDate = ref(new Date().toISOString().split('T')[0]);
const endDate = ref('')
const hasBudget = ref(false)
const now = new Date()

async function createBudget() { 

    const diffMs = new Date(endDate.value) - now
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
        alert('End date must be in the future')
        return
    }

    const budget={
        budgetAmount: budgetAmount.value,
        startDate: now.toISOString().split('T')[0],
        duration: diffDays,
        durationUnit: "DAY"
    }

    const response = await createUserBudget(budget)

    if(response.status === 201) {
        hasBudget.value = true 
        alert(response.data) 
    } else {
        alert('Failed to create budget')
    }
}

async function updateBudget() { 

    const diffMs = new Date(endDate.value) - now
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
        alert('End date must be in the future')
        return
    }

    const budget={
        budgetAmount: budgetAmount.value,
        startDate: now.toISOString().split('T')[0],
        duration: diffDays,
        durationUnit: "DAY"
    }

    const response = await updateUserBudget(budget)

    if(response.status === 200) {
        hasBudget.value = true 
        alert(response.data) 
    } else {
        alert('Failed to update budget')
    }
}

    


async function deleteBudget() { 

    const response = await deleteUserBudget()

    if(response.status === 200){
        hasBudget.value = false;
        budgetAmount.value = null;
        startDate.value = new Date().toISOString().split('T')[0];
        endDate.value = ''; 
        alert(response.data)
        
    } else {
        alert('Failed to delete budget')
    }
 }

async function fetchBudget() {
    const budget = await getUserBudget()
    console.log(budget.data)
    if (budget.data) {
        budgetAmount.value = budget.data.budgetAmount
        startDate.value = budget.data.startDate
        endDate.value = budget.data.endDate
        hasBudget.value = true
    } else {
        hasBudget.value = false
    }
}
onBeforeMount(async() => {
  await fetchBudget()
})

</script>