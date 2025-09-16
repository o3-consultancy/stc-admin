<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h2 class="text-xl font-semibold">Surveys</h2>
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
        placeholder="Quick search (name, email, company, QR, sysId, surveyId)"
        class="border border-slate-700 bg-slate-800 text-slate-100 rounded px-3 py-2 w-96"
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
            <!-- <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('surveyId')"
            >
              Survey ID
              <SortIcon :active="sortKey === 'surveyId'" :dir="sortDir" />
            </th> -->
            <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('qrId')"
            >
              QR <SortIcon :active="sortKey === 'qrId'" :dir="sortDir" />
            </th>
            <!-- <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('sysId')"
            >
              sysId <SortIcon :active="sortKey === 'sysId'" :dir="sortDir" />
            </th> -->
            <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('name')"
            >
              Name <SortIcon :active="sortKey === 'name'" :dir="sortDir" />
            </th>
            <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('company')"
            >
              Company
              <SortIcon :active="sortKey === 'company'" :dir="sortDir" />
            </th>
            <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('phoneNumber')"
            >
              Phone
              <SortIcon :active="sortKey === 'phoneNumber'" :dir="sortDir" />
            </th>
            <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('interest')"
            >
              Interest
              <SortIcon :active="sortKey === 'interest'" :dir="sortDir" />
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
            v-for="s in paginatedRows"
            :key="s.surveyId"
            class="border-t border-slate-800"
          >
            <td class="px-3 py-2">{{ s.qrId }}</td>
            <td class="px-3 py-2">{{ s.name }}</td>
            <td class="px-3 py-2">{{ s.company }}</td>
            <td class="px-3 py-2">{{ s.phoneNumber }}</td>
            <td class="px-3 py-2">{{ s.interest }}</td>
            <!-- <td class="px-3 py-2">{{ s.company }}</td> -->
            <td class="px-3 py-2">{{ formatDate(s.submittedAt) }}</td>
            <td class="px-3 py-2">
              <RouterLink
                :to="{ name: 'survey-detail', params: { id: s.surveyId } }"
                class="text-indigo-400 hover:underline"
                @click="selectSurvey(s)"
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
  searchKeys: ["surveyId", "qrId", "sysId", "name", "email", "company"],
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
    "surveysDates",
    JSON.stringify({ startDate: startDate.value, endDate: endDate.value })
  );
  load();
}
function formatDate(dt) {
  return formatToDisplayTimezone(dt, "YYYY-MM-DD HH:mm");
}
function selectSurvey(s) {
  selection.setSurvey(s);
}

async function load() {
  if (!startDate.value) return;
  const res = await apiGet("/api/surveys/list", {
    params: { 
      startDate: convertDateForAPI(startDate.value), 
      endDate: endDate.value ? convertDateForAPI(endDate.value) : undefined 
    },
  });
  rows.value = (res.data || []).map((r) => ({
    ...r,
    surveyId: r.surveyId || "",
  }));
  selection.primeFromArray(rows.value);
  resetPage();
}
onMounted(() => {
  const saved = localStorage.getItem("surveysDates");
  if (saved) {
    const d = JSON.parse(saved || "{}");
    startDate.value = d.startDate || "";
    endDate.value = d.endDate || "";
  }
  if (!startDate.value) startDate.value = getCurrentDateInDisplayTimezone("YYYY-MM-DD");
  load();
});

// --- CSV export helpers ---
function mapRow(r) {
  return {
    "Survey ID": r.surveyId || "",
    QR: r.qrId || "",
    Name: r.name || "",
    Company: r.company || "",
    Phone: r.phoneE164 || "",
    Interest: r.interest || "",
    Idea: r.thoughtsOnStc || "",
    Submitted: r.submittedAt
      ? formatToDisplayTimezone(r.submittedAt, "YYYY-MM-DD HH:mm")
      : "",
  };
}
function csvEscape(val) {
  const s = (val ?? "").toString();
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function buildCSV(data) {
  const rows = data.map(mapRow);
  const headers = Object.keys(rows[0] || {});
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(",")),
  ];
  // BOM for Excel + RTL safety
  return "\ufeff" + lines.join("\n");
}
function saveCSV(filename, csvString) {
  try {
    if (typeof downloadCSV === "function")
      return downloadCSV(filename, csvString);
  } catch (_) {}
  // Fallback
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Button handlers ---
function doExport(data, label) {
  if (!data || !data.length) return;
  let csv;
  try {
    // Prefer your util if it exists and supports plain arrays
    if (typeof toCSV === "function") {
      csv = toCSV(data.map(mapRow));
    }
  } catch (_) {}
  if (!csv) csv = buildCSV(data);

  const fname = `${label}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
  saveCSV(fname, csv);
}

function exportAll() {
  doExport(sortedRows.value, "surveys_all_filtered");
}

function exportPage() {
  doExport(paginatedRows.value, `surveys_page_${page.value}`);
}
</script>
