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
              Calidad de agua de procesos
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

    <!-- Datos generales -->
    <section class="hs-card form-section q-mb-md">
      <div class="section-head row items-center q-mb-md">
        <div class="section-icon flex flex-center">
          <q-icon name="event_note" size="20px" />
        </div>
        <div>
          <div class="section-title">Datos generales</div>
          <div class="section-sub">Fecha y hora del muestreo</div>
        </div>
      </div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-sm-4">
          <q-input
            v-model="form.fecha"
            type="date"
            outlined
            dense
            label="Fecha"
            readonly
            disable
            class="input-calculado"
          />
        </div>
        <div class="col-12 col-sm-4">
          <q-input
            v-model="form.hora"
            outlined
            dense
            label="Hora"
            hint="Hora exacta del sistema"
            readonly
            disable
            class="input-calculado"
          />
        </div>
      </div>
    </section>

    <!-- Calidad agua cruda + Vortex lado a lado -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-7">
        <section class="hs-card form-section full-height">
          <div class="section-head row items-center q-mb-md">
            <div class="section-icon flex flex-center">
              <q-icon name="water_drop" size="20px" />
            </div>
            <div>
              <div class="section-title">Calidad agua cruda</div>
              <div class="section-sub">Turbiedad, color, pH, alcalinidad y conductividad</div>
            </div>
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col">
              <InputDecimal v-model="form.turbCruda" :decimals="2" label="Turb (UNT)" />
            </div>
            <div class="col">
              <InputDecimal v-model="form.colorCruda" :decimals="1" label="Color (UPC)" />
            </div>
            <div class="col">
              <InputDecimal v-model="form.phCruda" :decimals="2" label="pH" />
            </div>
            <div class="col">
              <InputDecimal v-model="form.alcalCruda" :decimals="1" label="Alcal (mg/L)" />
            </div>
            <div class="col">
              <InputDecimal v-model="form.condCruda" :decimals="1" label="Cond (µS/cm)" />
            </div>
          </div>
        </section>
      </div>

      <div class="col-12 col-md-5">
        <section class="hs-card form-section full-height">
          <div class="section-head row items-center q-mb-md">
            <div class="section-icon flex flex-center">
              <q-icon name="sync" size="20px" />
            </div>
            <div>
              <div class="section-title">Vortex</div>
              <div class="section-sub">Turbiedad y pH de entrada / salida</div>
            </div>
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.turbEntradaVortex" :decimals="2" label="Turb. entrada (UNT)" />
            </div>
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.phEntradaVortex" :decimals="2" label="pH entrada" />
            </div>
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.turbSalidaVortex" :decimals="2" label="Turb. salida (UNT)" />
            </div>
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.phSalidaVortex" :decimals="2" label="pH salida" />
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Encalada / coagulada / floculada — inputs a lo ancho -->
    <section class="hs-card form-section q-mb-md">
      <div class="section-head row items-center q-mb-md">
        <div class="section-icon flex flex-center">
          <q-icon name="science" size="20px" />
        </div>
        <div>
          <div class="section-title">Encalada, coagulada y floculada</div>
          <div class="section-sub">Parámetros intermedios del proceso</div>
        </div>
      </div>

      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-sm-4 col-md">
          <InputDecimal v-model="form.alcalinidadEncalada" :decimals="1" label="Alcalinidad agua encalada (mg/L)" />
        </div>
        <div class="col-6 col-sm-4 col-md">
          <div class="subsection-label q-mb-xs">pH coagulada</div>
          <InputDecimal v-model="form.phCoagulada500" :decimals="2" label="500 L/s" />
        </div>
        <div class="col-6 col-sm-4 col-md">
          <div class="subsection-label q-mb-xs invisible-md">pH coagulada</div>
          <InputDecimal v-model="form.phCoagulada150" :decimals="2" label="150 L/s" />
        </div>
        <div class="col-6 col-sm-4 col-md">
          <div class="subsection-label q-mb-xs">Turb. floculada (UNT)</div>
          <InputDecimal v-model="form.turbFloculada500" :decimals="2" label="500 L/s" />
        </div>
        <div class="col-6 col-sm-4 col-md">
          <div class="subsection-label q-mb-xs invisible-md">Turb. floculada (UNT)</div>
          <InputDecimal v-model="form.turbFloculada150" :decimals="2" label="150 L/s" />
        </div>
      </div>
    </section>

    <!-- Clarificada — módulos lado a lado -->
    <section class="hs-card form-section q-mb-md">
      <div class="section-head row items-center q-mb-md">
        <div class="section-icon flex flex-center">
          <q-icon name="filter_alt" size="20px" />
        </div>
        <div>
          <div class="section-title">Calidad agua clarificada</div>
          <div class="section-sub">Turbiedad y color por sedimentador</div>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-7">
          <div class="insumo-title q-mb-sm">Módulo 500 L/s</div>
          <div class="row q-col-gutter-sm">
            <div
              v-for="sed in [1, 2, 3, 4, 5]"
              :key="`c500-${sed}`"
              class="col-12 col-sm-6 col-lg"
            >
              <div class="sed-card">
                <div class="subsection-label q-mb-sm">Sed. No. {{ sed }}</div>
                <InputDecimal
                  v-model="form[`clarif500Sed${sed}Turb`]"
                  :decimals="2"
                  label="Turb (UNT)"
                  class="q-mb-sm"
                />
                <InputDecimal
                  v-model="form[`clarif500Sed${sed}Color`]"
                  :decimals="1"
                  label="Color (UPC)"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-5">
          <div class="insumo-title q-mb-sm">Módulo 150 L/s</div>
          <div class="row q-col-gutter-sm">
            <div
              v-for="sed in [1, 2]"
              :key="`c150-${sed}`"
              class="col-12 col-sm-6"
            >
              <div class="sed-card">
                <div class="subsection-label q-mb-sm">Sed. No. {{ sed }}</div>
                <InputDecimal
                  v-model="form[`clarif150Sed${sed}Turb`]"
                  :decimals="2"
                  label="Turb (UNT)"
                  class="q-mb-sm"
                />
                <InputDecimal
                  v-model="form[`clarif150Sed${sed}Color`]"
                  :decimals="1"
                  label="Color (UPC)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filtrada — módulos lado a lado -->
    <section class="hs-card form-section q-mb-md">
      <div class="section-head row items-center q-mb-md">
        <div class="section-icon flex flex-center">
          <q-icon name="opacity" size="20px" />
        </div>
        <div>
          <div class="section-title">Calidad agua filtrada</div>
          <div class="section-sub">Turbiedad, color, pH y Al³⁺ por módulo</div>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-6">
          <div class="insumo-title q-mb-sm">Módulo 500 L/s</div>
          <div class="row q-col-gutter-sm">
            <div class="col">
              <InputDecimal v-model="form.filtradaTurb500" :decimals="2" label="Turb (UNT)" />
            </div>
            <div class="col">
              <InputDecimal v-model="form.filtradaColor500" :decimals="1" label="Color (UPC)" />
            </div>
            <div class="col">
              <InputDecimal v-model="form.filtradaPh500" :decimals="2" label="pH" />
            </div>
            <div class="col">
              <InputDecimal v-model="form.filtradaAl3500" :decimals="2" label="Al³⁺ (mg/L)" />
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="insumo-title q-mb-sm">Módulo 150 L/s</div>
          <div class="row q-col-gutter-sm">
            <div class="col">
              <InputDecimal v-model="form.filtradaTurb150" :decimals="2" label="Turb (UNT)" />
            </div>
            <div class="col">
              <InputDecimal v-model="form.filtradaColor150" :decimals="1" label="Color (UPC)" />
            </div>
            <div class="col">
              <InputDecimal v-model="form.filtradaPh150" :decimals="2" label="pH" />
            </div>
            <div class="col">
              <InputDecimal v-model="form.filtradaAl3150" :decimals="2" label="Al³⁺ (mg/L)" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Salida tanques — lado a lado -->
    <section class="hs-card form-section q-mb-md">
      <div class="section-head row items-center q-mb-md">
        <div class="section-icon flex flex-center">
          <q-icon name="domain" size="20px" />
        </div>
        <div>
          <div class="section-title">Calidad agua salida tanques de almacenamiento</div>
          <div class="section-sub">Parámetros de tanque 1100 m³ y 4400 m³</div>
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-6">
          <div class="insumo-title q-mb-sm">Tanque 1100 m³</div>
          <div class="row q-col-gutter-sm">
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.tq1100Turb" :decimals="2" label="Turb (UNT)" />
            </div>
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.tq1100Color" :decimals="1" label="Color (UPC)" />
            </div>
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.tq1100Ph" :decimals="2" label="pH" />
            </div>
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.tq1100Cloro" :decimals="2" label="Cloro resid. libre (mg/L)" />
            </div>
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.tq1100Alcalinidad" :decimals="1" label="Alcalin (mg/L)" />
            </div>
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.tq1100Dureza" :decimals="1" label="Dureza (mg/L)" />
            </div>
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.tq1100Hierro" :decimals="2" label="Hierro (mg/L)" />
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="insumo-title q-mb-sm">Tanque 4400 m³</div>
          <div class="row q-col-gutter-sm">
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.tq4400Turb" :decimals="2" label="Turb (UNT)" />
            </div>
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.tq4400Color" :decimals="1" label="Color (UPC)" />
            </div>
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.tq4400Ph" :decimals="2" label="pH" />
            </div>
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.tq4400Cloro" :decimals="2" label="Cloro resid. libre (mg/L)" />
            </div>
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.tq4400Alcalinidad" :decimals="1" label="Alcalin (mg/L)" />
            </div>
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.tq4400Dureza" :decimals="1" label="Dureza (mg/L)" />
            </div>
            <div class="col-6 col-sm">
              <InputDecimal v-model="form.tq4400Hierro" :decimals="2" label="Hierro (mg/L)" />
            </div>
          </div>
        </div>
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
import { guardarRegistro, obtenerRegistro } from '@/Commons/plantaStorage'
import { construirPaqueteCalidadProcesos } from '@/Commons/registroCalidadProcesos'
import { obtenerIdPlantaTratamiento } from '@/config/app'
import {
  crearRegistroCalidadVacio,
  fechaHoyLocal,
  horaExactaActual,
  normalizarHoraExacta,
} from '@/config/planta'
import InputDecimal from '@/components/InputDecimal.vue'

