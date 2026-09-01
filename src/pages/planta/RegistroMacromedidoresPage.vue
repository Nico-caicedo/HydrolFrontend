<template>
  <q-page class="registro-page q-pa-md">
    <div class="page-top row items-start justify-between q-mb-md q-col-gutter-sm">
      <div class="col">
        <div class="row items-center q-gutter-sm">
          <q-btn flat round dense icon="arrow_back" color="primary" aria-label="Volver al listado" @click="volver" />
          <div>
            <div class="text-h5 text-weight-bold text-slate">
              {{ esEdicion ? 'Editar registro' : 'Nuevo registro' }}
            </div>
            <div class="text-body2 text-blue-grey-6">
              Registro de macromedidores — lecturas 6:00, 14:00 y 22:00
            </div>
          </div>
        </div>
      </div>
      <div class="col-auto row q-gutter-sm">
        <q-btn flat no-caps label="Cancelar" color="grey-7" @click="volver" />
        <q-btn
          unelevated
          no-caps
          icon="save"
          label="Guardar"
          class="btn-gradient"
          :loading="guardando"
          :disable="guardando"
          @click="guardar"
        />
      </div>
    </div>

    <section class="hs-card form-section q-mb-md">
      <div class="row items-center q-col-gutter-md">
        <div class="col-auto">
          <div class="section-head row items-center">
            <div class="section-icon flex flex-center">
              <q-icon name="speed" size="20px" />
            </div>
            <div>
              <div class="section-title">Macromedidores</div>
              <div class="section-sub">
                {{
                  esEdicion
                    ? 'Acumulado (6:00 / 14:00 / 22:00) y m³/día calculado'
                    : 'Nuevo registro: solo se captura la lectura de las 6:00'
                }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-sm-4 col-md-3 col-lg-2">
          <q-input v-model="form.fecha" type="date" outlined dense label="Fecha" :rules="[req]" />
        </div>
      </div>

      <div class="mm-grid q-mt-md">
        <div v-for="medidor in form.medidores" :key="medidor.idMacromedidor || medidor.codigo" class="mm-card">
          <div class="mm-card__title">{{ medidor.nombre }}</div>
          <div class="mm-card__cols">
            <div class="mm-col">
              <div class="mm-col__head">Acumulado</div>
              <div
                v-for="campo in camposLectura"
                :key="campo"
                class="lectura-wrap"
                :class="{ 'lectura-wrap--bloqueada': !lecturaEditable(campo) }"
              >
                <div class="lectura-label-row">
                  <span class="input-decimal__label">{{ etiquetasLectura[campo] }}</span>
                  <button
                    v-if="lecturaEditable(campo) && !esSinDato(medidor[campo])"
                    type="button"
                    class="btn-marcar-sd"
                    title="Marcar como Sin Dato"
                    @click="medidor[campo] = SIN_DATO"
                  >
                    <q-icon name="block" size="14px" />
                  </button>
                </div>

                <div class="lectura-field">
                  <InputDecimal
                    v-show="!esSinDato(medidor[campo])"
                    v-model="medidor[campo]"
                    :decimals="0"
                    :readonly="!lecturaEditable(campo)"
                    :disable="!lecturaEditable(campo)"
                    :input-class="lecturaEditable(campo) ? '' : 'input-calculado'"
                  />
                  <button
                    v-if="esSinDato(medidor[campo]) && lecturaEditable(campo)"
                    type="button"
                    class="sin-dato-overlay"
                    title="Clic para capturar lectura"
                    @click="medidor[campo] = null"
                  >
                    <q-icon name="block" size="14px" />
                    <span>Sin Dato</span>
                  </button>
                  <div
                    v-else-if="esSinDato(medidor[campo])"
                    class="sin-dato-overlay sin-dato-overlay--readonly"
                  >
                    <q-icon name="block" size="14px" />
                    <span>Sin Dato</span>
                  </div>
                </div>
              </div>

              <!-- Lectura 3 del día anterior (solo indicativo) -->
              <div class="lectura-wrap">
                <div class="lectura-label-row">
                  <span class="input-decimal__label">Lectura día ant.</span>
                </div>
                <div class="lectura-anterior">
                  {{ formatearLecturaAnterior(medidor.lectura3Anterior) }}
                </div>
              </div>
            </div>
            <div class="mm-col mm-col--calc">
              <div class="mm-col__head">m³/día</div>
              <div class="mm-calc">
                {{ formatearM3(medidor) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!cargandoMedidores && !form.medidores.length" class="text-center text-blue-grey-6 q-pa-lg">
        No hay macromedidores configurados para esta planta.
      </div>

      <div v-if="cargandoMedidores" class="row justify-center q-pa-lg">
        <q-spinner color="primary" size="40px" />
      </div>
    </section>

    <div class="row justify-end q-gutter-sm q-mt-sm q-mb-lg">
      <q-btn flat no-caps label="Cancelar" color="grey-7" @click="volver" />
      <q-btn
        unelevated
        no-caps
        icon="save"
        label="Guardar"
        class="btn-gradient"
        :loading="guardando"
        :disable="guardando"
        @click="guardar"
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Utils from '@/Commons/Utils'
import { api } from '@/boot/axios'
import { guardarRegistro, obtenerRegistro, listarRegistros } from '@/Commons/plantaStorage'
import { construirPaqueteMacromedidores } from '@/Commons/registroMacromedidores'
import { obtenerIdPlantaTratamiento } from '@/config/app'
import {
  calcM3DiaMacromedidor,
  CAMPO_LECTURA_NUEVO,
  crearRegistroMacromedidoresVacio,
  esSinDato,
  fechaHoyLocal,
  horaLecturaNuevoRegistro,
  horaLecturaSegunSistema,
  mapearMacromedidoresApi,
  obtenerLectura3DiaAnterior,
  SIN_DATO,
} from '@/config/planta'
import InputDecimal from '@/components/InputDecimal.vue'

const route = useRoute()
const router = useRouter()

const form = reactive(crearRegistroMacromedidoresVacio())
const guardando = ref(false)
const cargandoMedidores = ref(false)
const usuarioSesion = ref(null)

const camposLectura = ['acumulado1', 'acumulado2', 'acumulado3']
const etiquetasLectura = {
  acumulado1: 'Lectura 6:00',
  acumulado2: 'Lectura 14:00',
  acumulado3: 'Lectura 22:00',
}

const esEdicion = computed(() => route.params.id != null && route.params.id !== 'nuevo')

const lecturaEditable = (campo) => {
  if (esEdicion.value) return true
  return campo === CAMPO_LECTURA_NUEVO
}

const req = (val) =>
  (val !== null && val !== undefined && String(val).trim() !== '') || 'Campo requerido'

const formatearM3 = (medidor) => {
  const valor = calcM3DiaMacromedidor(medidor)
  if (valor == null) return '—'
  return new Intl.NumberFormat('es-CO').format(valor)
}

const formatearLecturaAnterior = (valor) => {
  if (valor === null || valor === undefined || valor === '') return '—'
  if (esSinDato(valor)) return SIN_DATO
  const n = Number(valor)
  if (Number.isNaN(n)) return '—'
  return new Intl.NumberFormat('es-CO').format(n)
}

const enriquecerLectura3Anterior = (medidores, fecha) => {
  const historial = listarRegistros('macromedidores')
  return (medidores || []).map((m) => {
    if (m.lectura3Anterior != null && m.lectura3Anterior !== '') return m
    return {
      ...m,
      lectura3Anterior: obtenerLectura3DiaAnterior(
        historial,
        m.idMacromedidor,
        m.codigo,
        fecha,
      ),
    }
  })
}

const volver = () => {
  router.push({ path: '/planta', query: { seccion: 'macromedidores' } })
}

const traerMacromedidores = async (idPlanta) => {
  cargandoMedidores.value = true
  try {
    const response = await api.get(`operaciones-planta/${idPlanta}/traer-macromedidores`)
    if (response.data?.IsExito === false) {
      Utils.notificacion(response.data?.Mensaje || 'No se pudieron cargar los macromedidores', false)
      return []
    }
    const dato = response.data?.Dato ?? response.data
    return mapearMacromedidoresApi(dato)
  } catch (error) {
    console.error('Error al traer macromedidores:', error)
    Utils.notificacion(
      error.response?.data?.Mensaje || 'No se pudieron cargar los macromedidores.',
      false,
    )
    return []
  } finally {
    cargandoMedidores.value = false
  }
}

const cargar = async () => {
  const usuario = await Utils.datoUsuario()
  usuarioSesion.value = usuario
  const idPlanta = obtenerIdPlantaTratamiento(usuario)
  const idUsuario = usuario?.IdUsuario ?? null

  if (esEdicion.value) {
    const existente = obtenerRegistro('macromedidores', route.params.id)
    if (!existente) {
      Utils.notificacion('Registro no encontrado', false)
      volver()
      return
    }
    Object.assign(form, {
      ...crearRegistroMacromedidoresVacio({
        idUsuario,
        idPlantaTratamiento: idPlanta,
        hora: existente.hora || horaLecturaSegunSistema(),
      }),
      ...existente,
      idUsuario: existente.idUsuario ?? idUsuario,
      idPlantaTratamiento: existente.idPlantaTratamiento ?? idPlanta,
      fecha: existente.fecha || fechaHoyLocal(),
      hora: existente.hora || horaLecturaSegunSistema(),
      medidores: enriquecerLectura3Anterior(
        existente.medidores?.length ? existente.medidores : [],
        existente.fecha || fechaHoyLocal(),
      ),
    })
    return
  }

  Utils.loadingNotify(true, 'Cargando macromedidores...')
  const medidoresApi = await traerMacromedidores(idPlanta)
  const fecha = fechaHoyLocal()
  const hora = horaLecturaNuevoRegistro()
  const medidores = enriquecerLectura3Anterior(medidoresApi, fecha)
  Object.assign(
    form,
    crearRegistroMacromedidoresVacio({
      idUsuario,
      idPlantaTratamiento: idPlanta,
      medidores,
      hora,
    }),
  )
  form.fecha = fecha
  form.hora = hora
  Utils.loadingNotify(false, '')
}

const construirLocal = () => ({
  id: form.id,
  fecha: form.fecha,
  hora: form.hora || (esEdicion.value ? horaLecturaSegunSistema() : horaLecturaNuevoRegistro()),
  idUsuario: form.idUsuario ?? usuarioSesion.value?.IdUsuario ?? null,
  idPlantaTratamiento: form.idPlantaTratamiento ?? obtenerIdPlantaTratamiento(usuarioSesion.value),
  medidores: (form.medidores || []).map((m) => ({
    ...m,
    m3Dia: calcM3DiaMacromedidor(m),
  })),
})

const guardar = async () => {
  if (!form.fecha) {
    Utils.notificacion('Indica la fecha del registro', false)
    return
  }

  guardando.value = true
  Utils.loadingNotify(true, 'Guardando...')
  const local = construirLocal()
  const paquete = construirPaqueteMacromedidores(local, usuarioSesion.value)

  try {
    const response = await api.post('operaciones-planta/registro-macromedidores', paquete)
    Utils.notificacion(response.data.Mensaje, response.data.IsExito)
    if (!response.data.IsExito) return

    if (response.data.Dato?.Id != null) {
      local.id = response.data.Dato.Id
    }
    guardarRegistro('macromedidores', local)
    volver()
  } catch (error) {
    console.error('Error al guardar macromedidores:', error)
    if (error.response) {
      Utils.notificacion(
        error.response.data?.Mensaje || 'No se pudo guardar el registro.',
        false,
      )
    } else {
      Utils.notificacion('No se pudo conectar con el servidor.', false)
    }
  } finally {
    guardando.value = false
    Utils.loadingNotify(false, '')
  }
}

onMounted(cargar)
</script>

<style scoped>
.registro-page {
  max-width: 1400px;
  margin: 0 auto;
}

.text-slate {
  color: var(--hs-text);
}

.form-section {
  padding: 18px 18px 20px;
}

.section-head {
  gap: 12px;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(38, 166, 154, 0.14);
  color: var(--hs-primary);
}

.section-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--hs-text);
  line-height: 1.2;
}

.section-sub {
  font-size: 0.82rem;
  color: var(--hs-text-muted);
}

.mm-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.mm-card {
  border: 1px solid var(--hs-border);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.mm-card__title {
  text-align: center;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(--hs-text);
  padding: 10px 8px;
  border-bottom: 2px solid rgba(38, 166, 154, 0.45);
  background: #f8fafc;
}

.mm-card__cols {
  display: grid;
  grid-template-columns: 1.4fr 0.9fr;
  min-height: 168px;
}

.mm-col {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f1f5f9;
}

.lectura-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lectura-wrap--bloqueada {
  opacity: 0.72;
}

.sin-dato-overlay--readonly {
  cursor: default;
  pointer-events: none;
}

.lectura-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  min-height: 18px;
}

.input-decimal__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  margin: 0 0 0 2px;
  line-height: 1.2;
}

