import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/HomeView.vue') },
  {
    path: '/exam/:level/:time',
    component: () => import('../views/ExamView.vue'),
    props: true,
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
