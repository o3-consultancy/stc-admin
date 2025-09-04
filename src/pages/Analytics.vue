<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h2 class="text-xl font-semibold">Analytics</h2>
      <DateRangePicker
        :startDate="startDate"
        :endDate="endDate"
        @update="setDates"
      />
    </div>

    <!-- Counters -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="text-sm text-slate-300">Total Users</div>
        <div class="text-2xl font-semibold text-slate-100">
          {{ overview.totals.users ?? "—" }}
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="text-sm text-slate-300">Total Surveys</div>
        <div class="text-2xl font-semibold text-slate-100">
          {{ overview.totals.surveys ?? "—" }}
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="text-sm text-slate-300">Surveys (Last 7 days)</div>
        <div class="text-2xl font-semibold text-slate-100">
          {{ overview.totals.surveysLast7Days ?? "—" }}
        </div>
      </div>
    </div>

    <!-- Average -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div class="text-sm text-slate-300 mb-2">Overall Avg Numeric Score</div>
      <div class="text-2xl font-semibold text-slate-100">
        {{ overview.avgNumericScore ?? "—" }}
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="text-sm text-slate-300 mb-2">
          Top Companies (by survey count)
        </div>
        <BarChart
          v-if="companyChartData"
          :chart-data="companyChartData"
          :chart-options="barOpts"
        />
        <div v-else class="text-slate-400 text-sm">No data</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="text-sm text-slate-300 mb-2">
          Average Scores (by question)
        </div>
        <LineChart
          v-if="avgChartData"
          :chart-data="avgChartData"
          :chart-options="lineOpts"
        />
        <div v-else class="text-slate-400 text-sm">No data</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { apiGet } from "../api/client";
import DateRangePicker from "../components/DateRangePicker.vue";
import { BarChart, LineChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

// date filters (UI only for now; back-end analytics endpoints are global)
const startDate = ref("");
const endDate = ref("");
function setDates({ startDate: s, endDate: e }) {
  startDate.value = s || "";
  endDate.value = e || "";
  // if you add backend filters later, pass these in the API calls below
}

const overview = ref({
  totals: { users: null, surveys: null, surveysLast7Days: null },
  avgNumericScore: null,
});
const avgScores = ref([]); // [{questionKey, avg, count}]
const companyCounts = ref([]); // [{company, surveyCount, uniqueUsers, lastSubmittedAt}]

// Build datasets with visible colors on dark
const companyChartData = computed(() => {
  if (!companyCounts.value?.length) return null;
  return {
    labels: companyCounts.value.map((x) => x.company),
    datasets: [
      {
        label: "Surveys",
        data: companyCounts.value.map((x) => x.surveyCount),
        backgroundColor: "rgba(99,102,241,0.5)", // indigo-500 @ 50%
        borderColor: "#6366f1",
        borderWidth: 1,
      },
    ],
  };
});

const avgChartData = computed(() => {
  if (!avgScores.value?.length) return null;
  return {
    labels: avgScores.value.map((x) => x.questionKey),
    datasets: [
      {
        label: "Average",
        data: avgScores.value.map((x) => x.avg),
        fill: false,
        borderColor: "#22d3ee", // cyan-400
        backgroundColor: "rgba(34,211,238,0.3)",
        tension: 0.25,
        pointRadius: 3,
      },
    ],
  };
});

// Dark chart options
const axisColor = "#94a3b8"; // slate-400
const gridColor = "rgba(148,163,184,0.15)"; // subtle grid
const labelColor = "#e2e8f0"; // slate-200

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: labelColor } },
    title: { display: false },
  },
  scales: {
    x: {
      ticks: { color: axisColor },
      grid: { color: gridColor },
    },
    y: {
      ticks: { color: axisColor },
      grid: { color: gridColor },
    },
  },
};
const barOpts = baseOpts;
const lineOpts = baseOpts;

async function load() {
  const ov = await apiGet("/api/analytics/overview");
  overview.value = ov.data;

  const cc = await apiGet("/api/analytics/company-counts", {
    params: { limit: 10 },
  });
  companyCounts.value = cc.data;

  const av = await apiGet("/api/analytics/average-scores");
  avgScores.value = av.data;
}

onMounted(load);
</script>

<style scoped>
/* Give charts some height */
div:has(> canvas) {
  height: 320px;
}
</style>
