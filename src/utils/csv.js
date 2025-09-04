export function toCSV(rows, headersMap) {
    // headersMap: [{ key:'sysId', label:'System ID' }, ...]
    const header = headersMap.map(h => csvEscape(h.label)).join(',')
    const lines = rows.map(row =>
        headersMap.map(h => csvEscape(valueAt(row, h.key))).join(',')
    )
    return [header, ...lines].join('\n')
}

function valueAt(obj, key) {
    const parts = key.split('.')
    let v = obj
    for (const p of parts) v = v?.[p]
    return v ?? ''
}

function csvEscape(val) {
    if (val === null || val === undefined) return ''
    const s = String(val)
    if (/[",\n]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`
    }
    return s
}

export function downloadCSV(filename, csvString) {
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
