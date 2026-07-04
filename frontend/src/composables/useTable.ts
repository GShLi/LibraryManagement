import { ref } from 'vue'

export function useTable<T = Record<string, unknown>>() {
  const selectedRows = ref<T[]>([])

  function selectionChange(rows: T[]) {
    selectedRows.value = rows
  }

  function clearSelection() {
    selectedRows.value = []
  }

  return {
    selectedRows,
    selectionChange,
    clearSelection
  }
}
