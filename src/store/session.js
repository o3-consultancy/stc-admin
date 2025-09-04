import { defineStore } from 'pinia'
import { apiPost } from '../api/client'

export const useSessionStore = defineStore('session', {
    state: () => ({
        isAuthed: false,
        key: null,           // admin key (stored locally; used only for revalidation)
        initialized: false
    }),
    actions: {
        async bootstrap() {
            const stored = localStorage.getItem('dashboardKey')
            if (stored) {
                this.key = stored
                // Revalidate once on boot (in case key was deleted)
                const ok = await this.validateKey(stored)
                this.isAuthed = ok
            } else {
                this.isAuthed = false
            }
            this.initialized = true
        },
        async loginWithKey(key) {
            const ok = await this.validateKey(key)
            if (ok) {
                this.isAuthed = true
                this.key = key
                localStorage.setItem('dashboardKey', key)
                return true
            }
            return false
        },
        async validateKey(key) {
            try {
                const res = await apiPost('/api/admin/keys/validate', { key })
                return res?.status === 'success' && res?.data?.valid === true
            } catch {
                return false
            }
        },
        logout() {
            this.isAuthed = false
            this.key = null
            localStorage.removeItem('dashboardKey')
        }
    }
})
