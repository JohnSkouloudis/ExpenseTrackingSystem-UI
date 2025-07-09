<template>
  <aside class="w-64 h-screen p-4 flex flex-col bg-[#242424] border border-gray-700 rounded-l-xl">
    
    <!-- Header + Navigation -->
    <div class="flex-1 flex flex-col">
      <!-- Sidebar Header -->
      <div class="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
        <div class="bg-green-600 text-white p-2 rounded-full ml-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8c-1.333 0-2 .667-2 2s.667 2 2 2 2 .667 2 2-.667 2-2 2M12 4v1m0 14v1m8-9h1m-18 0H3m15.364-5.364l.707.707M6.343 17.657l.707.707M17.657 17.657l-.707.707M6.343 6.343l-.707.707" />
          </svg>
        </div>
        <div>
          <h1 class="text-white font-bold text-lg">ExpenseTracker</h1>
          <p class="text-sm text-gray-400">Manage your finances</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex flex-col gap-3 mt-6">
        <RouterLink to="/" class="text-green-500 rounded px-3 py-2 hover:bg-green-900 hover:text-green-300 transition" active-class="bg-green-600 text-white">Dashboard</RouterLink>
        <RouterLink to="/transactions" class="text-green-500 rounded px-3 py-2 hover:bg-green-900 hover:text-green-300 transition" active-class="bg-green-600 text-white">Transactions</RouterLink>
        <RouterLink to="/accounts" class="text-green-500 rounded px-3 py-2 hover:bg-green-900 hover:text-green-300 transition" active-class="bg-green-600 text-white">Accounts</RouterLink>
        <RouterLink to="/analytics" class="text-green-500 rounded px-3 py-2 hover:bg-green-900 hover:text-green-300 transition" active-class="bg-green-600 text-white">Analytics</RouterLink>
        <RouterLink to="/settings" class="text-green-500 rounded px-3 py-2 hover:bg-green-900 hover:text-green-300 transition" active-class="bg-green-600 text-white">Settings</RouterLink>
      </nav>
    </div>

    
    <div class="pt-4 border-t border-gray-700">
      <button @click="handleLogout"
        class="flex items-center gap-2 text-white hover:bg-[#1a1a1a] hover:text-gray-300 transition-all px-2 py-2 rounded-md w-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 14a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
        <span class="text-sm font-medium">Logout</span>
      </button>
    </div>

  </aside>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { clearToken } from '../store/user';

const router = useRouter();

function handleLogout() {

  clearToken();
  router.push('/login');
}

</script>

