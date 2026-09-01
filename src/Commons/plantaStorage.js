import { LocalStorage } from 'quasar'
import { DATOS_DEMO } from '@/config/planta'
import { STORAGE_KEYS } from '@/config/app'

const KEY = STORAGE_KEYS.registrosPlanta

function leerTodo() {
  const data = LocalStorage.getItem(KEY)
  if (data) return data
  return {
    macromedidores: [...DATOS_DEMO.macromedidores],
    operaciones: [...DATOS_DEMO.operaciones],
    calidad: [...DATOS_DEMO.calidad],
  }
}

function guardarTodo(data) {
  LocalStorage.set(KEY, data)
}

export function listarRegistros(seccionId) {
  return leerTodo()[seccionId] || []
}

/** Reemplaza por completo la lista local de una sección (p. ej. tras traer del API). */
export function reemplazarRegistros(seccionId, lista) {
  const todo = leerTodo()
  todo[seccionId] = Array.isArray(lista) ? lista : []
  guardarTodo(todo)
  return todo[seccionId]
}

export function guardarRegistro(seccionId, registro) {
  const todo = leerTodo()
  const lista = [...(todo[seccionId] || [])]

  if (registro.id != null) {
    const idx = lista.findIndex((r) => r.id === registro.id)
    if (idx !== -1) {
      lista[idx] = { ...registro }
    } else {
      lista.unshift({ ...registro })
    }
  } else {
    const nuevoId = lista.length ? Math.max(...lista.map((r) => r.id || 0)) + 1 : 1
    lista.unshift({ ...registro, id: nuevoId })
  }

  todo[seccionId] = lista
  guardarTodo(todo)
  return lista
}

export function eliminarRegistro(seccionId, id) {
  const todo = leerTodo()
  todo[seccionId] = (todo[seccionId] || []).filter((r) => r.id !== id)
  guardarTodo(todo)
  return todo[seccionId]
}

export function obtenerRegistro(seccionId, id) {
  return listarRegistros(seccionId).find((r) => String(r.id) === String(id)) || null
}
