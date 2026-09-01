const routes = [
  {
    path: '/login',
    component: () => import('@/pages/LoginPage.vue'),
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/principal' },
      {
        path: 'principal',
        component: () => import('@/pages/PrincipalPage.vue'),
      },
      {
        path: 'planta',
        component: () => import('@/pages/planta/OperacionesPlantaPage.vue'),
      },
      {
        path: 'planta/operaciones/nuevo',
        component: () => import('@/pages/planta/RegistroOperacionesPage.vue'),
      },
      {
        path: 'planta/operaciones/:id',
        component: () => import('@/pages/planta/RegistroOperacionesPage.vue'),
      },
      {
        path: 'planta/macromedidores/nuevo',
        component: () => import('@/pages/planta/RegistroMacromedidoresPage.vue'),
      },
      {
        path: 'planta/macromedidores/:id',
        component: () => import('@/pages/planta/RegistroMacromedidoresPage.vue'),
      },
      {
        path: 'planta/calidad/nuevo',
        component: () => import('@/pages/planta/RegistroCalidadPage.vue'),
      },
      {
        path: 'planta/calidad/:id',
        component: () => import('@/pages/planta/RegistroCalidadPage.vue'),
      },
      {
        path: 'second',
        component: () => import('@/pages/SecondPage.vue'),
      },
      // Rutas dinámicas del menú (mientras se crean las páginas)
      {
        path: ':pathMatch(.*)*',
        component: () => import('@/pages/ModulePlaceholderPage.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
