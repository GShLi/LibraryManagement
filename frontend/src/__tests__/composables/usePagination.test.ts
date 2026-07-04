import { describe, it, expect, vi } from 'vitest'
import { usePagination } from '@/composables/usePagination'

describe('usePagination', () => {
  it('should initialize with default values', () => {
    const fetchFn = vi.fn()
    const { page, pageSize, total, loading } = usePagination(fetchFn)

    expect(page.value).toBe(1)
    expect(pageSize.value).toBe(20)
    expect(total.value).toBe(0)
    expect(loading.value).toBe(false)
  })

  it('should load data from fetch function', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ total: 50, list: [{ id: 1 }] })
    const { loadData, list, total, loading } = usePagination(fetchFn)

    await loadData()

    expect(fetchFn).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
    expect(total.value).toBe(50)
    expect(loading.value).toBe(false)
  })

  it('should handle load error gracefully', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'))
    const { loadData, list, total, loading } = usePagination(fetchFn)

    await loadData()

    expect(list.value).toEqual([])
    expect(total.value).toBe(0)
    expect(loading.value).toBe(false)
  })

  it('should change page and reload', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ total: 50, list: [] })
    const { onPageChange, page, loadData } = usePagination(fetchFn)

    await loadData()
    fetchFn.mockClear()

    onPageChange(2)
    expect(page.value).toBe(2)
    expect(fetchFn).toHaveBeenCalledWith({ page: 2, pageSize: 20 })
  })

  it('should change page size and reset to page 1', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ total: 50, list: [] })
    const { onPageSizeChange, page, pageSize, loadData } = usePagination(fetchFn)

    await loadData()
    fetchFn.mockClear()

    onPageSizeChange(50)
    expect(page.value).toBe(1)
    expect(pageSize.value).toBe(50)
    expect(fetchFn).toHaveBeenCalledWith({ page: 1, pageSize: 50 })
  })

  it('should reset page to 1', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ total: 50, list: [] })
    const { reset, page } = usePagination(fetchFn)

    page.value = 3
    fetchFn.mockClear()

    reset()
    expect(page.value).toBe(1)
    expect(fetchFn).toHaveBeenCalledWith({ page: 1, pageSize: 20 })
  })

  it('should set extra params', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ total: 50, list: [] })
    const { setParams } = usePagination(fetchFn)

    await setParams({ keyword: 'test' })
    expect(fetchFn).toHaveBeenCalledWith({ page: 1, pageSize: 20, keyword: 'test' })
  })
})
