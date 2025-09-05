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
import { useRoute } from "vue-router";
import { useSelectionStore } from "../store/selection";

const route = useRoute();
const selection = useSelectionStore();
const user = selection.getUser(route.params.sysId);
</script>

<style scoped>
/* no extra styles needed; uses your dark theme classes */
</style>
