<template>
  <div class="input-decimal" :class="inputClass">
    <div v-if="label" class="input-decimal__label">{{ label }}</div>

    <div
      class="input-decimal__box"
      :class="{
        'input-decimal__box--readonly': readonly || disable,
        'input-decimal__box--focused': enfocado,
        'input-decimal__box--error': hasError,
      }"
      @click="focusInput"
    >
      <input
        ref="refInput"
        class="input-decimal__field"
        :value="texto"
        :readonly="readonly"
        :disabled="disable"
        inputmode="numeric"
        autocomplete="off"
        :placeholder="placeholderVista"
        @focus="onFocus"
        @blur="onBlur"
        @keydown="onKeydown"
        @beforeinput="onBeforeInput"
      />

      <span v-if="suffix" class="input-decimal__suffix">{{ suffix }}</span>
    </div>

    <div v-if="hint && !errorMessage" class="input-decimal__hint">{{ hint }}</div>
    <div v-if="errorMessage" class="input-decimal__error">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: null,
  },
  /**
   * Decimales fijos con formato automático al escribir.
   * No hace falta coma/punto: marcas 30 → se ve 3,0 (decimals=1)
   */
  decimals: {
    type: Number,
    default: 1,
  },
  label: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: undefined,
  },
  suffix: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  dense: {
    type: Boolean,
    default: true,
  },
  outlined: {
    type: Boolean,
    default: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  disable: {
    type: Boolean,
    default: false,
  },
  rules: {
    type: Array,
    default: () => [],
  },
  hideBottomSpace: {
    type: Boolean,
    default: false,
  },
  inputClass: {
    type: [String, Array, Object],
    default: '',
  },
  formatOnBlur: {
    type: Boolean,
    default: true,
  },
  /** Máximo de dígitos que se pueden marcar (incluye parte decimal) */
  maxDigits: {
    type: Number,
    default: 12,
  },
})

const emit = defineEmits(['update:modelValue'])

const refInput = ref(null)
const digitos = ref('') // lo marcado: "30"
const texto = ref('') // lo mostrado: "3,0"
const enfocado = ref(false)
const touched = ref(false)

const maxDecimals = computed(() => Math.max(0, Number(props.decimals) || 0))
const divisor = computed(() => 10 ** maxDecimals.value)

const placeholderVista = computed(() => {
  if (props.placeholder) return props.placeholder
  if (maxDecimals.value <= 0) return '0'
  return `0,${'0'.repeat(maxDecimals.value)}`
})

const digitosANumero = (rawDigitos) => {
  const limpio = String(rawDigitos ?? '').replace(/\D/g, '')
  if (!limpio) return null
  if (maxDecimals.value <= 0) {
    const n = Number(limpio)
    return Number.isNaN(n) ? null : n
  }
  const n = Number(limpio) / divisor.value
  return Number.isNaN(n) ? null : n
}

const numeroAVista = (num) => {
  if (num === null || num === undefined || Number.isNaN(Number(num))) return ''
  if (maxDecimals.value <= 0) return String(Math.trunc(Number(num)))
  return Number(num).toFixed(maxDecimals.value).replace('.', ',')
}

const numeroADigitos = (num) => {
  if (num === null || num === undefined || num === '' || Number.isNaN(Number(num))) return ''
  if (maxDecimals.value <= 0) return String(Math.trunc(Math.abs(Number(num))))
  return Math.round(Math.abs(Number(num)) * divisor.value).toString()
}

const refrescar = () => {
  const num = digitosANumero(digitos.value)
  texto.value = num === null ? '' : numeroAVista(num)
  emit('update:modelValue', num)
}

const agregarDigito = (d) => {
  if (digitos.value.length >= props.maxDigits) return
  // Evita ceros a la izquierda inútiles: "0" + "3" → "3"
  if (digitos.value === '0') {
    digitos.value = d
  } else {
    digitos.value += d
  }
  refrescar()
}

const borrarDigito = () => {
  digitos.value = digitos.value.slice(0, -1)
  refrescar()
}

const limpiar = () => {
  digitos.value = ''
  texto.value = ''
  emit('update:modelValue', null)
}

