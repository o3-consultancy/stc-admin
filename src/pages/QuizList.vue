<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h2 class="text-xl font-semibold">Quiz Submissions</h2>
      <DateRangePicker
        :startDate="startDate"
        :endDate="endDate"
        @update="setDates"
      />
    </div>

    <div class="flex items-center gap-3">
      <input
        v-model.trim="searchTerm"
        type="text"
        placeholder="Quick search (QR, sysId, correct answers)"
        class="border border-slate-700 bg-slate-800 text-slate-100 rounded px-3 py-2 w-80"
      />
      <button
        @click="exportAll"
        class="h-9 px-3 rounded bg-indigo-600 text-white hover:bg-indigo-500"
      >
        Export CSV (All Filtered)
      </button>
      <button
        @click="exportPage"
        class="h-9 px-3 rounded border border-slate-700 hover:bg-slate-800"
      >
        Export CSV (Current Page)
      </button>
    </div>

    <div
      class="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto"
    >
      <table class="min-w-full text-sm">
        <thead class="bg-slate-800 text-slate-300">
          <tr>
            <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('qrId')"
            >
              QR <SortIcon :active="sortKey === 'qrId'" :dir="sortDir" />
            </th>
            <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('sysId')"
            >
              sysId <SortIcon :active="sortKey === 'sysId'" :dir="sortDir" />
            </th>
            <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('correctAnswers')"
            >
              Correct Answers
              <SortIcon :active="sortKey === 'correctAnswers'" :dir="sortDir" />
            </th>
            <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('submittedAt')"
            >
              Submitted
              <SortIcon :active="sortKey === 'submittedAt'" :dir="sortDir" />
            </th>
            <th class="px-3 py-2 text-left">View</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="q in paginatedRows"
            :key="q.qrId + '_' + q.submittedAt"
            class="border-t border-slate-800"
          >
            <td class="px-3 py-2">{{ q.qrId }}</td>
            <td class="px-3 py-2">{{ q.sysId }}</td>
            <td class="px-3 py-2">{{ q.correctAnswers }}</td>
            <td class="px-3 py-2">{{ formatDate(q.submittedAt) }}</td>
            <td class="px-3 py-2">
              <RouterLink
                :to="{
                  name: 'quiz-detail',
                  params: { id: (q.qrId || '') + '|' + (q.submittedAt || '') },
                }"
                class="text-indigo-400 hover:underline"
                @click="selectQuiz(q)"
                >View</RouterLink
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      :page="page"
      :total-pages="totalPages"
      :page-size="pageSize"
      @update:page="(val) => (page = val)"
      @update:pageSize="(val) => (pageSize = val)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { apiGet } from "../api/client";
import DateRangePicker from "../components/DateRangePicker.vue";
import Pagination from "../components/Pagination.vue";
import dayjs from "dayjs";
import { toCSV, downloadCSV } from "../utils/csv";
import { useDataTable } from "../composables/useDataTable";
import { useSelectionStore } from "../store/selection";
import { formatToDisplayTimezone, getCurrentDateInDisplayTimezone, convertDateForAPI } from "../utils/timezone";

const SortIcon = {
  props: { active: Boolean, dir: String },
  template: `<span v-if="active" class="ml-1 text-slate-400">{{ dir==='asc' ? '▲' : '▼' }}</span>`,
};

const startDate = ref("");
const endDate = ref("");
const rows = ref([]);
const selection = useSelectionStore();

const {
  searchTerm,
  sortKey,
  sortDir,
  page: pageRef,
  pageSize: pageSizeRef,
  sortedRows,
  paginatedRows,
  totalPages,
  setSort,
  resetPage,
} = useDataTable(rows, {
  searchKeys: ["qrId", "sysId", "correctAnswers"],
  dateKeys: ["submittedAt"],
  defaultSort: { key: "submittedAt", dir: "desc" },
  initialPageSize: 20,
});
let page = pageRef;
let pageSize = pageSizeRef;

function setDates({ startDate: s, endDate: e }) {
  startDate.value = s || "";
  endDate.value = e || "";
  localStorage.setItem(
    "quizDates",
    JSON.stringify({ startDate: startDate.value, endDate: endDate.value })
  );
  load();
}
function formatDate(dt) {
  return formatToDisplayTimezone(dt, "YYYY-MM-DD HH:mm");
}
function selectQuiz(q) {
  selection.setQuiz(q);
}

async function load() {
  if (!startDate.value) return;
  const res = await apiGet("/api/quiz/list", {
    params: { 
      startDate: convertDateForAPI(startDate.value), 
      endDate: endDate.value ? convertDateForAPI(endDate.value) : undefined 
    },
  });
  rows.value = res.data || [];
  selection.primeFromArray(rows.value);
  resetPage();
}
onMounted(() => {
  const saved = localStorage.getItem("quizDates");
  if (saved) {
    const d = JSON.parse(saved || "{}");
    startDate.value = d.startDate || "";
    endDate.value = d.endDate || "";
  }
  if (!startDate.value) startDate.value = getCurrentDateInDisplayTimezone("YYYY-MM-DD");
  load();
});
</script>
