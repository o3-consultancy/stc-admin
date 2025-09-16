<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Quiz Detail</h2>
      <RouterLink to="/quiz" class="text-sm text-indigo-400 hover:underline"
        >Back to Quiz</RouterLink
      >
    </div>

    <div
      v-if="quiz"
      class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2"
    >
      <div><span class="text-slate-400">QR:</span> {{ quiz.qrId }}</div>
      <div><span class="text-slate-400">sysId:</span> {{ quiz.sysId }}</div>
      <div>
        <span class="text-slate-400">Correct Answers:</span>
        {{ quiz.correctAnswers }}
      </div>
      <div>
        <span class="text-slate-400">Submitted:</span> {{ formatDate(quiz.submittedAt) }}
      </div>
    </div>

    <div v-else class="text-slate-300">
      No quiz loaded in this session. Go back to
      <RouterLink to="/quiz" class="text-indigo-400 hover:underline"
        >Quiz</RouterLink
      >.
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useSelectionStore } from "../store/selection";
import { formatToDisplayTimezone } from "../utils/timezone";

const route = useRoute();
const selection = useSelectionStore();
const quiz = selection.getQuizByIdParam(route.params.id);

function formatDate(dt) {
  return formatToDisplayTimezone(dt, "YYYY-MM-DD HH:mm");
}
</script>
