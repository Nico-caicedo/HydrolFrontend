<template>
  <div>
    <template v-for="menu in items" :key="menu.IdMenu">
      <!-- Móvil: expandir inline -->
      <template v-if="$q.screen.lt.md">
        <template v-if="!menu?.Menus || menu.Menus.length === 0">
          <q-item
            v-if="!menu.IsOculto"
            :class="{ 'clase-activa': idMenuActivo === menu.IdMenu }"
            clickable
            v-ripple
            :content-inset-level="level"
            @click="toggle(menu.IdMenu)"
          >
            <q-item-section avatar>
              <q-icon color="grey-9" :name="menu.Icono || 'folder'" />
            </q-item-section>
            <q-item-section>{{ menu.Nombre }}</q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" class="chev" :class="{ expanded: isExpanded(menu.IdMenu) }" />
            </q-item-section>
          </q-item>
          <div v-show="isExpanded(menu.IdMenu) && menu?.Vistas?.length" class="q-ml-md q-my-xs">
            <q-item
              v-for="(vista, vi) in menu.Vistas"
              :key="vi"
              clickable
              v-ripple
              dense
              @click="irAVista(vista)"
            >
              <q-item-section avatar>
                <q-icon color="grey-8" :name="vista.IconoVista || 'chevron_right'" />
              </q-item-section>
              <q-item-section>{{ vista.NombreVista }}</q-item-section>
            </q-item>
          </div>
        </template>
        <template v-else>
          <div v-if="!menu.IsOculto">
            <q-item clickable v-ripple :content-inset-level="level" @click="activarMenuMobile(menu)">
              <q-item-section avatar>
                <q-icon color="grey-9" :name="menu.Icono || 'folder'" />
              </q-item-section>
              <q-item-section>{{ menu.Nombre }}</q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" class="chev" :class="{ expanded: isExpanded(menu.IdMenu) }" />
              </q-item-section>
            </q-item>
            <div v-show="isExpanded(menu.IdMenu)" class="q-ml-md q-my-xs">
              <MenuDinamico
                :items="menu.Menus"
                :id-menu-activo="idMenuActivo"
                :level="level + 1"
                @seleccionar="emitSeleccion"
              />
              <div v-if="menu?.Vistas?.length" class="q-mt-xs">
                <q-item
                  v-for="(vista, vi) in menu.Vistas"
                  :key="vi"
                  clickable
                  v-ripple
                  dense
                  @click="irAVista(vista)"
                >
                  <q-item-section avatar>
                    <q-icon color="grey-8" :name="vista.IconoVista || 'chevron_right'" />
                  </q-item-section>
                  <q-item-section>{{ vista.NombreVista }}</q-item-section>
                </q-item>
              </div>
            </div>
          </div>
        </template>
      </template>

      <!-- Desktop -->
      <template v-else>
        <template v-if="!menu?.Menus || menu.Menus.length === 0">
          <q-item
            v-if="!menu.IsOculto"
            :class="{ 'clase-activa': idMenuActivo === menu.IdMenu }"
            clickable
            v-ripple
            :content-inset-level="level"
            @click="emitSeleccion(menu)"
          >
            <q-item-section avatar>
              <q-icon color="grey-9" :name="menu.Icono || 'folder'" />
            </q-item-section>
            <q-item-section>{{ menu.Nombre }}</q-item-section>
          </q-item>
        </template>
        <template v-else>
          <q-expansion-item
            v-if="!menu.IsOculto"
            :label="menu.Nombre"
            :icon="menu.Icono || 'folder'"
            :content-inset-level="0.5"
            expand-separator
            default-closed
          >
            <MenuDinamico
              :items="menu.Menus"
              :id-menu-activo="idMenuActivo"
              :level="level + 1"
              @seleccionar="emitSeleccion"
            />
          </q-expansion-item>
        </template>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import MenuDinamico from './MenuDinamico.vue'

const $q = useQuasar()
const router = useRouter()

defineProps({
  items: Array,
  level: {
    type: Number,
    default: 0,
  },
  idMenuActivo: Number,
})

const emit = defineEmits(['seleccionar'])

const emitSeleccion = (menu) => {
  emit('seleccionar', menu)
}

const activarMenuMobile = (menu) => {
  toggle(menu.IdMenu)
  emitSeleccion(menu)
}

const expandedSet = ref(new Set())
const isExpanded = (id) => expandedSet.value.has(id)
const toggle = (id) => {
  const s = new Set(expandedSet.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  expandedSet.value = s
}

const irAVista = (vista) => {
  if (!vista || !vista.Ruta) return
  emit('seleccionar', vista)
  router.push(vista.Ruta)
}
</script>

<style scoped>
.chev {
  transition: transform 0.15s ease;
}

.chev.expanded {
  transform: rotate(90deg);
}

.clase-activa {
  border-left: 4px solid var(--hs-primary);
  background-color: var(--hs-nav-active-bg);
  font-weight: 600;
}
</style>
