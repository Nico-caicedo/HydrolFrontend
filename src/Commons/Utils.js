import { Notify, Loading, Dialog, LocalStorage } from 'quasar'
import { STORAGE_KEYS } from '@/config/app'

const Utils = {
  loadingNotify(show, message = 'Procesando...') {
    if (show) {
      Loading.show({ message })
    } else {
      Loading.hide()
    }
  },

  notificacion(mensaje, isExito = true) {
    Notify.create({
      message: mensaje || (isExito ? 'Operación exitosa' : 'Ocurrió un error'),
      color: isExito ? 'positive' : 'negative',
      position: 'top',
      timeout: 3000,
    })
  },

  async datoUsuario() {
    try {
      const usuario = LocalStorage.getItem(STORAGE_KEYS.usuario)
      return usuario || null
    } catch {
      return null
    }
  },

  async confirmarAccion(mensaje, titulo = 'Confirmar') {
    return new Promise((resolve) => {
      Dialog.create({
        title: titulo || 'Confirmar',
        message: mensaje,
        cancel: { label: 'Cancelar', flat: true, color: 'grey-7' },
        ok: { label: 'Aceptar', unelevated: true, color: 'primary' },
        persistent: true,
      })
        .onOk(() => resolve(true))
        .onCancel(() => resolve(false))
        .onDismiss(() => resolve(false))
    })
  },

  fechaHoy() {
    const hoy = new Date()
    const ano = hoy.getFullYear()
    const mes = String(hoy.getMonth() + 1).padStart(2, '0')
    const dia = String(hoy.getDate()).padStart(2, '0')
    return `${ano}-${mes}-${dia}`
  },
}

export default Utils
