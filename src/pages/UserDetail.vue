<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold text-slate-100">User Detail</h2>
      <RouterLink to="/users" class="text-sm text-indigo-400 hover:underline">
        Back to Users
      </RouterLink>
    </div>

    <!-- User card -->
    <div
      v-if="user"
      class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-slate-100"
    >
      <div><span class="text-slate-400">sysId:</span> {{ user.sysId }}</div>
      <div><span class="text-slate-400">Name:</span> {{ user.name }}</div>
      <div><span class="text-slate-400">Company:</span> {{ user.company }}</div>
      <div>
        <span class="text-slate-400">Phone:</span> {{ user.phoneNumber }}
      </div>
      <div><span class="text-slate-400">QR:</span> {{ user.qrId }}</div>
      <div><span class="text-slate-400">Created:</span> {{ formatDate(user.createdAt) }}</div>
    </div>

    <!-- Survey Data -->
    <div v-if="user && surveyData.length > 0" class="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 class="text-lg font-semibold text-slate-100 mb-4">Survey Data</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-800 text-slate-300">
            <tr>
              <th class="px-3 py-2 text-left">Survey ID</th>
              <th class="px-3 py-2 text-left">Interest</th>
              <th class="px-3 py-2 text-left">Submitted</th>
              <th class="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="survey in surveyData" :key="survey.surveyId" class="border-t border-slate-800">
              <td class="px-3 py-2">{{ survey.surveyId }}</td>
              <td class="px-3 py-2">{{ survey.interest }}</td>
              <td class="px-3 py-2">{{ formatDate(survey.submittedAt) }}</td>
              <td class="px-3 py-2">
                <RouterLink
                  :to="{ name: 'survey-detail', params: { id: survey.surveyId } }"
                  class="text-indigo-400 hover:underline"
                >
                  View Details
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quiz Data -->
    <div v-if="user && quizData.length > 0" class="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 class="text-lg font-semibold text-slate-100 mb-4">Quiz Data</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-slate-800 text-slate-300">
            <tr>
              <th class="px-3 py-2 text-left">Correct Answers</th>
              <th class="px-3 py-2 text-left">Submitted</th>
              <th class="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="quiz in quizData" :key="quiz.qrId + '_' + quiz.submittedAt" class="border-t border-slate-800">
              <td class="px-3 py-2">{{ quiz.correctAnswers }}</td>
              <td class="px-3 py-2">{{ formatDate(quiz.submittedAt) }}</td>
              <td class="px-3 py-2">
                <RouterLink
                  :to="{ name: 'quiz-detail', params: { id: quiz.qrId + '|' + quiz.submittedAt } }"
                  class="text-indigo-400 hover:underline"
                >
                  View Details
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="text-slate-300">
      No user loaded in this session. Go back to
      <RouterLink to="/users" class="text-indigo-400 hover:underline"
        >Users</RouterLink
      >.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useSelectionStore } from "../store/selection";
import { formatToDisplayTimezone } from "../utils/timezone";
import { apiGet } from "../api/client";

const route = useRoute();
const selection = useSelectionStore();
const user = selection.getUser(route.params.sysId);
const surveyData = ref([]);
const quizData = ref([]);

function formatDate(dt) {
  return formatToDisplayTimezone(dt, "YYYY-MM-DD HH:mm");
}

async function loadUserData() {
  if (!user) return;
  
  try {
    // Load survey data for this user using the by-qr endpoint
    const surveyRes = await apiGet(`/api/surveys/by-qr/${user.qrId}`);
    surveyData.value = surveyRes.data || [];

    // Load quiz data for this user using the by-qr endpoint
    const quizRes = await apiGet(`/api/quiz/by-qr/${user.qrId}`);
    quizData.value = quizRes.data || [];
  } catch (error) {
    console.error("Error loading user data:", error);
    surveyData.value = [];
    quizData.value = [];
  }
}

onMounted(() => {
  loadUserData();
});
</script>

<style scoped>
/* no extra styles needed; uses your dark theme classes */
</style>
