import request from '@/utils/request'
import type { ApiResponse, PaginatedData, Reserve, ReserveCreateData } from '@/types'

export function create(data: ReserveCreateData): Promise<Reserve> {
  return request.post<ApiResponse<Reserve>>('/reserves', data).then(res => res.data.data)
}

export function cancel(id: number): Promise<void> {
  return request.delete<ApiResponse<null>>(`/reserves/${id}`).then(() => {})
}

export function list(params?: { page?: number; pageSize?: number; status?: string }): Promise<PaginatedData<Reserve>> {
  return request.get<ApiResponse<PaginatedData<Reserve>>>('/reserves', { params }).then(res => res.data.data)
}
