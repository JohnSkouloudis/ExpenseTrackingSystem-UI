<script setup>
import Sidebar from './components/Sidebar.vue'

</script>

<template>
  
    <div class="flex flex-1  overflow-hidden shadow-lg bg-[#1a1a1a]">
      <Sidebar />

      <main class="flex-1 p-6 overflow-y-auto rounded-r-xl">
        <RouterView />
      </main>
    </div>
  
</template>

<style scoped>

</style>
