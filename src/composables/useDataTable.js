import { ref, computed, watch } from 'vue'

/**
 * Reusable list logic: search, sorting, pagination.
 * @param {Ref<Array>} rowsRef - source rows (array of objects)
 * @param {Object} opts
 *   - searchKeys: array of keys to search
 *   - dateKeys: array of keys that should be compared as dates
 *   - defaultSort: { key, dir: 'asc'|'desc' }
 *   - initialPageSize: number (default 20)
 */
export function useDataTable(rowsRef, opts = {}) {
    const {
        searchKeys = [],
        dateKeys = [],
        defaultSort = null,
        initialPageSize = 20
    } = opts

    const searchTerm = ref('')
    const sortKey = ref(defaultSort?.key || '')
    const sortDir = ref(defaultSort?.dir || 'desc') // 'asc' | 'desc'
    const page = ref(1)
    const pageSize = ref(initialPageSize)

    // Reset to page 1 whenever inputs change materially
    watch([rowsRef, searchTerm, sortKey, sortDir, pageSize], () => { page.value = 1 })

    const filteredRows = computed(() => {
        const term = (searchTerm.value || '').trim().toLowerCase()
        const rows = rowsRef.value || []
        if (!term) return rows

        return rows.filter(row => {
            if (!searchKeys.length) {
                return JSON.stringify(row).toLowerCase().includes(term)
            }
            return searchKeys.some(k => {
                const v = valueAt(row, k)
                return (v !== null && v !== undefined && String(v).toLowerCase().includes(term))
            })
        })
    })

    const sortedRows = computed(() => {
        const rows = filteredRows.value.slice()
        if (!sortKey.value) return rows

        const key = sortKey.value
        const dir = sortDir.value === 'asc' ? 1 : -1
        const isDate = dateKeys.includes(key)

        rows.sort((a, b) => {
            const av = valueAt(a, key)
            const bv = valueAt(b, key)

            // nulls last
            if (av == null && bv == null) return 0
            if (av == null) return 1
            if (bv == null) return -1

            if (isDate) {
                const at = Date.parse(av)
                const bt = Date.parse(bv)
                if (isNaN(at) && isNaN(bt)) return 0
                if (isNaN(at)) return 1
                if (isNaN(bt)) return -1
                return (at - bt) * dir
            }

            // numeric compare if both look numeric
            const an = Number(av), bn = Number(bv)
            const bothNumeric = !isNaN(an) && !isNaN(bn) && av !== '' && bv !== ''
            if (bothNumeric) return (an - bn) * dir

            // string compare
            return String(av).localeCompare(String(bv)) * dir
        })
        return rows
    })

    const total = computed(() => sortedRows.value.length)
    const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
    const paginatedRows = computed(() => {
        const start = (page.value - 1) * pageSize.value
        return sortedRows.value.slice(start, start + pageSize.value)
    })

    function setSort(key) {
        if (sortKey.value === key) {
            sortDir.value = (sortDir.value === 'asc' ? 'desc' : 'asc')
        } else {
            sortKey.value = key
            sortDir.value = 'asc'
        }
    }

    function resetPage() { page.value = 1 }

    return {
        // state
        searchTerm, sortKey, sortDir, page, pageSize,
        // data
        filteredRows, sortedRows, paginatedRows, total, totalPages,
        // actions
        setSort, resetPage
    }
}

function valueAt(obj, key) {
    const parts = key.split('.')
    let v = obj
    for (const p of parts) v = v?.[p]
    return v
}
