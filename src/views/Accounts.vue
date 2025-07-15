<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-white mb-4">Your Bank Accounts</h1>

    
    <button
      @click="goToAddAccount"
      class="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
    >
      + Create Account
    </button>

    <div v-if="loading" class="text-gray-300">Loading accounts...</div>
    <div v-else>
      <div v-if="accounts && accounts.length" class="space-y-4">
        <div
          v-for="account in accounts"
          :key="account.id"
          class="bg-neutral-800 rounded-lg p-4 text-white flex justify-between items-center"
        >
          <div class="flex-1 flex gap-2 items-center">
            
            <template v-if="editingId === account.id">
              <input
                v-model="editFields.accountName"
                class="p-2 rounded bg-gray-700 text-white mr-2"
                type="text"
                style="width: 140px"
              />
              <input
                v-model.number="editFields.balance"
                class="p-2 rounded bg-gray-700 text-white mr-2"
                type="number"
                style="width: 100px"
              />
            </template>
            
            <template v-else>
              <div>
                <p class="font-semibold">{{ account.accountName }}</p>
                <p class="text-gray-400 text-sm">Balance: €{{ account.balance }}</p>
              </div>
            </template>
          </div>
          <div class="flex gap-2">
            
            <template v-if="editingId === account.id">
              <button
                @click="() => confirmUpdate(account)"
                class="px-2 py-1 bg-green-600 rounded hover:bg-green-700 mr-1"
              >
                Confirm
              </button>
              <button
                @click="cancelEditing"
                class="px-2 py-1 bg-gray-600 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </template>
            
            <template v-else>
              <button
                @click="() => startEditing(account)"
                class="px-3 py-1 bg-green-800 rounded hover:bg-green-700 transition mr-1"
              >
                Update
              </button>
              <button
                @click="() => handleDelete(account.id)"
                class="px-3 py-1 bg-red-600 rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </template>
          </div>
        </div>
      </div>
      <div v-else class="text-gray-300">No accounts found.</div>

      
      <div class="flex justify-center items-center gap-4 mt-6">
        <button
          :disabled="currentPage === 0"
          @click="prevPage"
          class="px-3 py-1 rounded bg-green-600 disabled:bg-gray-600 hover:bg-green-700 transition"
        >
          &larr; Previous
        </button>
        <span class="text-gray-300">Page {{ currentPage + 1 }} of {{ totalPages }}</span>
        <button
          :disabled="lastPage"
          @click="nextPage"
          class="px-3 py-1 rounded bg-green-600 disabled:bg-gray-600 hover:bg-green-700 transition"
        >
          Next &rarr;
        </button>
      </div>
    </div>

    
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
    >
      <div class="bg-neutral-900 p-8 rounded-xl shadow-lg flex flex-col items-center max-w-xs">
        <p class="text-white font-semibold mb-4 text-center">
          Are you sure you want to delete this account?<br />
          <span class="text-red-400 font-bold">All transactions in this account will also be deleted.</span>
        </p>
        <div class="flex gap-4">
          <button
            @click="confirmDelete"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >Yes</button>
          <button
            @click="showDeleteConfirm = false"
            class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >No</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { getPaginatedAccounts,  deleteAccount,updateAccount } from '../services/account'
import { useRouter } from 'vue-router'

const router = useRouter()
const pageSize = 10
const accounts = ref([])
const currentPage = ref(0)
const loading = ref(false)
const lastPage = ref(false)
const totalPages = ref(1)


const editingId = ref(null)
const editFields = reactive({
  accountName: '',
  balance: ''
})


const showDeleteConfirm = ref(false)
const accountIdToDelete = ref(null)

async function fetchAccounts() {
  loading.value = true
  try {
    const response = await getPaginatedAccounts(currentPage.value, pageSize)
    accounts.value = response.data.content
    lastPage.value = response.data.last
    totalPages.value = response.data.totalPages
  } catch (error) {
    console.error('Error fetching accounts:', error)
    accounts.value = []
    lastPage.value = true
    totalPages.value = 1
  } finally {
    loading.value = false
  }
}

function nextPage() {
  if (!lastPage.value) currentPage.value++
}
function prevPage() {
  if (currentPage.value > 0) currentPage.value--
}

watch(currentPage, fetchAccounts)
onMounted(fetchAccounts)

function goToAddAccount() {
  router.push('/addAccount')
}


function startEditing(account) {
  editingId.value = account.id
  editFields.accountName = account.accountName
  editFields.balance = account.balance
}
function cancelEditing() {
  editingId.value = null
}
async function confirmUpdate(account) {
  
  const confirmed = window.confirm(
    "Are you sure you want to update this account?"
  )
  if (!confirmed) return

  const updated = {
    id: account.id,
    balance: editFields.balance !== '' ? editFields.balance : account.balance,
    accountName: editFields.accountName || account.accountName,
    userId: account.userId
  }
  try {
    await updateAccount(updated)
    editingId.value = null
    await fetchAccounts()
    alert("Account updated!")
  } catch (e) {
    alert("Failed to update account.")
  }
}


function handleDelete(id) {
  accountIdToDelete.value = id
  showDeleteConfirm.value = true
}
async function confirmDelete() {
  try {
    await deleteAccount(accountIdToDelete.value)
    showDeleteConfirm.value = false
    await fetchAccounts()
    alert('Account deleted successfully')
  } catch (e) {
    alert('Failed to delete account')
    showDeleteConfirm.value = false
  }
}
</script>