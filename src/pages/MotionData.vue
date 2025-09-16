<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h2 class="text-xl font-semibold">Motion Data</h2>
      <div class="flex items-center gap-3">
        <button
          @click="exportAll"
          class="h-9 px-3 rounded bg-indigo-600 text-white hover:bg-indigo-500"
        >
          Export CSV (All Filtered)
        </button>
        <button
          @click="exportPage"
          class="h-9 px-3 rounded border border-slate-700 hover:bg-slate-800"
        >
          Export CSV (Current Page)
        </button>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <input
        v-model.trim="searchTerm"
        type="text"
        placeholder="Quick search (name, phone, score)"
        class="border border-slate-700 bg-slate-800 text-slate-100 rounded px-3 py-2 w-80"
      />
    </div>

    <div
      class="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto"
    >
      <table class="min-w-full text-sm">
        <thead class="bg-slate-800 text-slate-300">
          <tr>
            <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('name')"
            >
              Name <SortIcon :active="sortKey === 'name'" :dir="sortDir" />
            </th>
            <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('phoneNumber')"
            >
              Phone <SortIcon :active="sortKey === 'phoneNumber'" :dir="sortDir" />
            </th>
            <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('score')"
            >
              Score <SortIcon :active="sortKey === 'score'" :dir="sortDir" />
            </th>
            <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('registeredTimestamp')"
            >
              Registered
              <SortIcon :active="sortKey === 'registeredTimestamp'" :dir="sortDir" />
            </th>
            <th
              class="px-3 py-2 text-left cursor-pointer"
              @click="setSort('gameEndTimestamp')"
            >
              Game End
              <SortIcon :active="sortKey === 'gameEndTimestamp'" :dir="sortDir" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="m in paginatedRows"
            :key="m.registeredTimestamp + '_' + m.name"
            class="border-t border-slate-800"
          >
            <td class="px-3 py-2">{{ m.name }}</td>
            <td class="px-3 py-2">{{ m.phoneNumber }}</td>
            <td class="px-3 py-2">{{ m.score }}</td>
            <td class="px-3 py-2">{{ formatDate(m.registeredTimestamp) }}</td>
            <td class="px-3 py-2">{{ formatDate(m.gameEndTimestamp) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      :page="page"
      :total-pages="totalPages"
      :page-size="pageSize"
      @update:page="(val) => (page = val)"
      @update:pageSize="(val) => (pageSize = val)"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Pagination from "../components/Pagination.vue";
import { useDataTable } from "../composables/useDataTable";
import { toCSV, downloadCSV } from "../utils/csv";
import { formatToDisplayTimezone } from "../utils/timezone";
import dayjs from "dayjs";

const SortIcon = {
  props: { active: Boolean, dir: String },
  template: `<span v-if="active" class="ml-1 text-slate-400">{{ dir==='asc' ? '▲' : '▼' }}</span>`,
};

const rows = ref([]);

const {
  searchTerm,
  sortKey,
  sortDir,
  page: pageRef,
  pageSize: pageSizeRef,
  sortedRows,
  paginatedRows,
  totalPages,
  setSort,
  resetPage,
} = useDataTable(rows, {
  searchKeys: ["name", "phoneNumber", "score"],
  dateKeys: ["registeredTimestamp", "gameEndTimestamp"],
  defaultSort: { key: "registeredTimestamp", dir: "desc" },
  initialPageSize: 20,
});
let page = pageRef;
let pageSize = pageSizeRef;

function formatDate(dt) {
  // Motion data timestamps are already in UTC+3, so we can display them directly
  if (!dt) return "";
  
  try {
    // If it's already a proper ISO string, use the timezone utility
    if (typeof dt === 'string' && dt.includes('T')) {
      return formatToDisplayTimezone(dt, "YYYY-MM-DD HH:mm");
    }
    
    // If it's the original timestamp string format, try to parse it
    if (typeof dt === 'string' && dt.includes('PM') && dt.includes('/')) {
      const parsed = parseMotionTimestamp(dt);
      if (parsed) {
        return formatToDisplayTimezone(parsed, "YYYY-MM-DD HH:mm");
      }
      // If parsing failed, return the original string
      return dt;
    }
    
    // For parsed timestamps, format directly
    const formatted = dayjs(dt).format("YYYY-MM-DD HH:mm");
    return formatted === 'Invalid Date' ? "" : formatted;
  } catch (error) {
    console.error('Error formatting date:', dt, error);
    return dt || "";
  }
}

async function loadMotionData() {
  try {
    // Load the CSV data
    const response = await fetch('./src/data/MotionVM_15092025.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    
    // Parse CSV
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    console.log('CSV Headers:', headers);
    console.log('First few lines:', lines.slice(0, 5));
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        // Simple CSV parsing - split by comma and trim
        const values = lines[i].split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        // Convert timestamp strings to proper date format for sorting
        // Handle the typo in the CSV header ("Registed" instead of "Registered")
        if (row['Registed Timestamp']) {
          row.registeredTimestamp = parseMotionTimestamp(row['Registed Timestamp']);
          // Fallback to original string if parsing failed
          if (!row.registeredTimestamp) {
            row.registeredTimestamp = row['Registed Timestamp'];
          }
          console.log('Parsed registered timestamp:', row['Registed Timestamp'], '->', row.registeredTimestamp);
        }
        if (row['Game End Timestamp']) {
          row.gameEndTimestamp = parseMotionTimestamp(row['Game End Timestamp']);
          // Fallback to original string if parsing failed
          if (!row.gameEndTimestamp) {
            row.gameEndTimestamp = row['Game End Timestamp'];
          }
          console.log('Parsed game end timestamp:', row['Game End Timestamp'], '->', row.gameEndTimestamp);
        }
        
        // Map to consistent field names
        row.name = row.Name || '';
        row.phoneNumber = row.PhoneNumber || '';
        row.score = parseInt(row.Score) || 0;
        
        data.push(row);
      }
    }
    
    console.log('Loaded motion data:', data.slice(0, 3)); // Log first 3 rows
    rows.value = data;
    resetPage();
  } catch (error) {
    console.error('Error loading motion data:', error);
    rows.value = [];
  }
}

function parseMotionTimestamp(timestampStr) {
  // Parse format like "03:38:29 PM 13/09/2025"
  if (!timestampStr || !timestampStr.trim()) return null;
  
  try {
    // Split the timestamp by spaces
    const parts = timestampStr.trim().split(' ');
    if (parts.length >= 4) {
      const timePart = parts.slice(0, 3).join(' '); // "03:38:29 PM"
      const datePart = parts[3]; // "13/09/2025"
      
      // Parse date (DD/MM/YYYY)
      const dateParts = datePart.split('/');
      if (dateParts.length === 3) {
        const day = dateParts[0].padStart(2, '0');
        const month = dateParts[1].padStart(2, '0');
        const year = dateParts[2];
        
        // Create a proper date string in ISO format
        const dateStr = `${year}-${month}-${day} ${timePart}`;
        
        // Parse using dayjs for better compatibility
        const parsedDate = dayjs(dateStr, 'YYYY-MM-DD hh:mm:ss A');
        if (parsedDate.isValid()) {
          return parsedDate.toISOString();
        }
      }
    }
  } catch (error) {
    console.error('Error parsing timestamp:', timestampStr, error);
  }
  
  return null;
}

// CSV export functions
function mapRow(r) {
  return {
    Name: r.name || "",
    Phone: r.phoneNumber || "",
    Score: r.score || 0,
    "Registered Timestamp": r.registeredTimestamp
      ? formatDate(r.registeredTimestamp)
      : "",
    "Game End Timestamp": r.gameEndTimestamp
      ? formatDate(r.gameEndTimestamp)
      : "",
  };
}

function buildCSV(data) {
  const rows = data.map(mapRow);
  const headers = Object.keys(rows[0] || {});
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => csvEscape(row[h])).join(",")),
  ];
  return "\ufeff" + lines.join("\n");
}

function csvEscape(val) {
  const s = (val ?? "").toString();
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function saveCSV(filename, csvString) {
  try {
    if (typeof downloadCSV === "function")
      return downloadCSV(filename, csvString);
  } catch (_) {}
  // Fallback
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function doExport(data, label) {
  if (!data || !data.length) return;
  let csv;
  try {
    if (typeof toCSV === "function") {
      csv = toCSV(data.map(mapRow));
    }
  } catch (_) {}
  if (!csv) csv = buildCSV(data);

  const fname = `${label}_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`;
  saveCSV(fname, csv);
}

function exportAll() {
  doExport(sortedRows.value, "motion_data_all_filtered");
}

function exportPage() {
  doExport(paginatedRows.value, `motion_data_page_${page.value}`);
}

onMounted(() => {
  loadMotionData();
});
</script>
