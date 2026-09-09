<template>
  <q-page class="planta-page">
    <div class="planta-inner">
      <div class="page-top row items-start justify-between q-col-gutter-sm q-mb-md">
        <div class="col-12 col-md">
          <div class="text-h5 text-weight-bold text-slate">Operaciones de Planta Diviso</div>
          <div class="text-body2 text-blue-grey-6">
            {{ seccionActiva?.descripcion || 'Consulta y registra información por módulo.' }}
          </div>
        </div>
        <div class="col-12 col-md-auto row q-gutter-sm items-center justify-end page-actions">
          <q-btn
            v-if="esMacromedidores || esOperaciones"
            outline
            no-caps
            icon="refresh"
            :label="$q.screen.gt.xs ? 'Recargar' : undefined"
            color="primary"
            :loading="cargandoListado"
            :disable="cargandoListado || !seccionActiva"
            @click="refrescar"
          />
          <q-btn
            unelevated
            no-caps
            icon="add"
            :label="$q.screen.gt.xs ? 'Nuevo registro' : undefined"
            class="btn-gradient"
            :disable="cargandoListado || !seccionActiva"
            @click="onNuevoRegistro"
          />
        </div>
      </div>

      <div class="hs-card listado-card">
        <q-tabs
          v-model="tabId"
          dense
          align="left"
          outside-arrows
          mobile-arrows
          class="planta-tabs text-primary"
          active-color="primary"
          indicator-color="primary"
          narrow-indicator
          @update:model-value="onTabChange"
        >
          <q-tab
            v-for="seccion in secciones"
            :key="seccion.id"
            :name="seccion.id"
            :icon="seccion.icono"
            :label="etiquetaTab(seccion)"
            :style="{ '--tab-accent': seccion.color }"
            class="planta-tab"
          />
        </q-tabs>

        <q-separator />

        <div class="toolbar row items-center q-pa-md q-col-gutter-sm">
          <div class="col-12 col-sm">
            <q-input
              v-model="filtro"
              dense
              outlined
              clearable
              placeholder="Buscar en el listado..."
              class="search-input"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-sm-auto row items-center q-gutter-sm justify-between justify-sm-end">
            <q-btn
              v-if="esMacromedidores || esOperaciones"
              flat
              dense
              no-caps
              icon="refresh"
              label="Recargar"
              color="primary"
              class="gt-xs"
              :loading="cargandoListado"
              :disable="cargandoListado"
              @click="refrescar"
            />
            <q-chip outline color="primary" :label="`${filas.length} registro(s)`" dense />
          </div>
        </div>

        <q-table
          flat
          :rows="filas"
          :columns="columnas"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
          :filter="filtro"
          :loading="cargandoListado"
          class="planta-table"
          :no-data-label="`No hay registros en ${seccionActiva?.titulo || 'esta sección'}`"
          @row-click="onFilaClick"
        >
          <template #body-cell-acciones="props">
            <q-td :props="props" class="q-gutter-xs">
              <q-btn
                flat
                dense
                round
                :icon="esMacromedidores ? 'update' : 'edit'"
                color="primary"
                size="sm"
                @click.stop="abrirEdicion(props.row)"
              >
                <q-tooltip>{{ esMacromedidores ? 'Actualizar lecturas' : 'Editar' }}</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                round
                icon="delete"
                color="negative"
                size="sm"
                @click.stop="eliminar(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Dialog, useQuasar } from 'quasar'
import Utils from '@/Commons/Utils'
import { api } from '@/boot/axios'
import { listarRegistros, eliminarRegistro, reemplazarRegistros } from '@/Commons/plantaStorage'
import { obtenerIdPlantaTratamiento } from '@/config/app'
import {
  SECCIONES_PLANTA,
  COLUMNAS,
  TIPO_REGISTRO_PLANTA,
  fechaHoyLocal,
  mapearRegistrosMacromedidoresApi,
  soloFecha,
} from '@/config/planta'
import { mapearRegistrosOperacionesApi } from '@/Commons/registroDiarioOperacion'

const RUTAS_NUEVO = {
  operaciones: '/planta/operaciones/nuevo',
  macromedidores: '/planta/macromedidores/nuevo',
  calidad: '/planta/calidad/nuevo',
}

