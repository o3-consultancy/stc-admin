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
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="text-sm text-slate-300">Total Users</div>
        <div class="text-2xl font-semibold text-slate-100">
          {{ overview.totals.users ?? "—" }}
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="text-sm text-slate-300">Total Quiz</div>
        <div class="text-2xl font-semibold text-slate-100">
          {{ overview.totals.quiz ?? "—" }}
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="text-sm text-slate-300">Eligible for Raffle</div>
        <div class="text-2xl font-semibold text-slate-100">
          {{ overview.totals.raffleEligible ?? "—" }}
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
          Interest Distribution
        </div>
        <DoughnutChart
          v-if="interestChartData"
          :chart-data="interestChartData"
          :chart-options="doughnutOpts"
        />
        <div v-else class="text-slate-400 text-sm">No data</div>
      </div>
    </div>

    <!-- Additional Analytics -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="text-sm text-slate-300 mb-2">
          Language Distribution
        </div>
        <DoughnutChart
          v-if="languageChartData"
          :chart-data="languageChartData"
          :chart-options="doughnutOpts"
        />
        <div v-else class="text-slate-400 text-sm">No data</div>
      </div>
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div class="text-sm text-slate-300 mb-2">
          Hourly Submission Pattern
        </div>
        <LineChart
          v-if="hourlyChartData"
          :chart-data="hourlyChartData"
          :chart-options="lineOpts"
        />
        <div v-else class="text-slate-400 text-sm">No data</div>
      </div>
    </div>

    <!-- Recent Submissions -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div class="text-sm text-slate-300 mb-4">Recent Survey Submissions</div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-800 text-slate-300">
            <tr>
              <th class="px-3 py-2 text-left">Name</th>
              <th class="px-3 py-2 text-left">Company</th>
              <th class="px-3 py-2 text-left">Interest</th>
              <th class="px-3 py-2 text-left">Language</th>
              <th class="px-3 py-2 text-left">Submitted</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="submission in recentSubmissions" :key="submission.surveyId" class="border-t border-slate-800">
              <td class="px-3 py-2">{{ submission.name }}</td>
              <td class="px-3 py-2">{{ submission.company || '—' }}</td>
              <td class="px-3 py-2">{{ submission.interest }}</td>
              <td class="px-3 py-2">{{ submission.answers?.lang || '—' }}</td>
              <td class="px-3 py-2">{{ formatDate(submission.submittedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { apiGet } from "../api/client";
import DateRangePicker from "../components/DateRangePicker.vue";
import { BarChart, LineChart, DoughnutChart } from "vue-chart-3";
import { Chart, registerables } from "chart.js";
import { formatToDisplayTimezone, getCurrentDateInDisplayTimezone, convertDateForAPI } from "../utils/timezone";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
Chart.register(...registerables);

// date filters with proper timezone handling
const startDate = ref("");
const endDate = ref("");
function setDates({ startDate: s, endDate: e }) {
  startDate.value = s || "";
  endDate.value = e || "";
  localStorage.setItem(
    "analyticsDates",
    JSON.stringify({ startDate: startDate.value, endDate: endDate.value })
  );
  load();
}

const overview = ref({
  totals: { 
    users: null, 
    quiz: null,
    raffleEligible: null 
  },
  avgNumericScore: null,
});
const avgScores = ref([]); // [{questionKey, avg, count}]
const companyCounts = ref([]); // [{company, surveyCount, uniqueUsers, lastSubmittedAt}]
const interestData = ref([]); // Interest distribution
const languageData = ref([]); // Language distribution
const hourlyData = ref([]); // Hourly submission patterns
const recentSubmissions = ref([]); // Recent survey submissions
const quizData = ref([]); // Quiz submissions for score calculation

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

const interestChartData = computed(() => {
  if (!interestData.value?.length) return null;
  return {
    labels: interestData.value.map((x) => x.interest),
    datasets: [
      {
        data: interestData.value.map((x) => x.count),
        backgroundColor: [
          "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#ef4444", "#84cc16"
        ],
        borderWidth: 0,
      },
    ],
  };
});

const languageChartData = computed(() => {
  if (!languageData.value?.length) return null;
  return {
    labels: languageData.value.map((x) => x.language),
    datasets: [
      {
        data: languageData.value.map((x) => x.count),
        backgroundColor: ["#6366f1", "#8b5cf6"],
        borderWidth: 0,
      },
    ],
  };
});

const hourlyChartData = computed(() => {
  if (!hourlyData.value?.length) return null;
  return {
    labels: hourlyData.value.map((x) => x.hour + ":00"),
    datasets: [
      {
        label: "Submissions",
        data: hourlyData.value.map((x) => x.count),
        fill: true,
        borderColor: "#10b981", // emerald-500
        backgroundColor: "rgba(16,185,129,0.3)",
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
const doughnutOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      labels: { color: labelColor },
      position: 'bottom'
    },
    title: { display: false },
  },
};

function formatDate(dt) {
  return formatToDisplayTimezone(dt, "YYYY-MM-DD HH:mm");
}

async function load() {
  try {
    // Prepare date parameters for API calls
    const dateParams = {};
    if (startDate.value) {
      dateParams.startDate = convertDateForAPI(startDate.value);
    }
    if (endDate.value) {
      dateParams.endDate = convertDateForAPI(endDate.value);
    }

    // Load data from respective APIs
    const [surveysRes, quizRes, usersRes, companyRes] = await Promise.all([
      apiGet("/api/surveys/list", { params: dateParams }),
      apiGet("/api/quiz/list", { params: dateParams }),
      apiGet("/api/users/list", { params: dateParams }),
      apiGet("/api/analytics/company-counts", { params: { limit: 10 } })
    ]);

    const surveyData = surveysRes.data || [];
    const quizData = quizRes.data || [];
    const userData = usersRes.data || [];
    companyCounts.value = companyRes.data || [];

    // Calculate totals
    overview.value.totals.users = userData.length;
    overview.value.totals.quiz = quizData.length;
    
    // Calculate raffle eligible (users with "Share Your Idea" interest)
    const raffleEligible = surveyData.filter(survey => {
      const interestRaw = survey?.interest ?? "";
      const interestStr = String(interestRaw).trim().toLowerCase();
      return interestStr === "share your idea";
    });
    overview.value.totals.raffleEligible = raffleEligible.length;

    // Calculate average numeric score from quiz data
    if (quizData.length > 0) {
      const totalScore = quizData.reduce((sum, quiz) => sum + (quiz.correctAnswers || 0), 0);
      overview.value.avgNumericScore = (totalScore / quizData.length).toFixed(2);
    } else {
      overview.value.avgNumericScore = "0.00";
    }

    // Store quiz data for processing
    quizData.value = quizData;

    // Process survey data for additional analytics
    processSurveyData(surveyData);
  } catch (error) {
    console.error("Error loading analytics data:", error);
  }
}

function processSurveyData(surveys) {
  // Interest distribution
  const interestCounts = {};
  const languageCounts = {};
  const hourlyCounts = {};
  
  surveys.forEach(survey => {
    // Interest distribution
    const interest = survey.interest || 'Unknown';
    interestCounts[interest] = (interestCounts[interest] || 0) + 1;
    
    // Language distribution
    const lang = survey.answers?.lang || 'Unknown';
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
    
    // Hourly distribution (convert to UTC+3 timezone)
    if (survey.submittedAt) {
      // Convert UTC timestamp to UTC+3 (Asia/Kuwait) timezone and get the hour
      const utcTime = dayjs.utc(survey.submittedAt);
      const localTime = utcTime.tz('Asia/Kuwait'); // UTC+3
      const hour = localTime.hour();
      hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
    }
  });

  // Convert to arrays for charts
  interestData.value = Object.entries(interestCounts)
    .map(([interest, count]) => ({ interest, count }))
    .sort((a, b) => b.count - a.count);

  languageData.value = Object.entries(languageCounts)
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);

  // Create hourly data (0-23 hours)
  const hourlyArray = [];
  for (let i = 0; i < 24; i++) {
    hourlyArray.push({ hour: i, count: hourlyCounts[i] || 0 });
  }
  hourlyData.value = hourlyArray;

  // Recent submissions (last 10)
  recentSubmissions.value = surveys
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 10);
}

onMounted(() => {
  // Load saved date filters
  const saved = localStorage.getItem("analyticsDates");
  if (saved) {
    const d = JSON.parse(saved || "{}");
    startDate.value = d.startDate || "";
    endDate.value = d.endDate || "";
  }
  if (!startDate.value) startDate.value = getCurrentDateInDisplayTimezone("YYYY-MM-DD");
  load();
});
</script>

<style scoped>
/* Give charts some height */
div:has(> canvas) {
  height: 320px;
}
</style>
