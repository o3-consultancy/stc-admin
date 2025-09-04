<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <div class="flex">
      <Sidebar class="hidden md:block" />
      <div class="flex-1 min-h-screen flex flex-col">
        <header
          class="h-14 px-4 flex items-center justify-between bg-slate-900 border-b border-slate-800"
        >
          <div class="font-semibold">STC Admin Dashboard</div>
          <div class="flex items-center gap-3">
            <RouterLink
              to="/analytics"
              class="text-sm text-slate-300 hover:text-white"
              >Analytics</RouterLink
            >
            <RouterLink
              to="/users"
              class="text-sm text-slate-300 hover:text-white"
              >Users</RouterLink
            >
            <RouterLink
              to="/surveys"
              class="text-sm text-slate-300 hover:text-white"
              >Surveys</RouterLink
            >
            <RouterLink
              to="/quiz"
              class="text-sm text-slate-300 hover:text-white"
              >Quiz</RouterLink
            >
            <button
              @click="logout"
              class="ml-4 text-sm px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Log out
            </button>
          </div>
        </header>
        <main class="p-4">
          <RouterView />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "./Sidebar.vue";
import { useSessionStore } from "../store/session";
import { useRouter } from "vue-router";

const session = useSessionStore();
const router = useRouter();

function logout() {
  session.logout();
  router.push({ name: "login" });
}
</script>
