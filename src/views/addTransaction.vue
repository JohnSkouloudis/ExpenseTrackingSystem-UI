<template>
  <div class="p-6 max-w-md mx-auto">
    <h1 class="text-2xl font-bold text-white mb-6">Add New Transaction</h1>

    <form @submit.prevent="submitForm" class="space-y-4 bg-neutral-800 p-6 rounded-xl">
      <div>
        <label class="block text-gray-300 mb-1">Amount (€)</label>
        <input
          v-model="transaction.amount"
          type="number"
          step="0.01"
          class="w-full p-2 rounded bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-green-500"
          required
        />
      </div>

      <div>
        <label class="block text-gray-300 mb-1">Description</label>
        <input
          v-model="transaction.description"
          type="text"
          class="w-full p-2 rounded bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-green-500"
          required
        />
      </div>

      <div>
        <label class="block text-gray-300 mb-1">Select Account</label>
        <select
          v-model="transaction.accountId"
          class="w-full p-2 rounded bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-green-500"
          required
        >
          <option
            v-for="account in accounts"
            :key="account.id"
            :value="account.id"
          >
            {{ account.accountName }} — €{{ account.balance }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-gray-300 mb-1">Select Category</label>
        <select
          v-model="transaction.categoryName"
          class="w-full p-2 rounded bg-neutral-700 text-white placeholder-gray-400 focus:outline-none focus:ring focus:ring-green-500"
          required
        >
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.categoryName"
          >
            {{ category.categoryName }}
          </option>
        </select>
      </div>

      <div>
  <label class="block text-gray-300 mb-1">Receipt Image (optional)</label>
  <input
    ref="fileInput"
    type="file"
    @change="handleFileChange"
    class="hidden"
  />
  <button
  type="button"
  @click="triggerFileInput"
  class="w-full bg-neutral-700 text-white py-2 rounded transition border border-transparent hover:border-green-500 hover:bg-neutral-600"
>
  Select Image
</button>
  <p v-if="imageFileName" class="text-gray-400 mt-1 text-sm truncate">
    Selected: {{ imageFileName }}
  </p>
</div>

      <button
        type="submit"
        class="w-full bg-green-600 hover:bg-green-700 transition text-white font-semibold py-2 rounded"
      >
        Add Transaction
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserAccounts } from '../services/account'
import { addTransaction,getAllCategories } from '../services/transaction'

const router = useRouter()

const accounts = ref([])
const categories = ref([])
const imageFile = ref(null)
const imageFileName = ref('')
const fileInput = ref(null)

const transaction = ref({
  amount: 0,
  description: '',
  accountId: null,
  categoryName: ''
})

async function fetchAccountsAndCategories() {
  try {
    const accRes = await getUserAccounts()
    accounts.value = accRes.data

    if (accounts.value.length) {
      transaction.value.accountId = accounts.value[0].id
    }

    const catRes = await getAllCategories()
    categories.value = catRes.data

    if (categories.value.length) {
      transaction.value.categoryName = categories.value[0].categoryName
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

function handleFileChange(e) {
  const file = e.target.files[0]
  imageFile.value = file
  imageFileName.value = file ? file.name : ''
}

function triggerFileInput() {
  fileInput.value?.click()
}

async function submitForm() {
  try {
    
    const today = new Date().toISOString().split('T')[0]

    const dto = {
      id: 0,
      amount: transaction.value.amount,
      description: transaction.value.description,
      date: today,
      accountId: transaction.value.accountId,
      categoryName: transaction.value.categoryName
    }

    const formData = new FormData()
    formData.append('data', JSON.stringify(dto))
    if (imageFile.value) {
      formData.append('image', imageFile.value)
    }

    await addTransaction(formData)

    alert('Transaction created successfully!')
    router.push('/transactions')
  } catch (error) {
    console.error('Error creating transaction:', error)
    alert('Failed to create transaction.')
  }
}

onMounted(() => {
  fetchAccountsAndCategories()
})
</script>