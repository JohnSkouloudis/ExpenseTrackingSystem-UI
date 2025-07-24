<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-bold text-white mb-4">Scheduled Transactions</h1>
    <div v-if="loading" class="text-gray-300">Loading...</div>

    
    <div class="hidden lg:block">
      <div class="rounded-2xl border-4 border-green-600 bg-neutral-800 shadow-lg p-2">
      <table class="w-full text-gray-200 text-left rounded-xl bg-transparent">
        <thead>
          <tr class="border-b border-green-600">
            <th class="py-2 px-2">Description</th>
            <th class="py-2 px-2">Amount</th>
            <th class="py-2 px-2">Created</th>
            <th class="py-2 px-2">Frequency</th>
            <th class="py-2 px-2">Next</th>
            <th class="py-2 px-2">Account</th>
            <th class="py-2 px-2">Category</th>
            <th class="py-2 px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="stx in scheduledTransactions.slice(0, 10)" :key="stx.id" class="border-b border-neutral-800">
            <td class="py-1 px-2 break-words max-w-[160px]">{{ stx.description }}</td>
            <td class="py-1 px-2 whitespace-nowrap">€{{ stx.amount }}</td>
            <td class="py-1 px-2 whitespace-nowrap">{{ stx.createdDate }}</td>
            <td class="py-1 px-2 whitespace-nowrap">{{ stx.frequencyInDays }}</td>
            <td class="py-1 px-2 whitespace-nowrap">{{ stx.executionDate }}</td>
            <td class="py-1 px-2 break-words max-w-[120px]">{{ accountName(stx.accountId) }}</td>
            <td class="py-1 px-2 break-words max-w-[120px]">{{ stx.categoryName }}</td>
            <td class="py-1 px-2">
              <button @click="showDeleteConfirm(stx.id)"
                class="px-2 py-1 bg-red-600 rounded hover:bg-red-700 text-white text-xs">Delete</button>
            </td>
          </tr>
          <tr v-if="deleteConfirmId !== null">
            <td colspan="8" class="bg-neutral-800 text-red-400 text-center py-2">
              Are you sure you want to delete this scheduled transaction?
              <div class="flex justify-center gap-3 mt-2">
                <button @click="confirmDelete(deleteConfirmId)"
                  class="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-white">Yes</button>
                <button @click="deleteConfirmId = null"
                  class="px-3 py-1 bg-gray-600 rounded hover:bg-gray-700 text-white">No</button>
              </div>
            </td>
          </tr>
          <tr v-if="addingNew" class="bg-neutral-800">
            <td class="py-1 px-1 max-w-[160px]">
              <input v-model="newTransaction.description" required
                type="text" maxlength="100"
                class="bg-neutral-700 text-white px-2 py-1 rounded w-full text-sm" placeholder="Description" />
            </td>
            <td class="py-1 px-1">
              <input v-model.number="newTransaction.amount" required
                type="number" class="bg-neutral-700 text-white px-2 py-1 rounded w-full text-sm" placeholder="Amount" />
            </td>
            <td class="py-1 px-1 w-[160px]">
              <input
                :value="formatDate(today)"
                readonly
                class="bg-neutral-700 text-white px-2 py-1 rounded w-full text-sm cursor-not-allowed"
              />
            </td>
            <td class="py-1 px-1">
              <input v-model.number="newTransaction.frequencyInDays" required
                type="number" class="bg-neutral-700 text-white px-2 py-1 rounded w-full text-sm" placeholder="Frequency" min="1" />
            </td>
            <td class="py-1 px-1 w-[170px]">
              <DatePicker
                required
                v-model="newTransaction.executionDate"
                :enable-time-picker="false"
                :min-date="tomorrow"
                :format="'yyyy-MM-dd'"
                placeholder="Pick a date"
                dark="true"
                
              />
            </td>
            <td class="py-1 px-1">
              <select required v-model="newTransaction.accountId" class="bg-neutral-700 text-white px-2 py-1 rounded w-full text-sm">
                <option disabled value="">Select account</option>
                <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.accountName }}</option>
              </select>
            </td>
            <td class="py-1 px-1">
              <select required v-model="newTransaction.categoryName" class="bg-neutral-700 text-white px-2 py-1 rounded w-full text-sm">
                <option disabled value="">Select category</option>
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </td>
            <td class="py-1 px-1 flex flex-col gap-2">
              <button @click="submitNew"
                class="px-2 py-1 bg-green-600 rounded hover:bg-green-700 text-white text-xs w-full">Confirm</button>
              <button @click="cancelAdd"
                class="px-2 py-1 bg-gray-600 rounded hover:bg-gray-700 text-white text-xs w-full">Cancel</button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <div class="space-y-4 lg:hidden">
      <div v-for="stx in scheduledTransactions.slice(0, 10)" :key="stx.id"
        class="rounded-xl bg-neutral-900 shadow-md p-4 flex flex-col gap-1 border border-neutral-700">
        <div class="flex justify-between text-base font-semibold text-green-400">
          <span>{{ stx.description }}</span>
          <span>€{{ stx.amount }}</span>
        </div>
        <div class="flex flex-wrap gap-x-6 gap-y-1 mt-1 text-sm text-gray-200">
          <div><span class="font-medium">Created:</span> {{ stx.createdDate }}</div>
          <div><span class="font-medium">Freq:</span> {{ stx.frequencyInDays }}d</div>
          <div><span class="font-medium">Next:</span> {{ stx.executionDate }}</div>
          <div><span class="font-medium">Acc:</span> {{ accountName(stx.accountId) }}</div>
          <div><span class="font-medium">Cat:</span> {{ stx.categoryName }}</div>
        </div>
        <div class="mt-2 flex gap-3">
          <button @click="showDeleteConfirm(stx.id)"
            class="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-white text-xs">Delete</button>
        </div>
        <div v-if="deleteConfirmId === stx.id" class="mt-2 text-red-400 bg-neutral-800 rounded p-2 text-sm">
          Are you sure you want to delete?<br>
          <div class="flex justify-center gap-3 mt-2">
            <button @click="confirmDelete(deleteConfirmId)"
              class="px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-white">Yes</button>
            <button @click="deleteConfirmId = null"
              class="px-3 py-1 bg-gray-600 rounded hover:bg-gray-700 text-white">No</button>
          </div>
        </div>
      </div>
      <div v-if="addingNew" class="rounded-xl bg-neutral-900 shadow-md p-4 border border-neutral-700 mt-4 space-y-2">
        <input v-model="newTransaction.description" type="text" maxlength="100" required
          class="bg-neutral-700 text-white px-2 py-1 rounded w-full text-sm mb-1" placeholder="Description" />
        <input v-model.number="newTransaction.amount" type="number" required
          class="bg-neutral-700 text-white px-2 py-1 rounded w-full text-sm mb-1" placeholder="Amount" />
        <input
          :value="formatDate(today)"
          readonly
          class="bg-neutral-700 text-white px-2 py-1 rounded w-full text-sm mb-1 cursor-not-allowed"
        />
        <input v-model.number="newTransaction.frequencyInDays" required
          type="number" class="bg-neutral-700 text-white px-2 py-1 rounded w-full text-sm mb-1" placeholder="Frequency" min="1" />
        <DatePicker
          v-model="newTransaction.executionDate"
          :enable-time-picker="false"
          :min-date="tomorrow"
          :format="'yyyy-MM-dd'"
          input-class-name="bg-neutral-700 text-white px-2 py-1 rounded w-full text-sm"
          placeholder="Execution date"
          :editable="false"
          :teleport="body"
          class="w-full mb-1"
        />
        <select required v-model="newTransaction.accountId" class="bg-neutral-700 text-white px-2 py-1 rounded w-full text-sm mb-1">
          <option disabled value="">Select account</option>
          <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.accountName }}</option>
        </select>
        <select required v-model="newTransaction.categoryName" class="bg-neutral-700 text-white px-2 py-1 rounded w-full text-sm mb-1">
          <option disabled value="">Select category</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
        <div class="flex gap-2">
          <button
              @click="submitNew"
              class="px-2 py-1 bg-green-600 rounded hover:bg-green-700 text-white text-xs w-full disabled:opacity-50 disabled:cursor-not-allowed">
              Confirm
          </button>
          <button @click="cancelAdd"
            class="px-3 py-1 bg-gray-600 rounded hover:bg-gray-700 text-white text-xs w-full">Cancel</button>
        </div>
      </div>
    </div>

    <div class="mt-6 flex justify-end">
      <button
        v-if="!addingNew"
        @click="startAdd"
        :disabled="scheduledTransactions.length >= 10" 
        :title="scheduledTransactions.length >= 10 ? 'Maximum 10 scheduled transactions allowed.' : ''"
        class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-base shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        + Schedule New Transaction
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import DatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

