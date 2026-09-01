<template>
  <q-page class="planta-page q-pa-md">
    <div class="page-top row items-start justify-between q-mb-md q-col-gutter-sm">
      <div class="col">
        <div class="row items-center q-gutter-sm">
          <q-btn
            v-if="seccionActiva"
            flat
            round
            dense
            icon="arrow_back"
            color="primary"
            aria-label="Volver a módulos"
            @click="volverModulos"
          />
          <div>
            <div class="text-h5 text-weight-bold text-slate">
              {{ seccionActiva ? seccionActiva.titulo : 'Operaciones de Planta Diviso' }}
            </div>
            <div class="text-body2 text-blue-grey-6">
              {{
                seccionActiva
                  ? seccionActiva.descripcion
                  : 'Selecciona un módulo para consultar o registrar información.'
              }}
            </div>
          </div>
        </div>
      </div>
      <div v-if="seccionActiva" class="col-auto">
        <q-btn unelevated no-caps icon="add" label="Nuevo registro" class="btn-gradient" @click="abrirFormulario()" />
      </div>
    </div>

    <div v-if="!seccionActiva" class="row q-col-gutter-md">
      <div v-for="seccion in secciones" :key="seccion.id" class="col-xs-12 col-sm-6 col-md-4">
        <button type="button" class="modulo-card full-width text-left" @click="abrirSeccion(seccion)">
          <div class="modulo-icon flex flex-center" :style="{ background: `${seccion.color}1a`, color: seccion.color }">
            <q-icon :name="seccion.icono" size="28px" />
          </div>
          <div class="modulo-title">{{ seccion.titulo }}</div>
          <div class="modulo-desc">{{ seccion.descripcion }}</div>
          <div class="modulo-footer row items-center justify-between">
            <span class="text-caption text-primary text-weight-medium">Ver listado</span>
            <q-icon name="arrow_forward" color="primary" size="18px" />
          </div>
        </button>
      </div>
    </div>

    <div v-else class="hs-card listado-card">
      <div class="row items-center q-pa-md q-col-gutter-sm">
        <div class="col">
          <q-input v-model="filtro" dense outlined clearable placeholder="Buscar en el listado..." class="search-input">
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-auto">
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
        no-data-label="No hay registros en esta sección"
      >
        <template #body-cell-acciones="props">
          <q-td :props="props" class="q-gutter-xs">
            <q-btn flat dense round icon="edit" color="primary" size="sm" @click="abrirFormulario(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>
            <q-btn flat dense round icon="delete" color="negative" size="sm" @click="eliminar(props.row)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Utils from '@/Commons/Utils'
import { api } from '@/boot/axios'
import { listarRegistros, eliminarRegistro, reemplazarRegistros } from '@/Commons/plantaStorage'
import { obtenerIdPlantaTratamiento } from '@/config/app'
import {
  SECCIONES_PLANTA,
  COLUMNAS,
  TIPO_REGISTRO_PLANTA,
  mapearRegistrosMacromedidoresApi,
} from '@/config/planta'

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

const route = useRoute()
const router = useRouter()

const secciones = SECCIONES_PLANTA
const seccionActiva = ref(null)
const filtro = ref('')
const filas = ref([])
const cargandoListado = ref(false)

const columnas = computed(() => {
  if (!seccionActiva.value) return []
  return COLUMNAS[seccionActiva.value.id] || []
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

const refrescar = async () => {
  if (!seccionActiva.value) {
    filas.value = []
    return
  }

  const seccionId = seccionActiva.value.id

  if (seccionId === 'macromedidores') {
    cargandoListado.value = true
    Utils.loadingNotify(true, 'Cargando registros...')
    try {
      const lista = await traerRegistrosMacromedidores()
      reemplazarRegistros('macromedidores', lista)
      filas.value = lista
    } catch (error) {
      console.error('Error al traer registros de macromedidores:', error)
      Utils.notificacion(
        error.response?.data?.Mensaje || 'No se pudieron cargar los registros.',
        false,
      )
      filas.value = listarRegistros('macromedidores')
    } finally {
      cargandoListado.value = false
      Utils.loadingNotify(false, '')
    }
    return
  }

  filas.value = listarRegistros(seccionId)
}

const abrirSeccion = (seccion) => {
  seccionActiva.value = seccion
  filtro.value = ''
  refrescar()
  router.replace({ path: '/planta', query: { seccion: seccion.id } })
}

const volverModulos = () => {
  seccionActiva.value = null
  filtro.value = ''
  router.replace({ path: '/planta' })
}

const abrirFormulario = (row = null) => {
  const id = seccionActiva.value?.id
  if (!id || !RUTAS_NUEVO[id]) return

  if (row?.id != null) {
    router.push(RUTAS_EDITAR[id](row.id))
  } else {
    router.push(RUTAS_NUEVO[id])
  }
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
  const id = route.query.seccion
  if (!id) {
    seccionActiva.value = null
    filas.value = []
    return
  }
  const encontrada = secciones.find((s) => s.id === id)
  if (encontrada) {
    seccionActiva.value = encontrada
    refrescar()
  }
}

watch(
  () => route.query.seccion,
  () => aplicarQuery(),
)

onMounted(aplicarQuery)
</script>

<style scoped>
.planta-page {
  max-width: 1200px;
  margin: 0 auto;
}

.text-slate {
  color: var(--hs-text);
}

.modulo-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 210px;
  padding: 20px 18px 16px;
  border: 1px solid var(--hs-border);
  border-radius: 18px;
  background: var(--hs-surface);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.05);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.modulo-card:hover {
  transform: translateY(-3px);
  border-color: rgba(38, 166, 154, 0.35);
  box-shadow: 0 14px 32px rgba(38, 166, 154, 0.14);
}

.modulo-card:focus-visible {
  outline: 2px solid var(--hs-primary);
  outline-offset: 2px;
}

.modulo-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
}

.modulo-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--hs-text);
  line-height: 1.25;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.modulo-desc {
  color: var(--hs-text-muted);
  font-size: 0.88rem;
  line-height: 1.45;
  flex: 1;
}

.modulo-footer {
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid var(--hs-border);
}

.listado-card {
  overflow: hidden;
}

.search-input {
  max-width: 360px;
}

.search-input :deep(.q-field__control) {
  border-radius: 12px;
  background: #f4f8fb;
}

.planta-table :deep(thead tr th) {
  background: #f4f8fb;
  color: #475569;
  font-weight: 700;
}

@media (max-width: 599px) {
  .modulo-card {
    min-height: 180px;
  }

  .search-input {
    max-width: 100%;
  }
}
</style>
