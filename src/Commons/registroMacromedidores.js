import { esSinDato, SIN_DATO } from '@/config/planta'
import { obtenerIdPlantaTratamiento } from '@/config/app'

/** Serializa lectura: número, "Sin Dato" o null. */
function valorLectura(v) {
  if (v === null || v === undefined || v === '') return null
  if (esSinDato(v)) return SIN_DATO
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

/**
 * Paquete para POST registro-macromedidores (.NET).
 * {
 *   IdPlantaTratamiento, IdUsuario, Hora,
 *   Registros: [{ IdMacroMedidor, Lectura1, Lectura2, Lectura3 }]
 * }
 */
export function construirPaqueteMacromedidores(form, usuarioSesion = null) {
  return {
    IdPlantaTratamiento: form.idPlantaTratamiento ?? obtenerIdPlantaTratamiento(usuarioSesion),
    IdUsuario: form.idUsuario ?? usuarioSesion?.IdUsuario ?? null,
    Hora: form.hora || '06:00',
    Registros: (form.medidores || []).map((m) => ({
      IdMacroMedidor: m.idMacromedidor ?? m.IdMacroMedidor ?? m.IdMacromedidor ?? null,
      Lectura1: valorLectura(m.acumulado1),
      Lectura2: valorLectura(m.acumulado2),
      Lectura3: valorLectura(m.acumulado3),
    })),
  }
}
