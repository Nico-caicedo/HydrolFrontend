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
              Registro diario de operaciones de planta
            </div>
          </div>
        </div>
      </div>
      <div class="col-auto row q-gutter-sm">
        <q-btn flat no-caps label="Cancelar" color="grey-7" @click="volver" />
        <q-btn unelevated no-caps icon="save" label="Guardar" class="btn-gradient" :loading="guardando"
          :disable="guardando" @click="guardar" />
      </div>
    </div>

    <!-- Datos generales -->
    <section class="hs-card form-section q-mb-md">
      <div class="section-head row items-center q-mb-md">
        <div class="section-icon flex flex-center">
          <q-icon name="event_note" size="20px" />
        </div>
        <div>
          <div class="section-title">Datos generales</div>
          <div class="section-sub">Información básica del registro</div>
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-4 col-md-2">
          <q-input v-model="form.fecha" type="date" outlined dense label="Fecha" readonly disable
            class="input-calculado" />
        </div>
        <div class="col-12 col-sm-4 col-md-2">
          <q-input v-model="form.hora" outlined dense label="Hora (24h)" hint="Hora exacta del sistema" readonly disable
            class="input-calculado" />
        </div>
        <div class="col-12 col-sm-4 col-md-3">
          <q-input v-model="form.operador" outlined dense label="Operador" readonly disable class="input-calculado" />
        </div>
        <div class="col-12 col-md-5">
          <q-input v-model="form.observaciones" type="textarea" outlined dense autogrow label="Observaciones" />
        </div>
      </div>
    </section>

    <!-- Caudal + Calidad lado a lado -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-lg-7">
        <section class="hs-card form-section full-height">
          <div class="section-head row items-center q-mb-md">
            <div class="section-icon flex flex-center">
              <q-icon name="water" size="20px" />
            </div>
            <div>
              <div class="section-title">Caudal (L/s)</div>
              <div class="section-sub">Aducción, agua a tratar y agua producida</div>
            </div>
          </div>

          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col-12 col-sm-4">
              <InputDecimal v-model="form.aduccion" :decimals="0" label="Aducción" :rules="[req]" />
            </div>
          </div>

          <div class="subsection-label q-mb-sm">A tratar</div>
          <div class="row q-col-gutter-sm q-mb-md">
            <div class="col">
              <InputDecimal v-model="form.tratarModulo500" :decimals="0" label="Módulo 500" :rules="[req]" />
            </div>
            <div class="col">
              <InputDecimal v-model="form.tratarModulo150" :decimals="0" label="Módulo 150" :rules="[req]" />
            </div>
            <div class="col">
              <InputDecimal :model-value="totalTratarCalc" :decimals="0" label="Total" readonly
                input-class="input-total" />
            </div>
          </div>

          <div class="subsection-label q-mb-sm">Producida</div>
          <div class="row q-col-gutter-sm">
            <div class="col">
              <InputDecimal :model-value="producidaModulo500Calc" :decimals="0" label="Módulo 500" readonly
                hint="Total − Módulo 150" input-class="input-calculado" />
            </div>
            <div class="col">
              <InputDecimal v-model="form.producidaModulo150" :decimals="0" label="Módulo 150" :rules="[req]" />
            </div>
            <div class="col">
              <InputDecimal v-model="form.totalProducida" :decimals="0" label="Total" placeholder="Ingresa el total"
                :rules="[req]" />
            </div>
          </div>
        </section>
      </div>

      <div class="col-12 col-lg-5">
        <section class="hs-card form-section full-height">
          <div class="section-head row items-center q-mb-md">
            <div class="section-icon flex flex-center">
              <q-icon name="opacity" size="20px" />
            </div>
            <div>
              <div class="section-title">Calidad física agua cruda</div>
              <div class="section-sub">Turbiedad, color aparente y pH</div>
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm">
              <InputDecimal v-model="form.turbiedadAguaCruda" :decimals="1" label="Turbiedad" suffix="UNT"
                :rules="[req]" />
            </div>
            <div class="col-12 col-sm">
              <InputDecimal v-model="form.colorAparenteAguaCruda" :decimals="1" label="Color aparente" suffix="UPC"
                :rules="[req]" />
            </div>
            <div class="col-12 col-sm">
              <InputDecimal v-model="form.phAguaCruda" :decimals="2" label="pH" :rules="[req]" />
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Policloruro -->
    <section class="hs-card form-section q-mb-md">
      <div class="section-head row items-center q-mb-md">
        <div class="section-icon flex flex-center">
          <q-icon name="science" size="20px" />
        </div>
        <div>
          <div class="section-title">Dosificación — Policloruro de aluminio</div>
          <div class="section-sub">Dosis calculada, densidad y descarga</div>
        </div>
      </div>

      <div class="subsection-label q-mb-sm">Dosis (mg/L - ppm)</div>
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-12 col-sm-4">
          <InputDecimal :model-value="dosisTotalCalc" :decimals="1" label="Total" suffix="mg/L" readonly disable
            hint="(Descarga Total / Agua a tratar) × ((1000/60)×Densidad)" input-class="input-calculado" />
        </div>
        <div class="col-12 col-sm-4">
          <InputDecimal :model-value="dosisModulo500Calc" :decimals="1" label="Módulo 500" suffix="mg/L" readonly
            disable hint="(Descarga M500 / Agua M500) × ((1000/60)×Densidad)" input-class="input-calculado" />
        </div>
        <div class="col-12 col-sm-4">
          <InputDecimal :model-value="dosisModulo150Calc" :decimals="1" label="Módulo 150" suffix="mg/L" readonly
            disable hint="(Descarga M150 / Agua M150) × ((1000/60)×Densidad)" input-class="input-calculado" />
        </div>
      </div>

      <div class="row q-col-gutter-sm">
        <div class="col-12 col-sm-3">
          <InputDecimal v-model="form.densidadPolicloruro" :decimals="2" label="Densidad" suffix="g/mL"
            :rules="[req]" />
        </div>
        <div class="col-6 col-sm-3">
          <InputDecimal v-model="form.descargaModulo500" :decimals="0" label="Descarga M500" suffix="mL/min"
            :rules="[req]" />
        </div>
        <div class="col-6 col-sm-3">
          <InputDecimal v-model="form.descargaModulo150" :decimals="0" label="Descarga M150" suffix="mL/min"
            :rules="[req]" />
        </div>
        <div class="col-6 col-sm-3">
          <InputDecimal :model-value="descargaTotalCalc" :decimals="0" label="Descarga total" suffix="mL/min" readonly
            hint="Módulo 500 + Módulo 150" input-class="input-calculado" />
        </div>
        <div class="col-6 col-sm-6">
          <InputDecimal :model-value="descargaGMinCalc" :decimals="0" label="g/min" suffix="g/min" readonly
            hint="Descarga Total × Densidad" input-class="input-calculado" />
        </div>
        <div class="col-12 col-sm-6">
          <InputDecimal :model-value="descargaKgHCalc" :decimals="1" label="kg/h" suffix="kg/h" readonly
            hint="g/min × 60 / 1000" input-class="input-calculado" />
        </div>
      </div>
    </section>

    <!-- Cal + Cloro lado a lado -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-lg-7">
        <section class="hs-card form-section full-height">
          <div class="insumo-title q-mb-md">Cal hidratada</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6 col-md-4">
              <InputDecimal :model-value="calDosisCaoh2Calc" :decimals="1" label="Dosis como Ca(OH)₂" suffix="mg/L"
                readonly disable hint="(Descarga / Aducción) × (1000/60) × Densidad × Lechada × Pureza"
                input-class="input-calculado" />
            </div>
            <div class="col-6 col-sm-6 col-md-4">
              <InputDecimal v-model="form.calPorcentajeLechada" :decimals="1" label="(% p/v lechada)" suffix="%"
                :rules="[req]" />
            </div>
            <div class="col-6 col-sm-6 col-md-4">
              <InputDecimal v-model="form.calPureza" :decimals="1" label="% Pureza Ca(OH)₂" suffix="%" :rules="[req]" />
            </div>
            <div class="col-6 col-sm-6 col-md-4">
              <InputDecimal v-model="form.calDensidad" :decimals="2" label="Densidad" suffix="g/mL" :rules="[req]" />
            </div>
            <div class="col-6 col-sm-6 col-md-4">
              <InputDecimal v-model="form.calDescarga" :decimals="0" label="Descarga" suffix="mL/min" :rules="[req]" />
            </div>
            <div class="col-12 col-sm-6 col-md-4">
              <InputDecimal :model-value="calKgHCalc" :decimals="1" label="Ca(OH)₂" suffix="kg/h" readonly disable
                hint="Densidad × Descarga × (60/1000) × Lechada" input-class="input-calculado" />
            </div>
          </div>
        </section>
      </div>

      <div class="col-12 col-lg-5">
        <section class="hs-card form-section full-height">
          <div class="insumo-title q-mb-md">Cloro gaseoso</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6 col-md">
              <InputDecimal :model-value="cloroMgLCalc" :decimals="2" label="mg/L" suffix="mg/L" readonly disable
                hint="(Lb/día ÷ Producida) × (453.6 × 1000 / 86400)" input-class="input-calculado" />
            </div>
            <div class="col-12 col-sm-6 col-md">
              <InputDecimal v-model="form.cloroLbDia" :decimals="0" label="lb/día" suffix="lb/día" :rules="[req]" />
            </div>
            <div class="col-12 col-sm-6 col-md">
              <InputDecimal :model-value="cloroKgHCalc" :decimals="1" label="kg/h" suffix="kg/h" readonly disable
                hint="Lb/día × 0.4536 / 24" input-class="input-calculado" />
            </div>
            <div class="col-12 col-sm-6 col-md">
              <InputDecimal v-model="form.cloroCrl" :decimals="1" label="CRL" suffix="mg/L" :rules="[req]" />
            </div>
          </div>
        </section>
      </div>
    </div>

    <div class="row justify-end q-gutter-sm q-mt-sm q-mb-lg">
      <q-btn flat no-caps label="Cancelar" color="grey-7" @click="volver" />
      <q-btn unelevated no-caps icon="save" label="Guardar" class="btn-gradient" :loading="guardando"
        :disable="guardando" @click="guardar" />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Utils from '@/Commons/Utils'
