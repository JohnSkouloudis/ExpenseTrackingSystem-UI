import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Settings from '../views/Settings.vue';
import Analytics from '../views/Analytics.vue';
import Transactions from '../views/Transactions.vue';
import Accounts from '../views/Accounts.vue';
import NotFound from '../views/NotFound.vue';
import { clearToken, isAuthenticated } from '../store/user';


const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/register',
        name: 'Register',
        component: Register
    },
    {
        path: '/transactions',
        name: 'Transactions',
        component: Transactions,
        meta: { requiresAuth: true }
    },
    {
        path: '/accounts',
        name: 'Accounts',
        component: Accounts,
        meta: { requiresAuth: true }
    },
    {
        path: '/settings',
        name: 'Settings',
        component: Settings,
        meta: { requiresAuth: true }
    },
    {
        path: '/analytics',
        name: 'Analytics',
        component: Analytics,
        meta: { requiresAuth: true }
    },
    {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
  },
    
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
});

router.beforeEach((to, from, next) => {

  if (to.meta.requiresAuth && !isAuthenticated() ) {

    next('/login')
    clearToken();
  } else {
    next()
  }
})

export default router;