import { normalizarHoraExacta } from '@/config/planta'
import { obtenerIdPlantaTratamiento } from '@/config/app'

/**
 * Construye el paquete para POST registro-diario-operacion (.NET).
 * Propiedades en PascalCase según convención del API del proyecto.
 */
export function construirPaqueteRegistroDiario(form, usuarioSesion = null) {
  const n = (v) => (v === null || v === undefined || v === '' ? null : Number(v))

  return {
    Hora: normalizarHoraExacta(form.hora),
    Aduccion: n(form.aduccion),
    Atratar: {
      M500: n(form.tratarModulo500),
      M150: n(form.tratarModulo150),
    },
    Producida: {
      M500: n(form.producidaModulo150),
      Total: n(form.totalProducida),
    },
    CalidadAgua: {
      Turbiedad: n(form.turbiedadAguaCruda),
      Color: n(form.colorAparenteAguaCruda),
      Ph: n(form.phAguaCruda),
    },
    DensidadPAC: n(form.densidadPolicloruro),
    Descarga: {
      M500: n(form.descargaModulo500),
      M150: n(form.descargaModulo150),
    },
    CalHidratada: {
      PurezaCa: n(form.calPureza),
      Densidad: n(form.calDensidad),
      Descarga: n(form.calDescarga),
      Lechada: n(form.calPorcentajeLechada),
    },
    Cloro: {
      MgL: n(form.cloroLbDia),
      KgH: n(form.cloroCrl),
    },
    IdUsuario: form.idUsuario ?? usuarioSesion?.IdUsuario ?? null,
    IdPlantaTratamiento: form.idPlantaTratamiento ?? obtenerIdPlantaTratamiento(usuarioSesion),
  }
}
