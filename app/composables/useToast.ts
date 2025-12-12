import { useToastStore } from '~/stores/toast'

export const useToast = () => {
  const toastStore = useToastStore()

  const show = (options: {
    title: string
    message: string
    type?: 'success' | 'error' | 'warning' | 'info'
    duration?: number
  }) => {
    return toastStore.showToast({
      type: options.type || 'info',
      title: options.title,
      message: options.message,
      duration: options.duration,
    })
  }

  const success = (title: string, message: string, duration?: number) => {
    return show({ title, message, type: 'success', duration })
  }

  const error = (title: string, message: string, duration?: number) => {
    return show({ title, message, type: 'error', duration })
  }

  const warning = (title: string, message: string, duration?: number) => {
    return show({ title, message, type: 'warning', duration })
  }

  const info = (title: string, message: string, duration?: number) => {
    return show({ title, message, type: 'info', duration })
  }

  return {
    show,
    success,
    error,
    warning,
    info,
  }
}
