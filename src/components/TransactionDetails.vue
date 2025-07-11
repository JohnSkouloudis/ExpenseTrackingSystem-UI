<template>
  <div class="bg-neutral-700 rounded p-4 mt-2 text-gray-300">
    <p><strong>Description:</strong> {{ details.transactiondto.description }}</p>
    <p><strong>Amount:</strong> €{{ details.transactiondto.amount.toFixed(2) }}</p>
    <p><strong>Date:</strong> {{ details.transactiondto.date }}</p>
    <p><strong>Category:</strong> {{ details.transactiondto.categoryName }}</p>
    <p><strong>Account ID:</strong> {{ details.transactiondto.accountId }}</p>

    <div v-if="details.base64Image" class="mt-4">
      <p><strong>Receipt Image:</strong></p>
      <img :src="'data:image/png;base64,' + details.base64Image" alt="Receipt" class="rounded max-w-full" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  details: {
    type: Object,
    required: true
  }
})
</script>