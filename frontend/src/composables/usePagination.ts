import { ref } from 'vue'
import type { PaginationParams } from '@/types'

export function usePagination<T>(
  fetchFn: (params: PaginationParams & Record<string, unknown>) => Promise<{ total: number; list: T[] }>
) {
  const page = ref(1)
  const pageSize = ref(20)
  const total = ref(0)
  const loading = ref(false)
  const list = ref<T[]>([]) as unknown as ReturnType<typeof ref<T[]>>

  const extraParams = ref<Record<string, unknown>>({})

  async function loadData(params?: Record<string, unknown>) {
    loading.value = true
    try {
      const result = await fetchFn({
        page: page.value,
        pageSize: pageSize.value,
        ...extraParams.value,
        ...(params || {})
      })
      total.value = result.total
      list.value = result.list as unknown as T[]
    } catch (error) {
      list.value = [] as unknown as T[]
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  function onPageChange(newPage: number) {
    page.value = newPage
    loadData()
  }

  function onPageSizeChange(newSize: number) {
    pageSize.value = newSize
    page.value = 1
    loadData()
  }

  function reset() {
    page.value = 1
    loadData()
  }

  function setParams(params: Record<string, unknown>) {
    extraParams.value = params
    page.value = 1
    loadData()
  }

  return {
    page,
    pageSize,
    total,
    loading,
    list,
    loadData,
    onPageChange,
    onPageSizeChange,
    reset,
    setParams
  }
}
