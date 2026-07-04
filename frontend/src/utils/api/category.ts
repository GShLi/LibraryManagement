import request from '@/utils/request'
import type { ApiResponse, CategoryItem } from '@/types'

export function getTree(params?: { parentCode?: string; flat?: boolean }): Promise<{ list: CategoryItem[] }> {
  return request.get<ApiResponse<{ list: CategoryItem[] }>>('/categories', { params }).then(res => res.data.data)
}
