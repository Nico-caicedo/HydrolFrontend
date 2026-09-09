import {
  esSinDato,
  evaluarFormulaM3Dia,
  HORAS_LECTURA_MACROMEDIDOR,
  SIN_DATO,
} from '@/config/planta'
import { obtenerIdPlantaTratamiento } from '@/config/app'
import { api } from '@/boot/axios'

/**
 * Promedio de m³/día históricos (>0) cuando Lectura3 no está en rango vs LecturaAnterior.
 * GET operaciones-planta/{idMacroMedidor}/promedio-m3-dia
 */
export async function traerPromedioM3Dia(idMacroMedidor) {
  if (idMacroMedidor == null || idMacroMedidor === '') return null
  const response = await api.get(`operaciones-planta/${idMacroMedidor}/promedio-m3-dia`)
  if (response.data?.IsExito === false) {
    throw new Error(response.data?.Mensaje || 'No se pudo obtener el promedio m³/día')
  }
  const dato = response.data?.Dato ?? response.data
  if (dato == null || dato === '') return 0
  if (typeof dato === 'number') return dato
  const n = Number(
    dato.Promedio ??
      dato.promedio ??
      dato.M3Dia ??
      dato.m3Dia ??
      dato.Valor ??
      dato.valor ??
      dato,
  )
  return Number.isNaN(n) ? 0 : n
}

/**
 * Calcula m³/día en el medidor: delta local o promedio vía API.
 * Equivalente a CalcularFormula(c15, c12, rangoD):
 *   c15 = LecturaAnterior (lectura3Anterior), c12 = Lectura3 (acumulado3)
 * Escribe medidor.m3Dia / m3DiaFuente / m3DiaCargando.
 */
export async function aplicarM3DiaMedidor(medidor) {
  if (!medidor) return null

  const lectura3 =
    medidor.acumulado3 ?? medidor.Lectura3 ?? medidor.lectura3 ?? null
  const lecturaAnterior =
    medidor.lectura3Anterior ??
    medidor.LecturaAnterior ??
    medidor.lecturaAnterior ??
    null

  const r = evaluarFormulaM3Dia(lecturaAnterior, lectura3)

  if (r.modo === 'vacio') {
    medidor.m3Dia = null
    medidor.m3DiaFuente = null
    medidor.m3DiaCargando = false
    return null
  }

  if (r.modo === 'delta') {
    medidor.m3Dia = r.valor
    medidor.m3DiaFuente = 'delta'
    medidor.m3DiaCargando = false
    return r.valor
  }

  medidor.m3DiaCargando = true
  try {
    const promedio = await traerPromedioM3Dia(medidor.idMacromedidor)
    medidor.m3Dia = promedio
    medidor.m3DiaFuente = 'promedio'
    return promedio
  } catch (error) {
    console.error('Error al traer promedio m³/día:', error)
    medidor.m3Dia = null
    medidor.m3DiaFuente = null
    throw error
  } finally {
    medidor.m3DiaCargando = false
  }
}

/** Recalcula m³/día de todos los medidores (en paralelo). */
export async function aplicarM3DiaMedidores(medidores) {
  await Promise.all((medidores || []).map((m) => aplicarM3DiaMedidor(m).catch(() => null)))
}

/**
 * Serializa lectura: número, "Sin Dato" o 0 si viene vacío.
 * @param {*} v
 * @param {{ vacioComoCero?: boolean }} [opts]
 */
export function valorLectura(v, { vacioComoCero = true } = {}) {
  if (esSinDato(v)) return SIN_DATO
  if (v === null || v === undefined || v === '') {
    return vacioComoCero ? 0 : null
  }
  const n = Number(v)
  if (Number.isNaN(n)) return vacioComoCero ? 0 : null
  return n
}

/** True si el campo editable está vacío (no capturado ni Sin Dato). */
export function lecturaVacia(v) {
  return v === null || v === undefined || v === ''
}

/** True si la lectura se enviará / interpreta como 0 (vacío o cero numérico). */
export function lecturaEsCero(v) {
  if (esSinDato(v)) return false
  if (lecturaVacia(v)) return true
  return Number(v) === 0
}

/**
 * Rellena con 0 los campos vacíos del turno activo (no toca "Sin Dato").
 * Devuelve la lista de medidores afectados.
 */
export function aplicarCeroEnCamposVacios(medidores, campoLectura) {
  const afectados = []
  for (const m of medidores || []) {
    if (!lecturaVacia(m[campoLectura])) continue
    m[campoLectura] = 0
    afectados.push(m)
  }
  return afectados
}

/** Medidores cuya lectura del turno es 0 (incluye vacíos ya convertidos). */
export function medidoresConLecturaCero(medidores, campoLectura) {
  return (medidores || []).filter((m) => lecturaEsCero(m[campoLectura]))
}

/** Campo interno → propiedad API de la lectura. */
const CAMPO_A_LECTURA_API = {
  acumulado1: 'Lectura1',
  acumulado2: 'Lectura2',
  acumulado3: 'Lectura3',
}

/**
 * Paquete para POST registro-macromedidores (.NET) — alta con Lectura1.
 * {
 *   IdPlantaTratamiento, IdUsuario, Hora,
 *   Registros: [{ IdMacroMedidor, Lectura1, Lectura2, Lectura3 }]
 * }
 */
export function construirPaqueteMacromedidores(form, usuarioSesion = null) {
  return {
    IdRegistro: form.id ?? null,
    IdPlantaTratamiento: form.idPlantaTratamiento ?? obtenerIdPlantaTratamiento(usuarioSesion),
    IdUsuario: form.idUsuario ?? usuarioSesion?.IdUsuario ?? null,
    Hora: form.hora || '06:00',
    Registros: (form.medidores || []).map((m) => ({
      IdMacroMedidor: m.idMacromedidor ?? m.IdMacroMedidor ?? m.IdMacromedidor ?? null,
      Lectura1: valorLectura(m.acumulado1),
      // Turnos aún no capturados: null (no forzar 0)
      Lectura2: valorLectura(m.acumulado2, { vacioComoCero: false }),
      Lectura3: valorLectura(m.acumulado3, { vacioComoCero: false }),
    })),
  }
}

/**
 * Paquete para POST registro-macromedidores-actualizar (.NET) — Lectura2 o Lectura3.
 * {
 *   IdRegistro, IdUsuario, Hora,
 *   Registros: [{ IdRegistroMacroMedidor, IdMacroMedidor, Lectura2|Lectura3 }]
 * }
 */
export function construirPaqueteMacromedidoresActualizar(
  form,
  campoLectura,
  usuarioSesion = null,
) {
  const propLectura = CAMPO_A_LECTURA_API[campoLectura]
  if (!propLectura || propLectura === 'Lectura1') {
    throw new Error('La actualización solo aplica a Lectura2 o Lectura3')
  }

  return {
    IdRegistro: form.id ?? null,
    IdUsuario: form.idUsuario ?? usuarioSesion?.IdUsuario ?? null,
    Hora: form.hora || HORAS_LECTURA_MACROMEDIDOR[campoLectura] || null,
    Registros: (form.medidores || []).map((m) => ({
      IdRegistroMacroMedidor:
        m.idRegistroMacroMedidor ?? m.IdRegistroMacroMedidor ?? null,
      IdMacroMedidor: m.idMacromedidor ?? m.IdMacroMedidor ?? m.IdMacromedidor ?? null,
      [propLectura]: valorLectura(m[campoLectura]),
    })),
  }
}
