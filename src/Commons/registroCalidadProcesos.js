import { normalizarHoraExacta } from '@/config/planta'
import { obtenerIdPlantaTratamiento } from '@/config/app'

/**
 * Paquete para POST registro-calidad-procesos (.NET).
 */
export function construirPaqueteCalidadProcesos(form, usuarioSesion = null) {
  const n = (v) => (v === null || v === undefined || v === '' ? null : Number(v))

  return {
    Fecha: form.fecha,
    Hora: normalizarHoraExacta(form.hora),
    IdPlantaTratamiento: form.idPlantaTratamiento ?? obtenerIdPlantaTratamiento(usuarioSesion),
    IdUsuario: form.idUsuario ?? usuarioSesion?.IdUsuario ?? null,
    AguaCruda: {
      Turbiedad: n(form.turbCruda),
      Color: n(form.colorCruda),
      Ph: n(form.phCruda),
      Alcalinidad: n(form.alcalCruda),
      Conductividad: n(form.condCruda),
    },
    Vortex: {
      TurbiedadEntrada: n(form.turbEntradaVortex),
      PhEntrada: n(form.phEntradaVortex),
      TurbiedadSalida: n(form.turbSalidaVortex),
      PhSalida: n(form.phSalidaVortex),
    },
    AlcalinidadEncalada: n(form.alcalinidadEncalada),
    PhCoagulada: {
      M500: n(form.phCoagulada500),
      M150: n(form.phCoagulada150),
    },
    TurbiedadFloculada: {
      M500: n(form.turbFloculada500),
      M150: n(form.turbFloculada150),
    },
    AguaClarificada: {
      Modulo500: {
        Sed1: { Turbiedad: n(form.clarif500Sed1Turb), Color: n(form.clarif500Sed1Color) },
        Sed2: { Turbiedad: n(form.clarif500Sed2Turb), Color: n(form.clarif500Sed2Color) },
        Sed3: { Turbiedad: n(form.clarif500Sed3Turb), Color: n(form.clarif500Sed3Color) },
        Sed4: { Turbiedad: n(form.clarif500Sed4Turb), Color: n(form.clarif500Sed4Color) },
        Sed5: { Turbiedad: n(form.clarif500Sed5Turb), Color: n(form.clarif500Sed5Color) },
      },
      Modulo150: {
        Sed1: { Turbiedad: n(form.clarif150Sed1Turb), Color: n(form.clarif150Sed1Color) },
        Sed2: { Turbiedad: n(form.clarif150Sed2Turb), Color: n(form.clarif150Sed2Color) },
      },
    },
    AguaFiltrada: {
      Modulo500: {
        Turbiedad: n(form.filtradaTurb500),
        Color: n(form.filtradaColor500),
        Ph: n(form.filtradaPh500),
        Al3: n(form.filtradaAl3500),
      },
      Modulo150: {
        Turbiedad: n(form.filtradaTurb150),
        Color: n(form.filtradaColor150),
        Ph: n(form.filtradaPh150),
        Al3: n(form.filtradaAl3150),
      },
    },
    SalidaTanques: {
      Tanque1100: {
        Turbiedad: n(form.tq1100Turb),
        Color: n(form.tq1100Color),
        Ph: n(form.tq1100Ph),
        CloroResidualLibre: n(form.tq1100Cloro),
        Alcalinidad: n(form.tq1100Alcalinidad),
        Dureza: n(form.tq1100Dureza),
        Hierro: n(form.tq1100Hierro),
      },
      Tanque4400: {
        Turbiedad: n(form.tq4400Turb),
        Color: n(form.tq4400Color),
        Ph: n(form.tq4400Ph),
        CloroResidualLibre: n(form.tq4400Cloro),
        Alcalinidad: n(form.tq4400Alcalinidad),
        Dureza: n(form.tq4400Dureza),
        Hierro: n(form.tq4400Hierro),
      },
    },
  }
}
