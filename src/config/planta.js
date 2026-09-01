export const SECCIONES_PLANTA = [
  {
    id: 'macromedidores',
    titulo: 'Registro macromedidores',
    descripcion: 'Lecturas acumuladas (3) y m³/día calculado por macromedidor.',
    icono: 'speed',
    color: '#26a69a',
  },
  {
    id: 'operaciones',
    titulo: 'Registro diario de operaciones',
    descripcion: 'Bitácora diaria de operación y novedades de planta.',
    icono: 'assignment',
    color: '#29b6f6',
  },
  {
    id: 'calidad',
    titulo: 'Calidad de agua de procesos',
    descripcion: 'Parámetros físico-químicos del proceso por etapa (cruda a tanques).',
    icono: 'science',
    color: '#5c6bc0',
  },
]

/** Tipos de registro para traer-registro (backend). */
export const TIPO_REGISTRO_PLANTA = {
  operaciones: 1,
  macromedidores: 2,
  calidad: 3,
}

/** Horas fijas de captura de macromedidores (orden = Lectura1..3). */
export const HORAS_LECTURA_MACROMEDIDOR = {
  acumulado1: '06:00',
  acumulado2: '14:00',
  acumulado3: '22:00',
}

/** En nuevo registro solo se captura la de las 6:00. */
export const CAMPO_LECTURA_NUEVO = 'acumulado1'

export function horaLecturaNuevoRegistro() {
  return HORAS_LECTURA_MACROMEDIDOR[CAMPO_LECTURA_NUEVO]
}

/** Mapea la hora del sistema al turno de lectura más cercano. */
export function horaLecturaSegunSistema() {
  const h = new Date().getHours()
  if (h < 10) return HORAS_LECTURA_MACROMEDIDOR.acumulado1
  if (h < 18) return HORAS_LECTURA_MACROMEDIDOR.acumulado2
  return HORAS_LECTURA_MACROMEDIDOR.acumulado3
}

/** Valor textual cuando no se pudo tomar lectura (no usar 0). */
export const SIN_DATO = 'Sin Dato'

export function esSinDato(valor) {
  if (valor == null || valor === '') return false
  return String(valor).trim().toLowerCase().replace(/\s+/g, ' ') === 'sin dato'
}

/** True si el valor es un número usable (incluye 0 real de lectura). */
export function esLecturaNumerica(valor) {
  if (valor === null || valor === undefined || valor === '' || esSinDato(valor)) return false
  return !Number.isNaN(Number(valor))
}

/**
 * m³/día = último acumulado − primer acumulado (consumo del periodo).
 * Si hay "Sin Dato", faltan valores o no hay cambio → null.
 */
export function calcM3DiaMacromedidor(medidor) {
  const a1 = medidor?.acumulado1
  const a3 = medidor?.acumulado3
  if (esSinDato(a1) || esSinDato(a3)) return null
  if (!esLecturaNumerica(a1) || !esLecturaNumerica(a3)) return null
  const delta = Number(a3) - Number(a1)
  if (Number.isNaN(delta) || delta === 0) return null
  return delta
}

/** Indica si el m³/día debe mostrarse como Sin Dato. */
export function m3DiaEsSinDato(medidor) {
  return esSinDato(medidor?.acumulado1) || esSinDato(medidor?.acumulado3)
}

export function crearMedidorVacio(def = {}) {
  const idMacro =
    def.idMacromedidor ??
    def.IdMacroMedidor ??
    def.IdMacromedidor ??
    null

  return {
    idMacromedidor: idMacro,
    codigo: def.codigo ?? def.Codigo ?? '',
    nombre: def.nombre ?? def.Nombre ?? def.NombreMacromedidor ?? '',
    acumulado1: null,
    acumulado2: null,
    acumulado3: null,
    /** Lectura 3 del día anterior (solo consulta, no editable). */
    lectura3Anterior:
      def.lectura3Anterior ??
      def.Lectura3Anterior ??
      def.Acumulado3Anterior ??
      def.UltimaLectura3 ??
      null,
    m3Dia: null,
  }
}

