import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const storedValue = localStorage.getItem(key)
  const value = ref<T>(storedValue ? JSON.parse(storedValue) : defaultValue)

  watch(
    value,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  // Синхронизация между вкладками
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key === key) {
        value.value = event.newValue ? JSON.parse(event.newValue) : defaultValue
      }
    })
  }

  return value
}
