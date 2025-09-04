<template>
  <div class="min-h-screen grid place-items-center bg-slate-950 text-slate-100">
    <div
      class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm"
    >
      <div class="flex items-center gap-3 mb-4">
        <img
          src="/src/docs/logo.png"
          alt="Logo"
          class="h-8"
          onerror="this.style.display='none'"
        />
        <h1 class="text-lg font-semibold">Admin Login</h1>
      </div>

      <p class="text-sm text-slate-300 mb-4">
        Enter your dashboard access key.
      </p>

      <form @submit.prevent="submit">
        <input
          type="password"
          v-model.trim="key"
          placeholder="Admin key"
          class="w-full border border-slate-700 bg-slate-800 text-slate-100 rounded px-3 py-2 mb-3 placeholder-slate-400"
        />
        <button
          :disabled="loading"
          class="w-full h-10 rounded bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {{ loading ? "Validating..." : "Login" }}
        </button>
      </form>

      <p v-if="error" class="text-sm text-red-400 mt-3">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useSessionStore } from "../store/session";
import { useRouter } from "vue-router";

const key = ref("");
const loading = ref(false);
const error = ref("");
const session = useSessionStore();
const router = useRouter();

async function submit() {
  error.value = "";
  loading.value = true;
  const ok = await session.loginWithKey(key.value);
  loading.value = false;
  if (ok) router.push({ name: "analytics" });
  else error.value = "Invalid key";
}
</script>
