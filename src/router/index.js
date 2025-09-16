import { createRouter, createWebHistory } from 'vue-router'
import { useSessionStore } from '../store/session'
import Login from '../pages/Login.vue'
import Layout from '../components/Layout.vue'
import Analytics from '../pages/Analytics.vue'
import UsersList from '../pages/UsersList.vue'
import SurveysList from '../pages/SurveysList.vue'
import QuizList from '../pages/QuizList.vue'
import SurveyDetail from '../pages/SurveyDetail.vue'
import QuizDetail from '../pages/QuizDetail.vue'
import UserDetail from '../pages/UserDetail.vue'
import Raffle from '../pages/Raffle.vue'
import MotionData from '../pages/MotionData.vue'

const routes = [
    { path: '/login', name: 'login', component: Login },
    {
        path: '/',
        component: Layout,
        children: [
            { path: '', redirect: '/analytics' },
            { path: 'analytics', name: 'analytics', component: Analytics },
            { path: 'users', name: 'users', component: UsersList },
            { path: 'surveys', name: 'surveys', component: SurveysList },
            { path: 'quiz', name: 'quiz', component: QuizList },
            { path: 'motion', name: 'motion', component: MotionData },
            { path: 'raffle', name: 'raffle', component: Raffle },
            { path: 'surveys/:id', name: 'survey-detail', component: SurveyDetail, props: true },
            { path: 'quiz/:id', name: 'quiz-detail', component: QuizDetail, props: true },
            { path: 'users/:sysId', name: 'user-detail', component: UserDetail, props: true }
        ]
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.VITE_BASE_PATH || '/'),
    routes
})

router.beforeEach(async (to) => {
    const session = useSessionStore()
    if (!session.initialized) {
        await session.bootstrap()
    }
    if (to.name !== 'login' && !session.isAuthed) {
        return { name: 'login' }
    }
    if (to.name === 'login' && session.isAuthed) {
        return { name: 'analytics' }
    }
})

export default router