import { api } from '@/boot/axios'
import { guardarRegistro, obtenerRegistro } from '@/Commons/plantaStorage'
import { construirPaqueteRegistroDiario } from '@/Commons/registroDiarioOperacion'
import { obtenerIdPlantaTratamiento } from '@/config/app'
import {
  crearRegistroOperacionVacio,
  fechaHoyLocal,
  horaExactaActual,
  normalizarHoraExacta,
  totalTratar,
  calcProducidaModulo500,
  calcDescargaTotal,
  calcDosisTotal,
  calcDosisModulo500,
  calcDosisModulo150,
  calcDescargaGMin,
  calcDescargaKgH,
  calcCalDosisCaoh2,
  calcCalKgH,
  calcCloroMgL,
  calcCloroKgH,
} from '@/config/planta'
import InputDecimal from '@/components/InputDecimal.vue'

const route = useRoute()
const router = useRouter()

const form = reactive(crearRegistroOperacionVacio())
const esEdicion = ref(false)
const guardando = ref(false)
const usuarioSesion = ref(null)

const nombreOperadorSesion = (usuario) => {
  if (!usuario) return ''
  return (
    usuario.NombreCompleto ||
    usuario.NombreUsuario ||
    usuario.LoginUsuario ||
    usuario.Usuario ||
    ''
  )
}

