import { api } from '@/boot/axios'
import { normalizarHoraExacta, soloFecha } from '@/config/planta'
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
      M150: n(form.producidaModulo150),
      Total: n(form.totalProducida),
    },
    CalidadAgua: {
      Turb: n(form.turbiedadAguaCruda),
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
      LbDia: n(form.cloroLbDia),
      CRL: n(form.cloroCrl),
    },
    IdUsuario: form.idUsuario ?? usuarioSesion?.IdUsuario ?? null,
    IdPlantaTratamiento: form.idPlantaTratamiento ?? obtenerIdPlantaTratamiento(usuarioSesion),
  }
}

const n = (v) => {
  if (v === null || v === undefined || v === '') return null
  const num = Number(v)
  return Number.isNaN(num) ? null : num
}

/** Formatea TimeSpan / hora API a HH:mm:ss. */
export function formatearHoraApi(hora) {
  if (hora == null || hora === '') return null
  const s = String(hora).trim()
  const match = s.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/)
  if (match) {
    return `${String(match[1]).padStart(2, '0')}:${match[2]}:${match[3] || '00'}`
  }
  return normalizarHoraExacta(hora)
}

/**
 * GET operaciones-planta/{idRegistro}/info-registro-diario
 */
export async function traerInfoRegistroDiario(idRegistro) {
  const response = await api.get(`operaciones-planta/${idRegistro}/info-registro-diario`)
  if (response.data?.IsExito === false) {
    throw new Error(response.data?.Mensaje || 'No se pudo cargar el registro')
  }
  return response.data?.Dato ?? response.data
}

/**
 * Mapea ERegistroDiario (API) al formulario de la vista.
 */
export function mapearRegistroDiarioApi(dato, idRegistro = null) {
  if (!dato) return null

  const atratar = dato.Atratar || dato.atratar || {}
  const producida = dato.Producida || dato.producida || {}
  const descarga = dato.Descarga || dato.descarga || {}
  const dosis = dato.Dosis || dato.dosis || {}
  const calidad = dato.CalidadAgua || dato.calidadAgua || {}
  const cal = dato.CalHidratada || dato.calHidratada || {}
  const cloro = dato.Cloro || dato.cloro || {}

  return {
    id: dato.IdRegistro ?? dato.idRegistro ?? idRegistro,
    idUsuario: dato.IdUsuario ?? dato.idUsuario ?? null,
    idPlantaTratamiento: dato.IdPlantaTratamiento ?? dato.idPlantaTratamiento ?? null,
    fecha: soloFecha(dato.FechaC ?? dato.fechaC ?? dato.Fecha ?? dato.fecha),
    hora: formatearHoraApi(dato.Hora ?? dato.hora),
    operador: dato.Operador ?? dato.operador ?? '',
    observaciones: dato.Observaciones ?? dato.observaciones ?? '',
    aduccion: n(dato.Aduccion ?? dato.aduccion),
    tratarModulo500: n(atratar.M500 ?? atratar.m500),
    tratarModulo150: n(atratar.M150 ?? atratar.m150),
    totalTratar: n(atratar.Total ?? atratar.total),
    producidaModulo150: n(producida.M150 ?? producida.m150),
    producidaModulo500: n(producida.M500 ?? producida.m500),
    totalProducida: n(producida.Total ?? producida.total),
    turbiedadAguaCruda: n(calidad.Turb ?? calidad.turb ?? calidad.Turbiedad ?? calidad.turbiedad),
    colorAparenteAguaCruda: n(calidad.Color ?? calidad.color),
    phAguaCruda: n(calidad.Ph ?? calidad.ph),
    densidadPolicloruro: n(dato.DensidadPAC ?? dato.densidadPAC),
    descargaModulo500: n(descarga.M500 ?? descarga.m500),
    descargaModulo150: n(descarga.M150 ?? descarga.m150),
    descargaTotal: n(descarga.Total ?? descarga.total),
    dosisTotal: n(dosis.Total ?? dosis.total),
    dosisModulo500: n(dosis.M500 ?? dosis.m500),
    dosisModulo150: n(dosis.M150 ?? dosis.m150),
    descargaGMin: n(dato.GMin ?? dato.gMin),
    descargaKgH: n(dato.KgH ?? dato.kgH),
    calDosisCaoh2: n(cal.ComoCa ?? cal.comoCa),
    calPorcentajeLechada: n(cal.Lechada ?? cal.lechada),
    calPureza: n(cal.PurezaCa ?? cal.purezaCa),
    calDensidad: n(cal.Densidad ?? cal.densidad),
    calDescarga: n(cal.Descarga ?? cal.descarga),
    calKgH: n(cal.CaOH ?? cal.caOH ?? cal.CaOh),
    cloroMgL: n(cloro.MgL ?? cloro.mgL),
    cloroLbDia: n(cloro.LbDia ?? cloro.lbDia),
    cloroKgH: n(cloro.KgH ?? cloro.kgH),
    cloroCrl: n(cloro.CRL ?? cloro.Crl ?? cloro.crl),
    raw: dato,
  }
}

/**
 * Normaliza listado de {idPlanta}/{tipo}/traer-registro (tipo operaciones = 1).
 */
export function mapearRegistrosOperacionesApi(lista) {
  const items = Array.isArray(lista)
    ? lista
    : Array.isArray(lista?.Dato)
      ? lista.Dato
      : []

  return items.map((item, idx) => ({
    id: item.IdRegistro ?? item.Id ?? item.id ?? idx + 1,
    fecha: soloFecha(item.FechaC ?? item.fechaC ?? item.Fecha ?? item.fecha),
    hora: formatearHoraApi(item.Hora ?? item.hora),
    operador: item.Operador ?? item.operador ?? '',
    idUsuario: item.IdUsuario ?? item.idUsuario ?? null,
    idPlantaTratamiento: item.IdPlantaTratamiento ?? item.idPlantaTratamiento ?? null,
    raw: item,
  }))
}