const route = useRoute()
const router = useRouter()

const form = reactive(crearRegistroCalidadVacio())
const guardando = ref(false)
const usuarioSesion = ref(null)

const esEdicion = computed(() => route.params.id != null && route.params.id !== 'nuevo')

const volver = () => {
  router.push({ path: '/planta', query: { seccion: 'calidad' } })
}

const cargar = async () => {
  const usuario = await Utils.datoUsuario()
  usuarioSesion.value = usuario
  const idPlanta = obtenerIdPlantaTratamiento(usuario)
  const idUsuario = usuario?.IdUsuario ?? null

  if (esEdicion.value) {
    const existente = obtenerRegistro('calidad', route.params.id)
    if (!existente) {
      Utils.notificacion('Registro no encontrado', false)
      volver()
      return
    }
    Object.assign(form, {
      ...crearRegistroCalidadVacio({ idUsuario, idPlantaTratamiento: idPlanta }),
      ...existente,
      idUsuario: existente.idUsuario ?? idUsuario,
      idPlantaTratamiento: existente.idPlantaTratamiento ?? idPlanta,
      fecha: existente.fecha || fechaHoyLocal(),
      hora: normalizarHoraExacta(existente.hora),
    })
    return
  }

  Object.assign(form, crearRegistroCalidadVacio({ idUsuario, idPlantaTratamiento: idPlanta }))
  form.fecha = fechaHoyLocal()
  form.hora = horaExactaActual()
}