const req = (val) => {
  if (val === null || val === undefined || val === '') return 'Campo requerido'
  return true
}

const totalTratarCalc = computed(() => totalTratar(form))
const producidaModulo500Calc = computed(() => calcProducidaModulo500(form))
const descargaTotalCalc = computed(() => calcDescargaTotal(form))
const dosisTotalCalc = computed(() => calcDosisTotal(form))
const dosisModulo500Calc = computed(() => calcDosisModulo500(form))
const dosisModulo150Calc = computed(() => calcDosisModulo150(form))
const descargaGMinCalc = computed(() => calcDescargaGMin(form))
const descargaKgHCalc = computed(() => calcDescargaKgH(form))
const calDosisCaoh2Calc = computed(() => calcCalDosisCaoh2(form))
const calKgHCalc = computed(() => calcCalKgH(form))
const cloroMgLCalc = computed(() => calcCloroMgL(form))
const cloroKgHCalc = computed(() => calcCloroKgH(form))

const volver = () => {
  router.push({ path: '/planta', query: { seccion: 'operaciones' } })
}

const cargar = async () => {
  const usuario = await Utils.datoUsuario()
  if (!usuario) {
    Utils.notificacion('Debes iniciar sesión para registrar operaciones', false)
    router.push('/login')
    return
  }

  usuarioSesion.value = usuario
  const operador = nombreOperadorSesion(usuario)
  const id = route.params.id
  const idPlanta = obtenerIdPlantaTratamiento(usuario)

  if (!id || id === 'nuevo') {
    Object.assign(form, crearRegistroOperacionVacio(operador))
    form.fecha = fechaHoyLocal()
    form.hora = horaExactaActual()
    form.operador = operador
    form.idUsuario = usuario.IdUsuario ?? null
    form.idPlantaTratamiento = idPlanta
    esEdicion.value = false
    return
  }

  const existente = obtenerRegistro('operaciones', id)
  if (!existente) {
    Utils.notificacion('No se encontró el registro', false)
    volver()
    return
  }

  esEdicion.value = true
  Object.assign(form, {
    ...crearRegistroOperacionVacio(operador),
    ...existente,
    fecha: existente.fecha || fechaHoyLocal(),
    hora: normalizarHoraExacta(existente.hora),
    operador: existente.operador || operador,
    idUsuario: existente.idUsuario ?? usuario.IdUsuario ?? null,
    idPlantaTratamiento: existente.idPlantaTratamiento ?? idPlanta,
  })
}

