<<template>
  <div class="p-6 space-y-6">
    <!-- Header / Controls -->
    <div class="flex items-center justify-between flex-wrap gap-4">
      <h2 class="text-xl font-semibold">Raffle Draw</h2>
      <div class="flex items-center gap-3">
        <label class="text-sm text-slate-500">Date</label>
        <input
          type="date"
          v-model="selectedDate"
          class="border border-slate-300 bg-white text-slate-900 rounded px-3 py-2 h-9 placeholder-slate-400"
        />
        <button
          @click="load"
          class="h-9 px-3 rounded bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50"
          :disabled="loading"
          title="Load eligible participants for the selected date"
        >
          Load
        </button>
        <button
          @click="pickWinner"
          class="h-9 px-3 rounded bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50"
          :disabled="eligible.length === 0 || loading"
          title="Randomly select one winner from the eligible list"
        >
          Pick Winner
        </button>
      </div>
    </div>

    <!-- Error -->
    <div
      v-if="error"
      class="rounded-lg border border-red-200 bg-red-50 text-red-700 p-3 text-sm"
    >
      {{ error }}
    </div>

    <!-- Winner Card (dark) -->
    <div
      v-if="winner"
      class="rounded-xl border border-slate-700 bg-black text-white p-4"
    >
      <div class="font-semibold mb-2">
        🎉 Winner for {{ selectedDate }}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm">
        <div><span class="font-medium">QR ID:</span> {{ getQrId(winner) }}</div>
        <div><span class="font-medium">Name:</span> {{ getName(winner) }}</div>
        <div>
          <span class="font-medium">Company:</span> {{ getCompany(winner) }}
        </div>
        <div>
          <span class="font-medium">Phone:</span> {{ getPhone(winner) }}
        </div>
        <div class="md:col-span-5">
          <span class="font-medium">Thoughts on STC:</span>
          {{ getThoughts(winner) }}
        </div>
      </div>
    </div>

    <!-- Summary / Count -->
    <p class="text-sm text-slate-500">
      {{ eligible.length }} eligible
      {{ eligible.length === 1 ? "participant" : "participants" }} for
      {{ selectedDate }}
    </p>

    <!-- Table of eligible participants (dark) -->
    <div class="overflow-x-auto rounded border border-slate-700 bg-black">
      <table class="min-w-full text-sm text-white">
        <thead class="bg-slate-900 text-slate-200">
          <tr>
            <th class="text-left font-medium px-3 py-2">QR ID</th>
            <th class="text-left font-medium px-3 py-2">Name</th>
            <th class="text-left font-medium px-3 py-2">Company</th>
            <th class="text-left font-medium px-3 py-2">Phone</th>
            <th class="text-left font-medium px-3 py-2">Thoughts on STC</th>
          </tr>
        </thead>
        <tbody class="text-white">
          <tr
            v-for="item in eligible"
            :key="item.id || item.qrId || item.sysId || item.surveyId"
            class="odd:bg-black even:bg-slate-900 align-top"
          >
            <td class="px-3 py-2 whitespace-nowrap">{{ getQrId(item) }}</td>
            <td class="px-3 py-2 whitespace-nowrap">{{ getName(item) }}</td>
            <td class="px-3 py-2 whitespace-nowrap">{{ getCompany(item) }}</td>
            <td class="px-3 py-2 whitespace-nowrap">{{ getPhone(item) }}</td>
            <td
              class="px-3 py-2 max-w-[56ch] truncate"
              :title="getThoughts(item)"
            >
              {{ getThoughts(item) }}
            </td>
          </tr>
          <tr v-if="!eligible.length && !loading">
            <td colspan="5" class="px-3 py-8 text-center text-slate-300">
              No eligible participants for {{ selectedDate }}.
            </td>
          </tr>
          <tr v-if="loading">
            <td colspan="5" class="px-3 py-8 text-center text-slate-300">
              Loading…
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from "vue";
import { apiGet } from "../api/client";

// --- Date helpers ---
function pad(n) {
  return String(n).padStart(2, "0");
}
function todayLocalYYYYMMDD() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function normalizeDateString(input) {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input).slice(0, 10);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// --- State ---
const selectedDate = ref(todayLocalYYYYMMDD());
const allRows = ref([]);
const loading = ref(false);
const error = ref("");
const winner = ref(null);

// --- Load from API (single-day window) ---
async function load() {
  try {
    error.value = "";
    winner.value = null;
    loading.value = true;

    if (!selectedDate.value) return;

    const res = await apiGet("/api/surveys/list", {
      params: {
        startDate: selectedDate.value,
        endDate: selectedDate.value,
      },
    });

    const data = Array.isArray(res?.data) ? res.data : [];
    allRows.value = data.map((r) => ({
      ...r,
      surveyId: r.surveyId || "",
    }));
  } catch (e) {
    console.error("Failed to load surveys for raffle:", e);
    error.value = "Failed to load surveys. Please try again.";
  } finally {
    loading.value = false;
  }
}

// --- Eligible list for the selected day ---
const eligible = computed(() => {
  const list = Array.isArray(allRows.value) ? allRows.value : [];
  const sel = selectedDate.value;
  return list.filter((item) => {
    const interestRaw = item?.interest ?? "";
    const interestStr = String(interestRaw).trim().toLowerCase();
    const isInterestMatch = interestStr === "share your idea";
    const dateStr = normalizeDateString(item?.submittedAt);
    const eligible = isInterestMatch && dateStr === sel;
    console.log(
      `Checking item ${
        item?.surveyId || item?.id || ""
      }: interest="${interestRaw}" date=${dateStr} eligible=${eligible}`
    );
    return eligible;
  });
});

// --- Winner selection (uniform random) ---
function pickWinner() {
  const arr = eligible.value;
  if (!arr.length) {
    winner.value = null;
    return;
  }
  const idx = Math.floor(Math.random() * arr.length);
  winner.value = arr[idx];
}

// --- Field mappers (robust to naming variations) ---
function getQrId(i) {
  return i?.qrId ?? i?.qr_id ?? i?.qr ?? i?.sysId ?? "";
}
function getName(i) {
  if (i?.name) return i.name;
  const joined = [i?.firstName, i?.lastName].filter(Boolean).join(" ");
  return joined || i?.fullname || "";
}
function getCompany(i) {
  return i?.company ?? i?.companyName ?? "";
}
function getPhone(i) {
  return i?.phone ?? i?.phoneNumber ?? i?.mobile ?? "";
}
function getThoughts(i) {
  return (
    i?.answers.thoughtsOnStc ??
    i?.thoughtsOnStc ??
    i?.thoughts_on_stc ??
    i?.thoughts ??
    ""
  );
}

onMounted(load);
</script>

<!-- Uses Tailwind utility classes; no extra styles required. -->
