import { createRouter, createWebHistory } from 'vue-router'
import PublicLayout from '@/components/layout/PublicLayout.vue'
import TenantLayout from '@/components/layout/TenantLayout.vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'

import { useHouseStore } from '@/stores/useHouseStore'

const LandingView = () => import('@/views/LandingView.vue')
const AvailableRoomsView = () => import('@/views/AvailableRoomsView.vue')
const LoginView = () => import('@/views/LoginView.vue')
const TenantPortalView = () => import('@/views/TenantPortalView.vue')
const DashboardView = () => import('@/views/DashboardView.vue')
const RoomsView = () => import('@/views/RoomsView.vue')
const TenanciesView = () => import('@/views/TenanciesView.vue')
const InvoicesView = () => import('@/views/InvoicesView.vue')
const PaymentsView = () => import('@/views/PaymentsView.vue')
const MaintenanceAdminView = () => import('@/views/MaintenanceAdminView.vue')

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
  routes: [
    // 1. PUBLIC STOREFRONT TREE (Guest Layout - No sidebar, no admin controls)
    {
      path: '/',
      component: PublicLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: LandingView,
          meta: { title: 'BlocksBHMS - Modern Boarding House Living' },
        },
        {
          path: 'explore',
          name: 'explore',
          component: AvailableRoomsView,
          meta: { title: 'Available Rooms & Bedspaces - BlocksBHMS' },
        },
        {
          path: 'login',
          name: 'login',
          component: LoginView,
          meta: { title: 'Sign In - BlocksBHMS' },
        },
      ],
    },

    // 2. TENANT RESIDENT PORTAL TREE (Dedicated Resident Shell)
    {
      path: '/portal',
      component: TenantLayout,
      children: [
        {
          path: '',
          name: 'resident-portal',
          component: TenantPortalView,
          meta: { title: 'Resident Stay & Billing - BlocksBHMS' },
        },
      ],
    },

    // 3. LANDLORD ADMIN COMMAND CENTER TREE (Enterprise Admin Shell)
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: DashboardView,
          meta: { title: 'Operations Dashboard - BlocksBHMS' },
        },
        {
          path: 'rooms',
          name: 'admin-rooms',
          component: RoomsView,
          meta: { title: 'Room & Bed Visualizer - BlocksBHMS' },
        },
        {
          path: 'tenants',
          name: 'admin-tenants',
          component: TenanciesView,
          meta: { title: 'Tenancies & Leases - BlocksBHMS' },
        },
        {
          path: 'invoices',
          name: 'admin-invoices',
          component: InvoicesView,
          meta: { title: 'Invoices & Billing - BlocksBHMS' },
        },
        {
          path: 'payments',
          name: 'admin-payments',
          component: PaymentsView,
          meta: { title: 'Payments Ledger - BlocksBHMS' },
        },
        {
          path: 'maintenance',
          name: 'admin-maintenance',
          component: MaintenanceAdminView,
          meta: { title: 'Maintenance Queue - BlocksBHMS' },
        },
      ],
    },

    // Backward compatibility redirects
    { path: '/rooms', redirect: '/admin/rooms' },
    { path: '/tenants', redirect: '/admin/tenants' },
    { path: '/invoices', redirect: '/admin/invoices' },
    { path: '/payments', redirect: '/admin/payments' },

    // Fallback
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Route guard to ensure clean access
router.beforeEach((to, _from, next) => {
  const store = useHouseStore()

  // If visiting /admin without being a landlord, or unauthenticated, redirect to login
  if (to.path.startsWith('/admin')) {
    if (!store.isAuthenticated || !store.isLandlord) {
      next('/login')
      return
    }
  }

  // If visiting /portal without being logged in, redirect to login
  if (to.path === '/portal') {
    if (!store.isAuthenticated) {
      next('/login')
      return
    }
  }

  next()
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = to.meta.title as string
  }
})

export default router
