<template>
  <div class="app-layout">
    <main class="main-content">
      <div class="page-container">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 70px;

  @include respond-to(md) {
    padding-bottom: 0;
  }
}

.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;

  @include respond-to(sm) {
    padding: 1.5rem;
  }

  @include respond-to(xs) {
    padding: 1rem;
  }
}
</style>
