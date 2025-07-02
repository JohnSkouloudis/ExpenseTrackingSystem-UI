import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Settings from '../views/Settings.vue';
import Analytics from '../views/Analytics.vue';
import Transactions from '../views/Transactions.vue';
import Accounts from '../views/Accounts.vue';
import NotFound from '../views/NotFound.vue';


const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard
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
        component: Transactions
    },
    {
        path: '/accounts',
        name: 'Accounts',
        component: Accounts
    },
    {
        path: '/settings',
        name: 'Settings',
        component: Settings
    },
    {
        path: '/analytics',
        name: 'Analytics',
        component: Analytics
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

export default router;