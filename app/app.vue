<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// Инициализация темы
const settingsStore = useSettingsStore()

onMounted(() => {
  // Тема уже инициализирована через colorMode модуль
  // Можно добавить дополнительную логику при необходимости
})
</script>

<style>
/* Глобальные стили */
body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

/* Normalize scrollbars */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border-light);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-medium);
}
</style>
