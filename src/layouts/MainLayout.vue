<template>
  <q-layout view="lHh Lpr lFf" class="hs-layout">
    <q-drawer
      v-model="visibilidadMenu"
      bordered
      show-if-above
      :width="280"
      class="nav-drawer q-pa-md"
    >
      <section class="brand-header row items-center q-mb-sm">
        <div class="row items-center no-wrap">
          <div class="brand-icon flex flex-center">
            <q-icon name="science" color="white" size="26px" />
          </div>
          <div class="q-ml-sm">
            <div class="text-subtitle1 text-weight-bold brand-title">{{ APP_NAME }}</div>
            <div class="text-caption text-blue-grey-5">{{ APP_TAGLINE }}</div>
          </div>
        </div>
      </section>

      <q-separator class="q-mb-sm" />
      <div class="text-caption text-blue-grey-6 q-mb-xs letter-spacing-wide">NAVEGACIÓN</div>

      <q-scroll-area class="nav-scroll bg-white text-grey-9">
        <template v-if="OpcionesMenu.length === 0">
          <q-item v-for="i in 6" :key="i">
            <q-item-section avatar>
              <q-skeleton size="35px" square animation="fade" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                <q-skeleton type="text" square width="30%" animation="fade" />
                <q-skeleton type="text" square height="12px" animation="fade" />
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <q-list v-else padding class="nav-list">
          <MenuDinamico
            :items="OpcionesMenu"
            :id-menu-activo="idMenu"
            @seleccionar="mostrarComponenteMenu"
          />
        </q-list>
      </q-scroll-area>

      <q-separator color="grey-4" class="q-mt-md" size="1px" />
      <div class="row justify-between items-center q-mt-xs nav-drawer-footer">
        <div class="app-version-pill text-caption text-blue-grey-5" title="Versión de la aplicación">
          v{{ appVersion }}
        </div>
        <div class="row items-center no-wrap">
          <q-btn icon="manage_accounts" color="blue-grey-5" flat dense @click="modalCambio = true" />
          <q-btn
            label="Cerrar Sesión"
            flat
            dense
            color="blue-grey-7"
            icon="logout"
            @click="cerrarSesion"
          />
        </div>
      </div>
    </q-drawer>

    <main
      v-if="isVistasVisible"
      class="absolute-left items-start border-right diseno-menu justify-start q-pb-md row q-pr-md q-pt-sm"
      :style="{ marginLeft: $q.screen.lt.md ? '0%' : '280px' }"
      :class="!$q.screen.lt.md ? '' : 'menu-responsive'"
    >
      <div
        class="row q-pl-md q-pr-md full-width justify-between items-center vistas-header"
        style="position: absolute; z-index: 1; height: 55px"
      >
        <h6 class="q-ma-none text-grey-9 text-weight-bold text-h6">
          {{ OpcionesMenu.find((m) => m.IdMenu === idMenu)?.Nombre || 'MÓDULO' }}
        </h6>
        <q-btn
          size="md"
          icon="close"
          flat
          round
          class="close-btn-menu-style text-weight-bold"
          @click="isVistasVisible = false"
        />
      </div>
      <section style="margin-top: 80px" class="q-col-gutter-sm q-pl-sm row full-width">
        <template v-for="(item, i) in vistas" :key="i">
          <div class="col-md-12 col-sm-6 col-xs-12">
            <div
              class="menu-item-card full-width q-py-sm q-px-md bg-white row items-center rounded-borders"
              @click="visitar(item.Ruta)"
            >
              <div class="menu-icon-wrapper q-mr-sm">
                <q-icon :name="item.IconoVista || 'description'" size="sm" class="text-grey-8" />
              </div>
              <div class="text-left text-grey-9 text-body2 text-weight-medium col">
                {{ item.NombreVista }}
              </div>
              <q-icon name="chevron_right" color="grey-5" size="xs" />
            </div>
          </div>
        </template>
      </section>
    </main>

    <q-dialog v-model="modalCambio" persistent>
      <q-card class="obs-card">
        <div class="row items-center justify-between q-pa-md">
          <div class="row items-center">
            <q-icon name="lock_reset" color="primary" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-bold">Cambio Contraseña</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup @click="CancelarCambio" />
        </div>
        <q-separator />
        <q-card-section class="q-gutter-sm">
          <q-input v-model="clave" type="password" outlined label="Contraseña..." />
          <q-input
            v-model="confirmarClave"
            type="password"
            outlined
            label="Confirmar Contraseña..."
            lazy-rules
            :rules="[reglaConfirmacion]"
          />
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-pa-md">
          <q-btn label="Cancelar" color="negative" outline class="bg-red-1" @click="CancelarCambio" />
          <q-btn label="Guardar Cambio" color="primary" unelevated @click="GuardarCambio" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-container class="app-content">
      <div class="page-wrapper">
        <div
          class="page-header row justify-between"
          :class="[$q.screen.lt.md ? 'page-header--compact items-center' : 'items-end']"
        >
          <q-btn
            aria-label="Alternar menú"
            round
            flat
            :dense="$q.screen.lt.md"
            :size="$q.screen.lt.md ? 'sm' : 'md'"
            :icon="visibilidadMenu ? 'chevron_left' : 'menu'"
            class="brand-toggle"
            @click="cerrarMenu"
          />
          <div class="text-caption text-blue-grey-6 ellipsis q-ml-sm">
            {{ UsuarioSesion.NombreCompleto || UsuarioSesion.LoginUsuario || '' }}
          </div>
        </div>
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useQuasar, LocalStorage } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from '@/boot/axios'
import Utils from '@/Commons/Utils'
import MenuDinamico from '@/components/MenuDinamico.vue'
import { APP_NAME, APP_TAGLINE, STORAGE_KEYS } from '@/config/app'
import packageJson from '../../package.json'

