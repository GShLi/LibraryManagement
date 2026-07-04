import { describe, it, expect } from 'vitest'
import { useTable } from '@/composables/useTable'

describe('useTable', () => {
  it('should initialize with empty selection', () => {
    const { selectedRows } = useTable()
    expect(selectedRows.value).toEqual([])
  })

  it('should update selected rows on selection change', () => {
    const { selectedRows, selectionChange } = useTable<{ id: number }>()
    selectionChange([{ id: 1 }, { id: 2 }])
    expect(selectedRows.value).toHaveLength(2)
    expect(selectedRows.value[0].id).toBe(1)
  })

  it('should clear selection', () => {
    const { selectedRows, selectionChange, clearSelection } = useTable()
    selectionChange([{ id: 1 }])
    clearSelection()
    expect(selectedRows.value).toEqual([])
  })
})