const RUTAS_EDITAR = {
  operaciones: (id) => `/planta/operaciones/${id}`,
  macromedidores: (id) => `/planta/macromedidores/${id}`,
  calidad: (id) => `/planta/calidad/${id}`,
}

const TAB_LABELS_CORTOS = {
  macromedidores: 'Macromedidores',
  operaciones: 'Operaciones',
  calidad: 'Calidad',
}

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const secciones = SECCIONES_PLANTA
const tabId = ref(secciones[0]?.id || 'macromedidores')
const filtro = ref('')
const filas = ref([])
const cargandoListado = ref(false)

const seccionActiva = computed(() => secciones.find((s) => s.id === tabId.value) || null)

const columnas = computed(() => {
  if (!seccionActiva.value) return []
  return COLUMNAS[seccionActiva.value.id] || []
})

const esMacromedidores = computed(() => seccionActiva.value?.id === 'macromedidores')
const esOperaciones = computed(() => seccionActiva.value?.id === 'operaciones')

const etiquetaTab = (seccion) => {
  if ($q.screen.lt.md) return TAB_LABELS_CORTOS[seccion.id] || seccion.titulo
  return seccion.titulo
}

const hayRegistroConFechaHoy = (lista) => {
  const hoy = fechaHoyLocal()
  return (lista || []).some((r) => {
    const fecha =
      soloFecha(r?.fecha) ||
      soloFecha(r?.Fecha) ||
      soloFecha(r?.FechaC) ||
      soloFecha(r?.raw?.FechaC) ||
      soloFecha(r?.raw?.Fecha) ||
      (typeof r?.fecha === 'string' ? r.fecha.slice(0, 10) : null)
    return fecha === hoy
  })
}

const alertarSoloUnRegistroDiario = () =>
  new Promise((resolve) => {
    Dialog.create({
      title: 'Registro diario',
      message:
        'Solo se permite un registro diario de macromedidores. Ya existe un registro para la fecha actual.',
      ok: { label: 'Entendido', unelevated: true, color: 'primary' },
      persistent: true,
    })
      .onOk(() => resolve())
      .onDismiss(() => resolve())
  })

const traerRegistrosMacromedidores = async () => {
  const idPlanta = obtenerIdPlantaTratamiento()
  const tipo = TIPO_REGISTRO_PLANTA.macromedidores
  const response = await api.get(`operaciones-planta/${idPlanta}/${tipo}/traer-registro`)

  if (response.data?.IsExito === false) {
    Utils.notificacion(response.data?.Mensaje || 'No se pudieron cargar los registros', false)
    return []
  }

  const dato = response.data?.Dato ?? response.data
  return mapearRegistrosMacromedidoresApi(dato)
}

const traerRegistrosOperaciones = async () => {
  const idPlanta = obtenerIdPlantaTratamiento()
  const tipo = TIPO_REGISTRO_PLANTA.operaciones
  const response = await api.get(`operaciones-planta/${idPlanta}/${tipo}/traer-registro`)

  if (response.data?.IsExito === false) {
    Utils.notificacion(response.data?.Mensaje || 'No se pudieron cargar los registros', false)
    return []
  }

  const dato = response.data?.Dato ?? response.data
  return mapearRegistrosOperacionesApi(dato)
}

const refrescar = async () => {
  if (!seccionActiva.value) {
    filas.value = []
    return
  }

  const seccionId = seccionActiva.value.id

  if (seccionId === 'macromedidores' || seccionId === 'operaciones') {
    cargandoListado.value = true
    Utils.loadingNotify(true, 'Cargando registros...')
    try {
      const lista =
        seccionId === 'macromedidores'
          ? await traerRegistrosMacromedidores()
          : await traerRegistrosOperaciones()
      reemplazarRegistros(seccionId, lista)
      filas.value = lista
    } catch (error) {
      console.error(`Error al traer registros de ${seccionId}:`, error)
      Utils.notificacion(
        error.response?.data?.Mensaje || 'No se pudieron cargar los registros.',
        false,
      )
      filas.value = listarRegistros(seccionId)
    } finally {
      cargandoListado.value = false
      Utils.loadingNotify(false, '')
    }
    return
  }

  filas.value = listarRegistros(seccionId)
}