/** Normaliza el listado del endpoint traer-macromedidores. */
export function mapearMacromedidoresApi(lista) {
  const items = Array.isArray(lista)
    ? lista
    : Array.isArray(lista?.Registros)
      ? lista.Registros
      : Array.isArray(lista?.Macromedidores)
        ? lista.Macromedidores
        : []

  return items.map((item) =>
    crearMedidorVacio({
      idMacromedidor:
        item.IdMacroMedidor ??
        item.IdMacromedidor ??
        item.idMacromedidor ??
        item.Id ??
        item.id ??
        null,
      codigo: item.Codigo ?? item.codigo ?? '',
      nombre:
        item.Nombre ??
        item.NombreMacromedidor ??
        item.Descripcion ??
        item.nombre ??
        item.Codigo ??
        'Macromedidor',
      lectura3Anterior:
        item.Lectura3Anterior ??
        item.Acumulado3Anterior ??
        item.UltimaLectura3 ??
        item.lectura3Anterior ??
        null,
    }),
  )
}

/**
 * Busca la lectura 3 del registro más reciente anterior a `fecha`
 * (preferencia: día calendario anterior exacto).
 */
export function obtenerLectura3DiaAnterior(medidoresHistorial, idMacromedidor, codigo, fecha) {
  if (!fecha || !Array.isArray(medidoresHistorial) || !medidoresHistorial.length) return null

  const anteriores = medidoresHistorial
    .filter((r) => r?.fecha && String(r.fecha) < String(fecha))
    .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))

  for (const reg of anteriores) {
    const med = (reg.medidores || []).find(
      (m) =>
        (idMacromedidor != null && String(m.idMacromedidor) === String(idMacromedidor)) ||
        (codigo && m.codigo && String(m.codigo) === String(codigo)),
    )
    if (!med) continue
    if (med.acumulado3 !== null && med.acumulado3 !== undefined && med.acumulado3 !== '') {
      return med.acumulado3
    }
  }
  return null
}

/**
 * Normaliza registros del endpoint {idPlanta}/{tipoRegistro}/traer-registro
 * para la sección macromedidores (tipo 2).
 */
export function mapearRegistrosMacromedidoresApi(lista) {
  const items = Array.isArray(lista)
    ? lista
    : Array.isArray(lista?.Registros)
      ? lista.Registros
      : Array.isArray(lista?.Dato)
        ? lista.Dato
        : []

  return items.map((item, idx) => {
    const registros =
      item.Registros ||
      item.Medidores ||
      item.Lecturas ||
      item.Detalle ||
      []

    const medidores = (Array.isArray(registros) ? registros : []).map((r) =>
      crearMedidorVacio({
        idMacromedidor:
          r.IdMacroMedidor ?? r.IdMacromedidor ?? r.idMacromedidor ?? r.Id ?? null,
        codigo: r.Codigo ?? r.codigo ?? '',
        nombre: r.Nombre ?? r.NombreMacromedidor ?? r.nombre ?? r.Codigo ?? 'Macromedidor',
        lectura3Anterior: r.Lectura3Anterior ?? r.lectura3Anterior ?? null,
      }),
    ).map((m, i) => {
      const src = registros[i] || {}
      return {
        ...m,
        acumulado1: src.Lectura1 ?? src.Acumulado1 ?? src.lectura1 ?? m.acumulado1,
        acumulado2: src.Lectura2 ?? src.Acumulado2 ?? src.lectura2 ?? m.acumulado2,
        acumulado3: src.Lectura3 ?? src.Acumulado3 ?? src.lectura3 ?? m.acumulado3,
      }
    })

    return {
      id: item.IdRegistro ?? item.Id ?? item.id ?? idx + 1,
      fecha: item.Fecha ?? item.fecha ?? null,
      hora: item.Hora ?? item.hora ?? null,
      idUsuario: item.IdUsuario ?? item.idUsuario ?? null,
      idPlantaTratamiento: item.IdPlantaTratamiento ?? item.idPlantaTratamiento ?? null,
      medidores,
      cantidadMedidores: medidores.length || item.Cantidad || item.TotalMedidores || null,
      raw: item,
    }
  })
}

export function crearRegistroMacromedidoresVacio({
  idUsuario = null,
  idPlantaTratamiento = null,
  medidores = null,
  hora = null,
} = {}) {
  return {
    id: null,
    idUsuario,
    idPlantaTratamiento,
    fecha: fechaHoyLocal(),
    hora: hora || horaLecturaNuevoRegistro(),
    medidores: medidores ?? [],
  }
}

