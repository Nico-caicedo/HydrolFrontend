<template>
  <q-layout view="hHh lpR fFf" class="login-layout">
    <q-page-container class="login-container">
      <q-page class="login-page flex flex-center">
        <div class="login-shell column items-center">
          <div class="brand column items-center">
            <div class="brand-logo flex flex-center">
              <q-icon name="science" :size="logoSize" />
            </div>
            <div class="brand-name">{{ APP_NAME }}</div>
            <div class="brand-tagline">{{ APP_TAGLINE }}</div>
          </div>

          <div class="login-card">
            <h1 class="login-title">Iniciar sesión</h1>
            <p class="login-subtitle">Ingresa tus credenciales para continuar</p>

            <q-form @submit.prevent="login" class="login-form">
              <div class="field-group">
                <label class="field-label">Usuario</label>
                <q-input
                  v-model="usuario.LoginUsuario"
                  outlined
                  dense
                  placeholder="operador@planta.com"
                  class="field-input"
                  hide-bottom-space
                >
                  <template #prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>
              </div>

              <div class="field-group">
                <label class="field-label">Contraseña</label>
                <q-input
                  v-model="usuario.PasswordUsuario"
                  outlined
                  dense
                  :type="isPwd ? 'password' : 'text'"
                  placeholder="••••••••"
                  class="field-input"
                  lazy-rules
                  :rules="[(val) => !!val || 'Ingrese su contraseña']"
                >
                  <template #prepend>
                    <q-icon name="lock" />
                  </template>
                  <template #append>
                    <q-icon
                      :name="isPwd ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="isPwd = !isPwd"
                    />
                  </template>
                </q-input>
              </div>

              <div class="row justify-end">
                <a href="#" class="recover-link" @click.prevent>¿Olvidaste tu clave?</a>
              </div>

              <q-btn
                type="submit"
                label="Acceder"
                unelevated
                no-caps
                class="full-width login-btn"
              />
            </q-form>
          </div>

          <div class="login-foot row items-center no-wrap justify-center">
            <q-icon name="water_drop" size="14px" color="primary" />
            <span class="login-foot__text">{{ APP_FOOTER }}</span>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { LocalStorage, useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from '@/boot/axios'
import Utils from '@/Commons/Utils'
import { APP_NAME, APP_TAGLINE, APP_FOOTER, STORAGE_KEYS } from '@/config/app'

const $q = useQuasar()
const router = useRouter()
const isPwd = ref(true)
const usuario = ref({})
const logoSize = computed(() => ($q.screen.lt.sm ? '22px' : '26px'))

onMounted(async () => {
  const responseUsuario = await Utils.datoUsuario()
  if (responseUsuario) {
    router.push('/principal')
  }
})

const login = async () => {
  try {
    Utils.loadingNotify(true, 'Procesando...')

    const response = await api.post('/usuario/autentica-usuario', {
      Usuario: usuario.value.LoginUsuario,
      Clave: usuario.value.PasswordUsuario,
    })

    Utils.notificacion(response.data.Mensaje, response.data.IsExito)

    if (response.data.IsExito) {
      LocalStorage.set(STORAGE_KEYS.usuario, response.data.Dato)
      router.push('/principal')
    }
  } catch (error) {
    console.error('Error al autenticar usuario:', error)

    if (error.response) {
      Utils.notificacion(
        error.response.data?.Mensaje || 'Usuario o contraseña incorrectos.',
        false,
      )
    } else if (error.request) {
      Utils.notificacion('No se pudo conectar con el servidor. Verifica tu conexión.', false)
    } else {
      Utils.notificacion('Ocurrió un error inesperado.', false)
    }
  } finally {
    Utils.loadingNotify(false, '')
  }
}
</script>

<style scoped>
.login-layout {
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;
  background: linear-gradient(180deg, #d9eef8 0%, #eef7fc 45%, #f7fbfd 100%);
}

.login-container {
  height: 100%;
  max-height: 100dvh;
  overflow: hidden;
}

.login-page {
  height: 100%;
  min-height: 100% !important;
  max-height: 100dvh;
  padding: clamp(10px, 2.5vh, 24px) clamp(14px, 4vw, 24px);
  overflow: hidden;
  box-sizing: border-box;
}

.login-shell {
  width: 100%;
  max-width: min(400px, 100%);
  gap: clamp(10px, 2vh, 20px);
}

.brand {
  gap: 4px;
  flex-shrink: 0;
}

.brand-logo {
  width: clamp(44px, 7vh, 58px);
  height: clamp(44px, 7vh, 58px);
  border-radius: 16px;
  color: var(--hs-primary);
  background: rgba(38, 166, 154, 0.12);
  border: 1px solid rgba(38, 166, 154, 0.28);
  margin-bottom: 4px;
}

.brand-name {
  font-size: clamp(1.4rem, 4.5vw, 1.75rem);
  font-weight: 800;
  color: var(--hs-text);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.brand-tagline {
  color: var(--hs-text-muted);
  font-size: clamp(0.75rem, 2.4vw, 0.88rem);
  text-align: center;
  padding: 0 8px;
}

.login-card {
  width: 100%;
  padding: clamp(16px, 2.5vh, 24px) clamp(16px, 4vw, 24px);
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid var(--hs-border);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  flex-shrink: 1;
  min-width: 0;
}

.login-title {
  margin: 0 0 4px;
  font-size: clamp(1.15rem, 3.5vw, 1.35rem);
  font-weight: 800;
  color: var(--hs-text);
}

.login-subtitle {
  margin: 0 0 clamp(12px, 2vh, 18px);
  color: var(--hs-text-muted);
  font-size: clamp(0.78rem, 2.2vw, 0.86rem);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.4vh, 12px);
}

.field-label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #475569;
}

.field-input :deep(.q-field__control) {
  border-radius: 12px;
  background: #f4f8fb;
  min-height: 42px;
}

.field-input :deep(.q-field__prepend .q-icon),
.field-input :deep(.q-field__append .q-icon) {
  color: #94a3b8;
}

.recover-link {
  color: var(--hs-primary);
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
}

.recover-link:hover {
  text-decoration: underline;
}

.login-btn {
  margin-top: 2px;
  height: clamp(42px, 6vh, 48px);
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.95rem;
  color: #fff !important;
  background: var(--hs-gradient-btn);
  box-shadow: 0 10px 22px rgba(38, 166, 154, 0.28);
}

.login-btn:hover {
  filter: brightness(1.03);
}

.login-foot {
  gap: 6px;
  color: var(--hs-text-muted);
  font-size: clamp(0.68rem, 2vw, 0.78rem);
  flex-shrink: 0;
  text-align: center;
  max-width: 100%;
}

.login-foot__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 599px) {
  .login-page {
    padding: 12px 16px;
  }

  .login-shell {
    max-width: 100%;
    gap: 12px;
  }

  .login-foot__text {
    white-space: normal;
    line-height: 1.3;
  }
}

@media (max-height: 700px) {
  .brand-tagline {
    display: none;
  }

  .login-shell {
    gap: 8px;
  }
}

@media (max-height: 560px) {
  .login-foot {
    display: none;
  }

  .brand-logo {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .brand-name {
    font-size: 1.2rem;
  }

  .login-card {
    padding: 12px 14px;
  }

  .login-btn {
    height: 40px;
  }
}
</style>
