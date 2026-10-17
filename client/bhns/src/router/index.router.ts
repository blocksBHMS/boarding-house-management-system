import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import RoomList from '../components/RoomList.vue'
import BedList from '../components/BedList.vue'
import TenancyList from '../components/TenancyList.vue'
import AccountList from '../components/AccountList.vue'
import InvoiceList from '../components/InvoiceList.vue'
import InvoiceItemList from '../components/InvoiceItemList.vue'
import PaymentList from '../components/PaymentList.vue'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresGuest?: boolean
    /** Render without the sidebar shell (login). */
    bare?: boolean
    title?: string
    group?: string
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/overview'
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { requiresGuest: true, bare: true, title: 'Sign in' }
    },
    {
      path: '/overview',
      name: 'overview',
      component: () => import('../components/Overview.vue'),
      meta: { requiresAuth: true, title: 'Overview' }
    },
    {
      path: '/editor',
      name: 'editor',
      component: () => import('../components/Editor.vue'),
      meta: { requiresAuth: true, title: '3D editor' }
    },
    {
      path: '/rooms',
      name: 'rooms',
      component: RoomList,
      meta: { requiresAuth: true, group: 'Property', title: 'Rooms' }
    },
    {
      path: '/beds',
      name: 'beds',
      component: BedList,
      meta: { requiresAuth: true, group: 'Property', title: 'Beds' }
    },
    {
      path: '/tenancies',
      name: 'tenancies',
      component: TenancyList,
      meta: { requiresAuth: true, group: 'People', title: 'Tenancies' }
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: AccountList,
      meta: { requiresAuth: true, group: 'People', title: 'Accounts' }
    },
    {
      path: '/invoices',
      name: 'invoices',
      component: InvoiceList,
      meta: { requiresAuth: true, group: 'Money', title: 'Invoices' }
    },
    {
      path: '/invoice-items',
      name: 'invoice-items',
      component: InvoiceItemList,
      meta: { requiresAuth: true, group: 'Money', title: 'Charges' }
    },
    {
      path: '/payments',
      name: 'payments',
      component: PaymentList,
      meta: { requiresAuth: true, group: 'Money', title: 'Payments' }
    },
    {
      // Unknown URLs (e.g. an old /register bookmark) go back to the app root
      path: '/:pathMatch(.*)*',
      redirect: '/'
    },
  ],
})

router.beforeEach((to) => {
  const isAuthenticated = !!localStorage.getItem('token')

  // Protect authenticated routes
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login' }
  }

  // Prevent logged-in users from accessing the login page
  if (to.meta.requiresGuest && isAuthenticated) {
    return { name: 'overview' }
  }
})

export default router