const armarPayloadLocal = () => ({
  ...form,
  hora: normalizarHoraExacta(form.hora),
  totalTratar: totalTratar(form),
  producidaModulo500: calcProducidaModulo500(form),
  descargaTotal: calcDescargaTotal(form),
  dosisTotal: calcDosisTotal(form),
  dosisModulo500: calcDosisModulo500(form),
  dosisModulo150: calcDosisModulo150(form),
  descargaGMin: calcDescargaGMin(form),
  descargaKgH: calcDescargaKgH(form),
  calDosisCaoh2: calcCalDosisCaoh2(form),
  calKgH: calcCalKgH(form),
  cloroMgL: calcCloroMgL(form),
  cloroKgH: calcCloroKgH(form),
  Cloro : {
    MgL: form.cloroLbDia,
    KgH: form.cloroCrl,
  },
  idUsuario: form.idUsuario ?? usuarioSesion.value?.IdUsuario ?? null,
  idPlantaTratamiento:
    form.idPlantaTratamiento ?? obtenerIdPlantaTratamiento(usuarioSesion.value),
})


const guardar = async () => {
  if (!form.fecha || !form.hora || !form.operador?.trim()) {
    Utils.notificacion('Faltan datos generales del registro (fecha, hora u operador)', false)
    return
  }

  const local = armarPayloadLocal()
  delete local.turno

  const paquete = construirPaqueteRegistroDiario(local, usuarioSesion.value)

  try {
    guardando.value = true
    Utils.loadingNotify(true, 'Guardando registro...')

    const response = await api.post('operaciones-planta/registro-diario-operacion', paquete)

    const ok = response.data?.IsExito !== false
    Utils.notificacion(
      response.data?.Mensaje || (ok ? 'Registro guardado' : 'No se pudo guardar'),
      ok,
    )

    if (!ok) return

    // Conserva copia local para el listado
    if (response.data?.Dato?.IdRegistro != null) {
      local.id = response.data.Dato.IdRegistro
    }
    guardarRegistro('operaciones', local)
    volver()
  } catch (error) {
    console.error('Error guardando registro diario:', error)
    if (error.response) {
      Utils.notificacion(
        error.response.data?.Mensaje || 'Error al guardar en el servidor.',
        false,
      )
    } else if (error.request) {
      Utils.notificacion('No se pudo conectar con el servidor. Verifica tu conexión.', false)
    } else {
      Utils.notificacion('Ocurrió un error inesperado al guardar.', false)
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

.full-height {
  height: 100%;
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

.section-icon--muted {
  background: #eef2f7;
  color: #94a3b8;
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

.subsection-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.insumo-title {
  font-size: 0.92rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--hs-primary-dark, #00897b);
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(38, 166, 154, 0.1);
  border: 1px solid rgba(38, 166, 154, 0.2);
}

.input-total :deep(.q-field__control),
.input-calculado :deep(.q-field__control) {
  background: #f1f5f9;
}

.input-calculado :deep(.q-field--disabled) {
  opacity: 1;
}

.input-calculado :deep(.q-field--disabled .q-field__control) {
  background: #f1f5f9 !important;
}

.form-section--placeholder {
  border-style: dashed;
  background: #f8fafc;
}

@media (max-width: 599px) {
  .form-section {
    padding: 14px;
  }
}
</style>
