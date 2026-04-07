import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  {
    path: '/exam/:level/:time',
    component: () => import('../views/ExamView.vue'),
    props: true,
  },
  {
    path: '/wrong-answers',
    component: () => import('../views/WrongAnswersView.vue'),
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