.btn-marcar-sd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: 1px solid #fb8c00;
  border-radius: 6px;
  background: #fff;
  color: #ef6c00;
  cursor: pointer;
  flex: 0 0 auto;
  transition: background 0.15s ease;
}

.btn-marcar-sd:hover {
  background: #fff3e0;
}

.lectura-field {
  position: relative;
  min-height: 40px;
}

.sin-dato-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-height: 40px;
  margin: 0;
  padding: 0 8px;
  border: 1.5px solid #ef6c00;
  border-radius: 4px;
  background: #ffe0b2;
  color: #bf360c;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: none;
}

.sin-dato-overlay:hover {
  background: #ffcc80;
}

.lectura-anterior {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
  border-radius: 4px;
  background: #e8eef3;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.mm-col--calc {
  background: #fff;
  border-left: 1px solid var(--hs-border);
  align-items: center;
  justify-content: flex-start;
}

.mm-col__head {
  font-size: 0.72rem;
  font-weight: 700;
  text-align: center;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.mm-calc {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--hs-text);
  width: 100%;
  padding: 8px 4px;
}

@media (max-width: 1199px) {
  .mm-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 799px) {
  .mm-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 599px) {
  .form-section {
    padding: 14px;
  }

  .mm-grid {
    grid-template-columns: 1fr;
  }
}
</style>
