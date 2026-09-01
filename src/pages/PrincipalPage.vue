<template>
  <q-page class="q-pa-md">
    <div class="hs-card q-pa-lg">
      <div class="text-h5 text-weight-bold">{{ APP_NAME }}</div>
      <p class="text-grey-7 q-mt-sm">
        Bienvenido al sistema de gestión de solubilidad química.
      </p>
      <q-btn
        unelevated
        no-caps
        icon="water_drop"
        label="Operaciones de planta"
        class="btn-gradient q-mt-md"
        to="/planta"
      />
    </div>
  </q-page>
</template>

<script setup>
import { APP_NAME } from '@/config/app'
</script>