const seleccionarSeccion = (id, { syncRoute = true } = {}) => {
  const encontrada = secciones.find((s) => s.id === id) || secciones[0]
  if (!encontrada) return

  tabId.value = encontrada.id
  filtro.value = ''
  if (syncRoute && route.query.seccion !== encontrada.id) {
    router.replace({ path: '/planta', query: { seccion: encontrada.id } })
  }
  refrescar()
}

const onTabChange = (id) => {
  seleccionarSeccion(id)
}

const abrirEdicion = (row) => {
  const id = seccionActiva.value?.id
  if (!id || row?.id == null) return
  router.push(RUTAS_EDITAR[id](row.id))
}

const onNuevoRegistro = async () => {
  const id = seccionActiva.value?.id
  if (!id || !RUTAS_NUEVO[id]) return

  if (id === 'macromedidores') {
    if (hayRegistroConFechaHoy(filas.value)) {
      await alertarSoloUnRegistroDiario()
      return
    }

    cargandoListado.value = true
    Utils.loadingNotify(true, 'Validando registro del día...')
    try {
      const lista = await traerRegistrosMacromedidores()
      reemplazarRegistros('macromedidores', lista)
      filas.value = lista

      if (hayRegistroConFechaHoy(lista)) {
        Utils.loadingNotify(false, '')
        await alertarSoloUnRegistroDiario()
        return
      }
    } catch (error) {
      console.error('Error al validar registro del día:', error)
      Utils.notificacion(
        error.response?.data?.Mensaje || 'No se pudo validar si ya existe registro del día.',
        false,
      )
      return
    } finally {
      cargandoListado.value = false
      Utils.loadingNotify(false, '')
    }
  }

  router.push(RUTAS_NUEVO[id])
}

const onFilaClick = (_evt, row) => {
  abrirEdicion(row)
}

const eliminar = async (row) => {
  const ok = await Utils.confirmarAccion(
    '¿Eliminar este registro? Esta acción no se puede deshacer.',
    'Eliminar',
  )
  if (!ok) return

  eliminarRegistro(seccionActiva.value.id, row.id)
  Utils.notificacion('Registro eliminado', true)
  refrescar()
}

const aplicarQuery = () => {
  const id = route.query.seccion || secciones[0]?.id
  seleccionarSeccion(id, { syncRoute: !route.query.seccion })
}

watch(
  () => route.query.seccion,
  (id) => {
    if (!id) {
      seleccionarSeccion(secciones[0]?.id)
      return
    }
    if (id !== tabId.value) {
      seleccionarSeccion(id, { syncRoute: false })
    }
  },
)

onMounted(aplicarQuery)
</script>

<style scoped>
.planta-page {
  width: 100%;
  max-width: none;
  min-width: 0;
}

.planta-inner {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 12px 16px 24px;
  box-sizing: border-box;
}

.text-slate {
  color: var(--hs-text);
}

.listado-card {
  width: 100%;
  overflow: hidden;
}

.planta-tabs {
  min-height: 52px;
  padding: 0 8px;
  background: #fff;
}

.planta-tabs :deep(.q-tab) {
  min-height: 52px;
  padding: 0 14px;
  text-transform: none;
}

.planta-tabs :deep(.q-tab__label) {
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.01em;
}

.planta-tabs :deep(.q-tab--active .q-tab__icon),
.planta-tabs :deep(.q-tab--active .q-tab__label) {
  color: var(--tab-accent, var(--hs-primary));
}

.toolbar {
  width: 100%;
  background: #fff;
}

.search-input {
  width: 100%;
  max-width: 420px;
}

.search-input :deep(.q-field__control) {
  border-radius: 12px;
  background: #f4f8fb;
}

.planta-table {
  width: 100%;
}

.planta-table :deep(.q-table__middle) {
  overflow-x: auto;
}

.planta-table :deep(thead tr th) {
  background: #f4f8fb;
  color: #475569;
  font-weight: 700;
  white-space: nowrap;
}

.planta-table :deep(tbody tr) {
  cursor: pointer;
}

.planta-table :deep(tbody td) {
  white-space: nowrap;
}

@media (max-width: 767px) {
  .planta-inner {
    padding: 10px 10px 20px;
  }

  .page-actions {
    justify-content: flex-start !important;
  }

  .search-input {
    max-width: 100%;
  }

  .planta-tabs :deep(.q-tab) {
    padding: 0 10px;
  }

  .planta-tabs :deep(.q-tab__label) {
    font-size: 0.75rem;
  }
}
</style>
