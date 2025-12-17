<!-- pages/index.vue -->
<template>
  <div class="container py-8">
    <div class="space-y-8">
      <h1 class="text-3xl font-semibold mb-6">UI Components Test</h1>

      <!-- Тест кнопок -->
      <div class="space-y-6">
        <h2 class="text-xl font-medium">Buttons</h2>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Primary -->
          <Button @click="handleButtonClick"> Primary </Button>

          <Button type="secondary" @click="handleButtonClick">
            Secondary
          </Button>

          <Button type="ghost" @click="handleButtonClick"> Ghost </Button>

          <Button type="text" @click="handleButtonClick"> Text </Button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- Sizes -->
          <Button size="xs" @click="handleButtonClick"> XS </Button>

          <Button size="sm" @click="handleButtonClick"> SM </Button>

          <Button size="md" @click="handleButtonClick"> MD </Button>

          <Button size="lg" @click="handleButtonClick"> LG </Button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <!-- States -->
          <Button :loading="isLoading" @click="toggleLoading">
            {{ isLoading ? 'Loading...' : 'Click to Load' }}
          </Button>

          <Button disabled> Disabled </Button>

          <Button icon-left="plus" @click="handleButtonClick">
            With Icon
          </Button>

          <Button badge="3" @click="handleButtonClick"> With Badge </Button>
        </div>

        <!-- Circle buttons -->
        <div class="flex flex-wrap gap-4">
          <Button
            circle
            size="md"
            icon-left="plus"
            @click="handleButtonClick"
          />
          <Button
            circle
            size="lg"
            icon-left="settings"
            @click="handleButtonClick"
          />
          <Button
            circle
            size="xl"
            icon-left="user"
            @click="handleButtonClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Импорты не нужны - Nuxt автоматически импортирует компоненты

// Состояния
const isLoading = ref(false)

// Методы
const handleButtonClick = () => {
  console.log('Button clicked!')
}

const toggleLoading = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.py-8 {
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.space-y-8 > * + * {
  margin-top: 2rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.grid {
  display: grid;
}

.gap-4 {
  gap: 1rem;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 768px) {
  .md\:grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}
</style>
