<template></template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.sidebar-desktop {
  display: none;

  @media (min-width: 769px) {
    display: block;
  }
}

.mobile-header {
  display: block;

  @media (min-width: 769px) {
    display: none;
  }
}

.mobile-bottom-nav {
  display: block;

  @media (min-width: 769px) {
    display: none;
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 70px;

  @media (min-width: 769px) {
    padding-bottom: 0;
  }
}

.page-container {
  padding: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: var(--spacing-md);
  }

  @media (max-width: 480px) {
    padding: var(--spacing-sm);
  }
}
</style>
