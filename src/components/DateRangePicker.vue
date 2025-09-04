<template>
  <div class="flex flex-wrap items-end gap-3">
    <div>
      <label class="block text-sm text-slate-300 mb-1">Start date</label>
      <input
        type="date"
        v-model="localStart"
        class="border border-slate-700 bg-slate-800 text-slate-100 rounded px-2 py-1"
      />
    </div>
    <div>
      <label class="block text-sm text-slate-300 mb-1"
        >End date (optional)</label
      >
      <input
        type="date"
        v-model="localEnd"
        class="border border-slate-700 bg-slate-800 text-slate-100 rounded px-2 py-1"
      />
    </div>
    <button
      @click="apply"
      class="h-9 px-3 rounded bg-indigo-600 text-white hover:bg-indigo-500"
    >
      Apply
    </button>
    <button
      @click="reset"
      class="h-9 px-3 rounded border border-slate-700 hover:bg-slate-800"
    >
      Reset
    </button>
  </div>
</template>

<script setup>
import { ref, watch, toRefs } from "vue";
const props = defineProps({ startDate: String, endDate: String });
const emits = defineEmits(["update"]);
const { startDate, endDate } = toRefs(props);
const localStart = ref(startDate.value || "");
const localEnd = ref(endDate.value || "");
watch(startDate, (v) => {
  if (v !== localStart.value) localStart.value = v || "";
});
watch(endDate, (v) => {
  if (v !== localEnd.value) localEnd.value = v || "";
});
function apply() {
  emits("update", {
    startDate: localStart.value || null,
    endDate: localEnd.value || null,
  });
}
function reset() {
  localStart.value = "";
  localEnd.value = "";
  emits("update", { startDate: null, endDate: null });
}
</script>
