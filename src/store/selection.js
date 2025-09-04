import { defineStore } from 'pinia'

function quizKey(q) {
    return `${q.qrId || ''}|${q.submittedAt || ''}`
}

export const useSelectionStore = defineStore('selection', {
    state: () => ({
        usersBySysId: new Map(),       // sysId -> user
        surveysById: new Map(),        // surveyId -> survey
        quizByKey: new Map()           // `${qrId}|${submittedAt}` -> quiz
    }),
    actions: {
        setUser(u) {
            if (u?.sysId) this.usersBySysId.set(u.sysId, u)
        },
        getUser(sysId) {
            return this.usersBySysId.get(sysId)
        },

        setSurvey(s) {
            if (s?.surveyId) this.surveysById.set(s.surveyId, s)
        },
        getSurvey(id) {
            return this.surveysById.get(id)
        },

        setQuiz(q) {
            const k = quizKey(q)
            this.quizByKey.set(k, q)
        },
        getQuizByIdParam(idParam) {
            // idParam is whatever we put in route param; for us it's `${qrId}|${submittedAt}`
            return this.quizByKey.get(idParam)
        },

        // helpers for list pages
        primeFromArray(arr) {
            for (const u of arr || []) {
                if (u?.sysId && u?.qrId && u?.name !== undefined) this.setUser(u)
                if (u?.surveyId) this.setSurvey(u)
                if (u?.qrId && u?.submittedAt && u?.correctAnswers !== undefined) this.setQuiz(u)
            }
        }
    }
})