const sincronizarDesdeModelo = () => {
  if (enfocado.value) return

  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') {
    digitos.value = ''
    texto.value = ''
    return
  }

  digitos.value = numeroADigitos(props.modelValue)
  texto.value = numeroAVista(Number(props.modelValue))
}

watch(() => props.modelValue, sincronizarDesdeModelo, { immediate: true })

const errorMessage = computed(() => {
  if (!touched.value || !props.rules?.length) return ''
  const valor = digitosANumero(digitos.value)
  for (const rule of props.rules) {
    const res = typeof rule === 'function' ? rule(valor) : true
    if (res !== true && res !== undefined && res !== null && res !== '') {
      return String(res)
    }
  }
  return ''
})

const hasError = computed(() => !!errorMessage.value)

const focusInput = () => {
  if (props.readonly || props.disable) return
  refInput.value?.focus()
}

const onFocus = (evt) => {
  if (props.readonly || props.disable) {
    evt?.target?.blur?.()
    return
  }
  enfocado.value = true
}

const onBlur = () => {
  enfocado.value = false
  touched.value = true

  if (!digitos.value) {
    limpiar()
    return
  }

  const num = digitosANumero(digitos.value)
  digitos.value = numeroADigitos(num)
  texto.value = num === null ? '' : numeroAVista(num)
  emit('update:modelValue', num)
}

/** Pegar: toma solo dígitos y formatea */
const onBeforeInput = (evt) => {
  if (props.readonly || props.disable) return

  if (evt.inputType === 'insertFromPaste') {
    evt.preventDefault()
    const pegado = String(evt.data || '').replace(/\D/g, '')
    if (!pegado) return
    for (const d of pegado) agregarDigito(d)
    return
  }

  // El tipeo de dígitos lo controla keydown; bloquea inserción nativa
  if (String(evt.inputType || '').startsWith('insert')) {
    evt.preventDefault()
  }
}

const onKeydown = (evt) => {
  if (props.readonly || props.disable) return

  if (evt.key === 'Backspace' || evt.key === 'Delete') {
    evt.preventDefault()
    borrarDigito()
    return
  }

  if (evt.key === 'Escape') {
    evt.preventDefault()
    limpiar()
    return
  }

  // Solo dígitos: se van formateando solos (30 → 3,0)
  if (/^\d$/.test(evt.key)) {
    evt.preventDefault()
    agregarDigito(evt.key)
    return
  }

  const navegacion = [
    'Tab',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
  ]
  if (navegacion.includes(evt.key) || evt.ctrlKey || evt.metaKey) return

  // Bloquear coma, punto, letras, etc.
  if (evt.key.length === 1) {
    evt.preventDefault()
  }
}
</script>

<style scoped>
.input-decimal {
  width: 100%;
}

.input-decimal__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  margin: 0 0 4px 2px;
  line-height: 1.2;
}

.input-decimal__box {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 2px 10px;
  border: 1px solid rgba(0, 0, 0, 0.24);
  border-radius: 4px;
  background: #fff;
  transition: border-color 0.2s ease;
  cursor: text;
}

.input-decimal__box--focused {
  border-color: var(--hs-primary, #26a69a);
  border-width: 2px;
  padding: 1px 9px;
}

.input-decimal__box--error {
  border-color: #c10015;
}

.input-decimal__box--readonly {
  background: #f1f5f9;
  cursor: default;
  pointer-events: none;
}

.input-decimal__field:disabled {
  color: #334155;
  opacity: 1;
  -webkit-text-fill-color: #334155;
}

.input-decimal__field {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  color: #0f172a;
  padding: 6px 0;
  text-align: right;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

.input-decimal__suffix {
  flex: 0 0 auto;
  margin-left: 8px;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

.input-decimal__hint,
.input-decimal__error {
  font-size: 0.72rem;
  line-height: 1.2;
  margin: 4px 0 0 2px;
  min-height: 16px;
}

.input-decimal__hint {
  color: #64748b;
}

.input-decimal__error {
  color: #c10015;
}
</style>