const appVersion = packageJson.version
const $q = useQuasar()
const router = useRouter()

const UsuarioSesion = ref({})
const OpcionesMenu = ref([])
const vistas = ref([])
const idMenu = ref(0)
const visibilidadMenu = ref(true)
const isVistasVisible = ref(false)
const menuActivoMobile = ref(null)
const modalCambio = ref(false)
const clave = ref('')
const confirmarClave = ref('')

const cerrarMenu = () => {
  visibilidadMenu.value = !visibilidadMenu.value
  isVistasVisible.value = false
}

const reglaConfirmacion = (val) => {
  if (!val || val.trim() === '') return 'Confirma la clave'
  if (val !== clave.value) return 'La confirmación no coincide'
  return true
}

const GuardarCambio = async () => {
  if (clave.value.trim() !== confirmarClave.value.trim()) {
    Utils.notificacion('La contraseña no coincide', false)
    return
  }

  const datos = {
    IdUsuario: UsuarioSesion.value.IdUsuario,
    Clave: clave.value,
  }

  try {
    Utils.loadingNotify(true, 'Guardando Datos...')
    const response = await api.post('usuario/cambio-clave', datos)
    Utils.notificacion(response.data.Mensaje, response.data.IsExito)
    if (response.data.IsExito) {
      CancelarCambio()
    }
  } catch (error) {
    Utils.notificacion(error.response?.data?.Mensaje || 'No se pudo cambiar la clave', false)
  } finally {
    Utils.loadingNotify(false)
  }
}

const CancelarCambio = () => {
  clave.value = ''
  confirmarClave.value = ''
  modalCambio.value = false
}

const mostrarComponenteMenu = async (menuObjeto) => {
  idMenu.value = menuObjeto.IdMenu

  if ($q.screen.lt.md) {
    if (menuActivoMobile.value === menuObjeto.IdMenu) {
      menuActivoMobile.value = null
    } else {
      menuActivoMobile.value = menuObjeto.IdMenu
    }
    return
  }

  if (menuObjeto.Vistas && menuObjeto.Vistas.length === 1) {
    router.push(menuObjeto.Vistas[0].Ruta)
    isVistasVisible.value = false
    return
  }

  isVistasVisible.value = true
  vistas.value = menuObjeto.Vistas || []
}

const visitar = async (url) => {
  await router.push(url)
  isVistasVisible.value = false
  if ($q.screen.lt.md) {
    visibilidadMenu.value = false
  }
}

const limpiarSesion = async () => {
  LocalStorage.remove(STORAGE_KEYS.usuario)
  router.push('/login')
}

const cerrarSesion = async () => {
  try {
    if (!(await Utils.confirmarAccion('¿Seguro de cerrar sesión?', 'Cerrar sesión'))) {
      return
    }
    await limpiarSesion()
  } catch (error) {
    await limpiarSesion()
    Utils.notificacion(`Ocurrió un error al cerrar sesión: ${error.message}`, false)
  }
}

const handleKeyPress = (event) => {
  const targetTag = event.target.tagName.toLowerCase()
  const isInputField =
    targetTag === 'input' || targetTag === 'textarea' || event.target.isContentEditable
  if (isInputField) return
  if (event.key.toLowerCase() === 'q') {
    cerrarMenu()
  }
}

