<template>
  <div class="flex flex-wrap items-center gap-3">
    <div class="flex items-center gap-2">
      <button
        class="px-3 py-1 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
        :disabled="page <= 1"
        @click="$emit('update:page', page - 1)"
      >
        Prev
      </button>
      <span class="text-sm text-slate-300"
        >Page {{ page }} of {{ totalPages }}</span
      >
      <button
        class="px-3 py-1 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 disabled:opacity-50"
        :disabled="page >= totalPages"
        @click="$emit('update:page', page + 1)"
      >
        Next
      </button>
    </div>
    <div class="ml-auto flex items-center gap-2">
      <label class="text-sm text-slate-300">Rows per page</label>
      <select
        class="border border-slate-700 bg-slate-800 text-slate-100 rounded px-2 py-1"
        :value="pageSize"
        @change="$emit('update:pageSize', Number($event.target.value))"
      >
        <option v-for="n in [10, 20, 50, 100]" :key="n" :value="n">
          {{ n }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
defineProps({ page: Number, totalPages: Number, pageSize: Number });
defineEmits(["update:page", "update:pageSize"]);
</script>
