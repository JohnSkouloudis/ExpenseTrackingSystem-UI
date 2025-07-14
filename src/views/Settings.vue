<template>
  <div class="flex min-h-screen w-full">
    <!-- Nested Settings Sidebar -->
    <aside
      class="w-56 bg-neutral-900 border-r border-neutral-800 flex flex-col py-6 px-4 fixed left-64 top-0 h-screen"
      style="z-index: 20;"
    >
      <div class="mb-10 flex items-center gap-2">
        <span class="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">U</span>
        <span class="text-lg text-white font-bold">Settings</span>
      </div>
      <nav class="flex flex-col gap-2">
        <RouterLink
          to="/settings/user"
          class="text-white rounded px-3 py-2 hover:bg-green-900 hover:text-white transition"
          active-class="bg-green-700 text-white"
          exact-active-class="bg-green-700 text-white"
        >
          User
        </RouterLink>
        <RouterLink
          to="/settings/budget"
         class="text-white rounded px-3 py-2 hover:bg-green-900 hover:text-white transition"
          active-class="bg-green-700 text-white"
          exact-active-class="bg-green-700 text-white"
        >
          Budget
        </RouterLink>
        <RouterLink
          to="/settings/scheduledTransactions"
          class="text-white rounded px-3 py-2 hover:bg-green-900 hover:text-white transition"
          active-class="bg-green-700 text-white"
          exact-active-class="bg-green-700 text-white"
        >
          scheduledTransactions
        </RouterLink>
      </nav>
    </aside>
    <!-- Main content from child routes -->
    <main class="flex-1 p-12 ml-[23rem] max-w-5xl mx-auto text-lg">
      <RouterView />
    </main>
  </div>
</template>