const traerVistas = async () => {
  try {
    const response = await api.get(`rol/menus/${UsuarioSesion.value.IdUsuario}/usuario`)
    OpcionesMenu.value = response.data || []

    if (OpcionesMenu.value.length === 1 && router.currentRoute.value.path === '/principal') {
      const primeraVista = OpcionesMenu.value[0]?.Vistas?.[0]
      if (primeraVista?.Ruta) {
        router.replace(primeraVista.Ruta)
      }
    }
  } catch (error) {
    console.error('Error trayendo menús:', error)
    Utils.notificacion('No se pudieron cargar los menús del usuario', false)
  }
}

watch(
  () => $q.screen.lt.md,
  (isSmall) => {
    if (isSmall) {
      visibilidadMenu.value = false
    }
  },
)

onMounted(async () => {
  window.addEventListener('keydown', handleKeyPress)

  const usuario = await Utils.datoUsuario()
  if (!usuario) {
    router.push('/login')
    return
  }

  UsuarioSesion.value = usuario
  visibilidadMenu.value = !$q.screen.lt.md
  await traerVistas()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.hs-layout {
  background: var(--hs-bg-soft);
}

.nav-drawer {
  background: #ffffff;
  border-right: 1px solid var(--hs-border);
}

.brand-header {
  padding: 8px 4px 12px 4px;
}

.brand-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--hs-gradient-brand);
  box-shadow: 0 6px 16px rgba(38, 166, 154, 0.28);
}

.brand-title {
  color: var(--hs-text);
  line-height: 1.2;
}

.letter-spacing-wide {
  letter-spacing: 0.4px;
}

.nav-scroll {
  height: calc(100% - 170px);
}

.nav-list {
  --nav-active-bg: var(--hs-nav-active-bg);
  --nav-active-color: var(--hs-nav-active-color);
  --nav-hover-bg: var(--hs-nav-hover);
}

.nav-list :deep(.q-item) {
  margin: 4px 6px;
  border-radius: 12px;
  padding: 8px 10px;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.nav-list :deep(.q-item:hover) {
  background: var(--nav-hover-bg);
}

.nav-list :deep(.q-item--active),
.nav-list :deep(.q-router-link--active) {
  position: relative;
  background: linear-gradient(90deg, var(--nav-active-bg) 0%, rgba(77, 208, 225, 0.08) 100%);
  color: var(--nav-active-color);
}

.diseno-menu {
  height: calc(100% - 135px);
  width: 340px;
  max-width: 100vw;
  z-index: 45;
  top: 4em;
  background: var(--hs-bg-soft);
  border: 1px solid var(--hs-border);
  border-top-right-radius: 1em;
  border-bottom-right-radius: 1em;
  box-shadow: rgba(151, 151, 151, 0.15) 1.95px 1.95px 2.6px;
  overflow: auto;
}

.vistas-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
}

.close-btn-menu-style {
  background-color: rgba(38, 166, 154, 0.18);
  color: #334155;
}

.menu-item-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  min-height: 44px;
  border-bottom-right-radius: 1em;
  border-top-right-radius: 1em;
}

.menu-item-card:hover {
  box-shadow: 0 2px 8px rgba(38, 166, 154, 0.12);
}

.menu-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 6px;
  background-color: rgba(38, 166, 154, 0.18);
}

.app-content {
  background: var(--hs-bg-soft);
  overflow-y: auto;
  height: 100vh;
  overflow-x: clip;
}

.page-wrapper {
  padding: 0;
  max-width: 100%;
  min-width: 0;
  overflow-x: clip;
}

.page-header {
  position: sticky;
  top: 0;
  z-index: 5;
  min-height: 56px;
  background: #ffffff;
  border: 1px solid var(--hs-border);
  border-radius: 0;
  padding: 6px 10px;
  max-width: 100%;
  box-sizing: border-box;
}

.page-header--compact {
  min-height: 44px;
  padding: 4px 8px;
}

.brand-toggle {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid var(--hs-border);
  color: var(--hs-primary);
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.06);
}

.brand-toggle:hover {
  background: var(--hs-nav-hover);
}

.nav-drawer-footer {
  min-height: 40px;
}

.app-version-pill {
  font-size: 11px;
  line-height: 1.2;
  letter-spacing: 0.04em;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(84, 110, 122, 0.06);
  border: 1px solid rgba(84, 110, 122, 0.1);
  user-select: none;
  white-space: nowrap;
}

.obs-card {
  width: 420px;
  max-width: 92vw;
  border-radius: 16px;
}

@media (max-width: 767px) {
  .page-header {
    border-radius: 0;
  }
}
</style>