import { getUserAccounts } from '../services/account'
import { getAllCategories, getScheduledTransactions, deleteScheduledTransaction, createScheduledTransaction } from '../services/transaction'

const today = new Date()
const tomorrow = new Date()
tomorrow.setDate(today.getDate() + 1)

const loading = ref(true)
const scheduledTransactions = ref([])
const accounts = ref([])
const categories = ref([])
const deleteConfirmId = ref(null)
const addingNew = ref(false)

const newTransaction = ref({
  description: '',
  amount: null,
  createdDate: today,
  frequencyInDays: 1,
  executionDate: null,
  accountId: '',
  categoryName: ''
})

async function fetchAll() {
  loading.value = true
  try {
    const [stxRes, accRes, catRes] = await Promise.all([
      getScheduledTransactions(),
      getUserAccounts(),
      getAllCategories()
    ])
    scheduledTransactions.value = stxRes.data
    accounts.value = accRes.data
    categories.value = catRes.data.map(c => c.categoryName)
  } catch (err) {
    scheduledTransactions.value = []
    accounts.value = []
    categories.value = []
  } finally {
    loading.value = false
  }
}

function accountName(id) {
  const acc = accounts.value.find(a => a.id === id)
  return acc ? acc.accountName : 'Unknown'
}

function showDeleteConfirm(id) {
  deleteConfirmId.value = id
}
async function confirmDelete(id) {
  const res = await deleteScheduledTransaction(id)
  scheduledTransactions.value = scheduledTransactions.value.filter(stx => stx.id !== id)
  deleteConfirmId.value = null
  if (res.status === 200) {
    alert(res.data || 'scheduled transaction deleted successfully.')
  } else {
    alert(res.data || 'Failed to delete scheduled transaction.')
  }
}

function startAdd() {
  addingNew.value = true
  newTransaction.value = {
    description: '',
    amount: null,
    createdDate: today,
    frequencyInDays: 1,
    executionDate: null,
    accountId: '',
    categoryName: ''
  }
}
function cancelAdd() {
  addingNew.value = false
}
async function submitNew() {
  const toSubmit = {
    ...newTransaction.value,
    createdDate: formatDate(today),
    executionDate: newTransaction.value.executionDate
      ? formatDate(newTransaction.value.executionDate)
      : null
  }
  const res = await createScheduledTransaction(toSubmit)
  if (res.status === 201 || res.status === 200) {
    scheduledTransactions.value.push({ ...toSubmit, id: res.data.id })
    addingNew.value = false
    await fetchAll();
    alert(res.data)
  } else {
    alert(res.data || 'Failed to create scheduled transaction')
  }
}


function formatDate(date) {
  if (!date) return ''
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Load everything on mount
onMounted(() => {
  fetchAll()
})
</script>
