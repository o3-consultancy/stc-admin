const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || ''
const PUBLIC_API_KEY = import.meta.env.VITE_PUBLIC_API_KEY || '' // for local dev only

async function request(method, path, { params, body } = {}) {
    const url = new URL(API_BASE + path)
    if (params) {
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
        })
    }

    const headers = { 'Content-Type': 'application/json' }
    // In production, use an nginx reverse proxy to inject x-api-key.
    // For local dev only, you can set VITE_PUBLIC_API_KEY to test.
    if (PUBLIC_API_KEY) headers['x-api-key'] = PUBLIC_API_KEY

    const res = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'omit'
    })
    const text = await res.text()
    let json
    try { json = JSON.parse(text) } catch { json = { status: 'error', message: text || res.statusText } }
    if (!res.ok) {
        throw new Error(json?.message || `HTTP ${res.status}`)
    }
    return json
}

export const apiGet = (path, opts) => request('GET', path, opts)
export const apiPost = (path, body) => request('POST', path, { body })
