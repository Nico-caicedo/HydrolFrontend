import { LocalStorage } from 'quasar'

/**
 * Configuración central de la aplicación.
 * Cambia APP_NAME aquí para actualizar marca, textos y claves de almacenamiento.
 */
export const APP_NAME = 'HydroSol'

export const APP_TAGLINE = 'Gestión de solubilidad química'

export const APP_FOOTER = 'Planta de tratamiento de agua — Línea 03'

/** Id de planta usado en peticiones al backend (override si el login trae el valor). */
export const IdPlantaTratamiento = 4

export const STORAGE_KEYS = {
  usuario: `usuario${APP_NAME}`,
  registrosPlanta: `registrosPlanta${APP_NAME}`,
}

/**
 * Resuelve IdPlantaTratamiento: sesión (si existe) o constante global.
 */
export function obtenerIdPlantaTratamiento(usuarioSesion = null) {
  const usuario = usuarioSesion || LocalStorage.getItem(STORAGE_KEYS.usuario)
  const desdeSesion = usuario?.IdPlantaTratamiento ?? usuario?.idPlantaTratamiento
  if (desdeSesion != null && desdeSesion !== '') return Number(desdeSesion)
  return IdPlantaTratamiento
}

export default {
  APP_NAME,
  APP_TAGLINE,
  APP_FOOTER,
  IdPlantaTratamiento,
  STORAGE_KEYS,
  obtenerIdPlantaTratamiento,
}
