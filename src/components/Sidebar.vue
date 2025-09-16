<template>
  <aside class="w-64 bg-slate-900 border-r border-slate-800 min-h-screen">
    <div class="p-4 border-b border-slate-800">
      <img
        src="/src/docs/logo.png"
        alt="Logo"
        class="h-8"
        onerror="this.style.display='none'"
      />
    </div>
    <nav class="p-2">
      <RouterLink
        to="/analytics"
        class="block px-3 py-2 rounded hover:bg-slate-800"
        >Analytics</RouterLink
      >
      <RouterLink to="/users" class="block px-3 py-2 rounded hover:bg-slate-800"
        >Users</RouterLink
      >
      <RouterLink
        to="/surveys"
        class="block px-3 py-2 rounded hover:bg-slate-800"
        >Surveys</RouterLink
      >
      <RouterLink to="/quiz" class="block px-3 py-2 rounded hover:bg-slate-800"
        >Quiz</RouterLink
      >
      <RouterLink to="/motion" class="block px-3 py-2 rounded hover:bg-slate-800"
        >Motion Data</RouterLink
      >
      <RouterLink
        to="/raffle"
        class="block px-3 py-2 rounded hover:bg-slate-800"
        >Raffle</RouterLink
      >
    </nav>
  </aside>
</template>

<script setup>
</script>
