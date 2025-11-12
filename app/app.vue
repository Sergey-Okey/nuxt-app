<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
// Глобальная инициализация темы
onMounted(() => {
  // Устанавливаем темную тему по умолчанию
  document.documentElement.setAttribute('data-theme', 'dark')
})
</script>
