<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Survey Detail</h2>
      <RouterLink to="/surveys" class="text-sm text-indigo-400 hover:underline"
        >Back to Surveys</RouterLink
      >
    </div>

    <div
      v-if="survey"
      class="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2"
    >
      <div>
        <span class="text-slate-400">Survey ID:</span> {{ survey.surveyId }}
      </div>
      <div><span class="text-slate-400">QR:</span> {{ survey.qrId }}</div>
      <div><span class="text-slate-400">sysId:</span> {{ survey.sysId }}</div>
      <div><span class="text-slate-400">Name:</span> {{ survey.name }}</div>
      <div><span class="text-slate-400">Email:</span> {{ survey.email }}</div>
      <div>
        <span class="text-slate-400">Company:</span> {{ survey.company }}
      </div>
      <div>
        <span class="text-slate-400">Submitted:</span> {{ survey.submittedAt }}
      </div>
    </div>

    <div
      v-if="survey"
      class="bg-slate-900 border border-slate-800 rounded-xl p-4"
    >
      <h3 class="font-semibold mb-2">Answers</h3>
      <pre class="text-sm bg-slate-950 p-3 rounded overflow-auto">{{
        survey.answers
      }}</pre>
    </div>

    <div v-else class="text-slate-300">
      No survey loaded in this session. Go back to
      <RouterLink to="/surveys" class="text-indigo-400 hover:underline"
        >Surveys</RouterLink
      >.
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { useSelectionStore } from "../store/selection";

const route = useRoute();
const selection = useSelectionStore();
const survey = selection.getSurvey(route.params.id);
</script>
