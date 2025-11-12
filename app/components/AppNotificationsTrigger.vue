<template>
  <div class="notifications-wrapper">
    <button
      class="icon-button"
      @click="toggleNotifications"
      title="Уведомления"
    >
      <Icon name="lucide:bell" size="20" />
      <span v-if="unreadCount" class="notification-badge">
        {{ unreadCount }}
      </span>
    </button>

    <AppNotificationsModal
      v-if="showNotifications"
      @close="showNotifications = false"
    />
  </div>
</template>

<script setup lang="ts">
const notificationsStore = useNotificationsStore()
const showNotifications = ref(false)

const unreadCount = computed(() => notificationsStore.unreadCount)

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

// Close when clicking outside
onClickOutside(document.body, () => {
  if (showNotifications.value) {
    showNotifications.value = false
  }
})
</script>

<style scoped lang="scss">
.notifications-wrapper {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background: var(--error);
  color: white;
  font-size: 10px;
  font-weight: var(--font-bold);
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  @include flex-center;
}
</style>
