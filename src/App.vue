<script setup>
import Sidebar from './components/Sidebar.vue'
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const showSidebar = computed(() => {
  return !['Login', 'Register', 'NotFound'].includes(route.name);
});
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#1a1a1a]">
    <div v-if="showSidebar" class="fixed left-0 top-0 h-screen w-64 bg-[#1a1a1a] shadow-lg z-20">
      <Sidebar />
    </div>

    <main
      :class="[
        'flex-1 p-6 overflow-y-auto rounded-r-xl transition-all duration-300',
        showSidebar ? 'ml-64' : ''
      ]"
    >
      <RouterView />
    </main>
  </div>
</template>
