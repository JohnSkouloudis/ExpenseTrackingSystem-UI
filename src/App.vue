<script setup>
import Sidebar from './components/Sidebar.vue'
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const showSidebar = computed(() => {

  return !['Login', 'Register','NotFound'].includes(route.name);
});

</script>

<template>
  
    <div class="flex flex-1  overflow-hidden shadow-lg bg-[#1a1a1a]">
      <Sidebar v-if="showSidebar" />

      <main class="flex-1 p-6 overflow-y-auto rounded-r-xl">
        <RouterView />
      </main>
    </div>
  
</template>

<style scoped>

</style>
