import { defineStore } from 'pinia'
import type { Tag } from '~/types/tag.types'
import { v4 as uuidv4 } from 'uuid'

export const useTagsStore = defineStore('tags', {
  state: () => ({
    tags: [] as Tag[],
  }),

  actions: {
    addTag(label: string, color: string) {
      this.tags.push({
        id: uuidv4(),
        label,
        color,
      })
    },

    removeTag(id: string) {
      this.tags = this.tags.filter((t) => t.id !== id)
    },
  },

  persist: true,
})
