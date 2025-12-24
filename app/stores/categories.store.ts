import { defineStore } from 'pinia'
import type { Category } from '~/types/category.types'
import { v4 as uuidv4 } from 'uuid'

export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [] as Category[],
  }),

  actions: {
    addCategory(name: string, color: string) {
      this.categories.push({
        id: uuidv4(),
        name,
        color,
      })
    },

    updateCategory(id: string, data: Partial<Category>) {
      const cat = this.categories.find((c) => c.id === id)
      if (cat) Object.assign(cat, data)
    },

    removeCategory(id: string) {
      this.categories = this.categories.filter((c) => c.id !== id)
    },
  },

  persist: true,
})