const construirLocal = () => ({
  ...form,
  hora: normalizarHoraExacta(form.hora),
  idUsuario: form.idUsuario ?? usuarioSesion.value?.IdUsuario ?? null,
  idPlantaTratamiento:
    form.idPlantaTratamiento ?? obtenerIdPlantaTratamiento(usuarioSesion.value),
})

const guardar = async () => {
  guardando.value = true
  Utils.loadingNotify(true, 'Guardando...')
  const local = construirLocal()
  const paquete = construirPaqueteCalidadProcesos(local, usuarioSesion.value)

  try {
    const response = await api.post('operaciones-planta/registro-calidad-procesos', paquete)
    Utils.notificacion(response.data.Mensaje, response.data.IsExito)
    if (!response.data.IsExito) return

    if (response.data.Dato?.Id != null) {
      local.id = response.data.Dato.Id
    }
    guardarRegistro('calidad', local)
    volver()
  } catch (error) {
    console.error('Error al guardar calidad de procesos:', error)
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
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.invisible-md {
  visibility: hidden;
}

.sed-card {
  padding: 10px;
  border: 1px solid var(--hs-border);
  border-radius: 10px;
  background: #f8fafc;
  height: 100%;
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

.input-calculado :deep(.q-field__control) {
  background: #f1f5f9;
}

.input-calculado :deep(.q-field--disabled) {
  opacity: 1;
}

.input-calculado :deep(.q-field--disabled .q-field__control) {
  background: #f1f5f9 !important;
}

@media (max-width: 1023px) {
  .invisible-md {
    visibility: visible;
    height: auto;
  }
}

@media (max-width: 599px) {
  .form-section {
    padding: 14px;
  }
}
</style>