export const COLUMNAS = {
  macromedidores: [
    { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
    { name: 'hora', label: 'Hora', field: 'hora', align: 'left', sortable: true },
    {
      name: 'medidores',
      label: 'Medidores',
      field: (row) => (row.medidores?.length ?? row.cantidadMedidores ?? 0),
      align: 'center',
    },
    { name: 'acciones', label: '', field: 'acciones', align: 'right' },
  ],
  operaciones: [
    { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
    { name: 'hora', label: 'Hora', field: 'hora', align: 'left' },
    { name: 'operador', label: 'Operador', field: 'operador', align: 'left' },
    { name: 'aduccion', label: 'Aducción', field: 'aduccion', align: 'right' },
    { name: 'totalTratar', label: 'A tratar', field: 'totalTratar', align: 'right' },
    { name: 'producidaModulo500', label: 'Prod. M500', field: 'producidaModulo500', align: 'right' },
    { name: 'totalProducida', label: 'Prod. total', field: 'totalProducida', align: 'right' },
    { name: 'turbiedadAguaCruda', label: 'Turbiedad', field: 'turbiedadAguaCruda', align: 'right' },
    { name: 'colorAparenteAguaCruda', label: 'Color ap.', field: 'colorAparenteAguaCruda', align: 'right' },
    { name: 'phAguaCruda', label: 'pH', field: 'phAguaCruda', align: 'right' },
    { name: 'acciones', label: '', field: 'acciones', align: 'right' },
  ],
  calidad: [
    { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
    { name: 'hora', label: 'Hora', field: 'hora', align: 'left' },
    { name: 'turbCruda', label: 'Turb. cruda', field: 'turbCruda', align: 'right' },
    { name: 'phCruda', label: 'pH cruda', field: 'phCruda', align: 'right' },
    { name: 'phCoagulada500', label: 'pH coag. 500', field: 'phCoagulada500', align: 'right' },
    { name: 'filtradaTurb500', label: 'Turb. filt. 500', field: 'filtradaTurb500', align: 'right' },
    { name: 'tq1100Turb', label: 'Turb. TQ1100', field: 'tq1100Turb', align: 'right' },
    { name: 'acciones', label: '', field: 'acciones', align: 'right' },
  ],
}

export function totalTratar(registro) {
  const a = Number(registro.tratarModulo500) || 0
  const b = Number(registro.tratarModulo150) || 0
  if (registro.tratarModulo500 == null && registro.tratarModulo150 == null) return null
  return a + b
}

/** Producida Módulo 500 = Total − Módulo 150 */
export function calcProducidaModulo500(registro) {
  if (registro.producidaModulo150 == null && registro.totalProducida == null) return null
  return (Number(registro.totalProducida) || 0) - (Number(registro.producidaModulo150) || 0)
}

const FACTOR_DOSIS = 1000 / 60

function redondear(valor, decimales = 4) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return null
  const f = 10 ** decimales
  return Math.round(Number(valor) * f) / f
}

/** Descarga Total = Módulo 500 + Módulo 150 */
export function calcDescargaTotal(registro) {
  if (registro.descargaModulo500 == null && registro.descargaModulo150 == null) return null
  return (Number(registro.descargaModulo500) || 0) + (Number(registro.descargaModulo150) || 0)
}

/**
 * Dosis Total = (Descarga Total / Agua a tratar Total) * ((1000/60) * Densidad)
 */
export function calcDosisTotal(registro) {
  const agua = totalTratar(registro)
  const descarga = calcDescargaTotal(registro)
  const densidad = Number(registro.densidadPolicloruro)
  if (agua == null || descarga == null || !densidad || agua === 0) return null
  return redondear((descarga / agua) * (FACTOR_DOSIS * densidad), 4)
}

/**
 * Dosis Módulo 500 = (Descarga M500 / Agua a tratar M500) * ((1000/60) * Densidad)
 */
export function calcDosisModulo500(registro) {
  const descarga = registro.descargaModulo500
  const agua = registro.tratarModulo500
  const densidad = Number(registro.densidadPolicloruro)
  if (descarga == null || agua == null || !densidad || Number(agua) === 0) return null
  return redondear((Number(descarga) / Number(agua)) * (FACTOR_DOSIS * densidad), 4)
}

/**
 * Dosis Módulo 150 = (Descarga M150 / Agua a tratar M150) * ((1000/60) * Densidad)
 */
export function calcDosisModulo150(registro) {
  const descarga = registro.descargaModulo150
  const agua = registro.tratarModulo150
  const densidad = Number(registro.densidadPolicloruro)
  if (descarga == null || agua == null || !densidad || Number(agua) === 0) return null
  return redondear((Number(descarga) / Number(agua)) * (FACTOR_DOSIS * densidad), 4)
}

/** g/min = Descarga Total * Densidad */
export function calcDescargaGMin(registro) {
  const descarga = calcDescargaTotal(registro)
  const densidad = registro.densidadPolicloruro
  if (descarga == null || densidad == null) return null
  return redondear(descarga * Number(densidad), 0)
}

/** kg/h = g/min * 60 / 1000 */
export function calcDescargaKgH(registro) {
  const gMin = calcDescargaGMin(registro)
  if (gMin == null) return null
  return redondear((gMin * 60) / 1000, 4)
}

/**
 * Dosis Ca(OH)₂ =
 * (Descarga Cal / Aducción) * (1000/60) * Densidad * (Lechada/100) * (Pureza/100)
 */
export function calcCalDosisCaoh2(registro) {
  const descarga = registro.calDescarga
  const aduccion = registro.aduccion
  const densidad = registro.calDensidad
  const lechada = registro.calPorcentajeLechada
  const pureza = registro.calPureza
  if (
    descarga == null ||
    aduccion == null ||
    densidad == null ||
    lechada == null ||
    pureza == null ||
    Number(aduccion) === 0
  ) {
    return null
  }
  return redondear(
    (Number(descarga) / Number(aduccion)) *
      (1000 / 60) *
      Number(densidad) *
      (Number(lechada) / 100) *
      (Number(pureza) / 100),
    4,
  )
}

/**
 * Ca(OH)₂ kg/h =
 * Densidad * Descarga * (60/1000) * (Lechada/100)
 */
export function calcCalKgH(registro) {
  const densidad = registro.calDensidad
  const descarga = registro.calDescarga
  const lechada = registro.calPorcentajeLechada
  if (densidad == null || descarga == null || lechada == null) return null
  return redondear(
    Number(densidad) * Number(descarga) * (60 / 1000) * (Number(lechada) / 100),
    4,
  )
}

/**
 * Cloro mg/L =
 * (Lb/día / Total Producida) * (453.6 * 1000 / 86400)
 */
export function calcCloroMgL(registro) {
  const lbDia = registro.cloroLbDia
  const producida = registro.totalProducida
  if (lbDia == null || producida == null || Number(producida) === 0) return null
  return redondear(
    (Number(lbDia) / Number(producida)) * ((453.6 * 1000) / 86400),
    4,
  )
}

/** Cloro kg/h = Lb/día * 0.4536 / 24 */
export function calcCloroKgH(registro) {
  const lbDia = registro.cloroLbDia
  if (lbDia == null) return null
  return redondear((Number(lbDia) * 0.4536) / 24, 4)
}

export function fechaHoyLocal() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Hora exacta en formato 24h (1:30 → 01:00) */
export function horaExactaActual() {
  const h = new Date().getHours()
  return `${String(h).padStart(2, '0')}:00`
}

/** Normaliza cualquier hora a la hora exacta 24h (13:45 → 13:00) */
export function normalizarHoraExacta(hora) {
  if (hora == null || hora === '') return horaExactaActual()
  const match = String(hora).match(/(\d{1,2})/)
  if (!match) return horaExactaActual()
  const h = Math.min(23, Math.max(0, Number(match[1])))
  return `${String(h).padStart(2, '0')}:00`
}

export function crearRegistroOperacionVacio(operador = '') {
  return {
    id: null,
    idUsuario: null,
    idPlantaTratamiento: null,
    fecha: fechaHoyLocal(),
    hora: horaExactaActual(),
    operador: operador || '',
    observaciones: '',
    // Caudal (L/s) — un registro
    aduccion: null,
    tratarModulo500: null,
    tratarModulo150: null,
    producidaModulo150: null,
    totalProducida: null,
    producidaModulo500: null,
    // Calidad física agua cruda
    turbiedadAguaCruda: null,
    colorAparenteAguaCruda: null,
    phAguaCruda: null,
    // Dosificación de insumos químicos — Policloruro de aluminio
    dosisTotal: null,
    dosisModulo500: null,
    dosisModulo150: null,
    densidadPolicloruro: 1.33,
    descargaModulo500: null,
    descargaModulo150: null,
    descargaTotal: null,
    descargaGMin: null,
    descargaKgH: null,
    // Dosificación — Cal hidratada
    calDosisCaoh2: null,
    calPorcentajeLechada: 5.0,
    calPureza: 96.6,
    calDensidad: 1.03,
    calDescarga: null,
    calKgH: null,
    // Dosificación — Cloro gaseoso
    cloroMgL: null,
    cloroLbDia: null,
    cloroKgH: null,
    cloroCrl: null,
    // Tanques de almacenamiento de agua tratada
    tq1100Nivel: null,
    tq1100Entrada: null,
    tq1100Comuna: null,
    tq1100Paz: null,
    tq1100Alamos: null, // opcional (antes sin macromedidor)
    tq1100AltosColina: null, // opcional
    tq1100Zoher: null, // opcional
    sebastopolNivel: null,
    sebastopolEntrada: null, // opcional
    sebastopolSalida: null, // opcional
    tq4400Nivel: null,
    tq4400Entrada: null,
    tq4400SalidaCunduy: null,
    tq4400LineaOccidente: null,
  }
}

/** Datos de ejemplo (reemplazar con API) */
export const DATOS_DEMO = {
  macromedidores: [],
      operaciones: [
        {
          id: 1,
          fecha: '2026-07-30',
          hora: '01:00',
          operador: 'Operador planta',
          observaciones: 'Sin novedad',
          aduccion: 560,
          tratarModulo500: 314,
          tratarModulo150: 160,
          totalTratar: 474,
          producidaModulo150: 154,
          totalProducida: 468,
          producidaModulo500: 314,
          turbiedadAguaCruda: 1.8,
          colorAparenteAguaCruda: 21.0,
          phAguaCruda: 7.20,
          dosisTotal: 0,
          dosisModulo500: 0,
          dosisModulo150: 0,
          densidadPolicloruro: 1.33,
          descargaModulo500: 0,
          descargaModulo150: 0,
          descargaTotal: 0,
          descargaGMin: 0,
          descargaKgH: 0,
          calDosisCaoh2: 1.4,
          calPorcentajeLechada: 5.0,
          calPureza: 96.6,
          calDensidad: 1.03,
          calDescarga: 920,
          calKgH: 2.8,
          cloroMgL: 2.83,
          cloroLbDia: 220,
          cloroKgH: 4.2,
          cloroCrl: 1.3,
          tq1100Nivel: 3.72,
          tq1100Entrada: 121,
          tq1100Comuna: 105,
          tq1100Paz: 34,
          sebastopolNivel: null,
          tq4400Nivel: 5.41,
          tq4400Entrada: 408,
          tq4400SalidaCunduy: 260,
          tq4400LineaOccidente: 27,
        },
      ],
  calidad: [],
}

export function crearRegistroCalidadVacio({ idUsuario = null, idPlantaTratamiento = null } = {}) {
  return {
    id: null,
    idUsuario,
    idPlantaTratamiento,
    fecha: fechaHoyLocal(),
    hora: horaExactaActual(),
    // Calidad agua cruda
    turbCruda: null,
    colorCruda: null,
    phCruda: null,
    alcalCruda: null,
    condCruda: null,
    // Vortex
    turbEntradaVortex: null,
    phEntradaVortex: null,
    turbSalidaVortex: null,
    phSalidaVortex: null,
    // Encalada / coagulada / floculada
    alcalinidadEncalada: null,
    phCoagulada500: null,
    phCoagulada150: null,
    turbFloculada500: null,
    turbFloculada150: null,
    // Clarificada módulo 500 — sedimentadores 1..5
    clarif500Sed1Turb: null,
    clarif500Sed1Color: null,
    clarif500Sed2Turb: null,
    clarif500Sed2Color: null,
    clarif500Sed3Turb: null,
    clarif500Sed3Color: null,
    clarif500Sed4Turb: null,
    clarif500Sed4Color: null,
    clarif500Sed5Turb: null,
    clarif500Sed5Color: null,
    // Clarificada módulo 150 — sedimentadores 1..2
    clarif150Sed1Turb: null,
    clarif150Sed1Color: null,
    clarif150Sed2Turb: null,
    clarif150Sed2Color: null,
    // Filtrada
    filtradaTurb500: null,
    filtradaColor500: null,
    filtradaPh500: null,
    filtradaAl3500: null,
    filtradaTurb150: null,
    filtradaColor150: null,
    filtradaPh150: null,
    filtradaAl3150: null,
    // Salida tanques
    tq1100Turb: null,
    tq1100Color: null,
    tq1100Ph: null,
    tq1100Cloro: null,
    tq1100Alcalinidad: null,
    tq1100Dureza: null,
    tq1100Hierro: null,
    tq4400Turb: null,
    tq4400Color: null,
    tq4400Ph: null,
    tq4400Cloro: null,
    tq4400Alcalinidad: null,
    tq4400Dureza: null,
    tq4400Hierro: null,
  }
}

export function formularioVacio(seccionId) {
  if (seccionId === 'macromedidores') {
    return crearRegistroMacromedidoresVacio()
  }
  if (seccionId === 'operaciones') {
    return crearRegistroOperacionVacio()
  }
  if (seccionId === 'calidad') {
    return crearRegistroCalidadVacio()
  }
  return crearRegistroCalidadVacio()
}
