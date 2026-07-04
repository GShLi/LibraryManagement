import request from '@/utils/request'
import type { ApiResponse, PaginatedData, Fine, FineQueryParams } from '@/types'

export function list(params?: FineQueryParams): Promise<PaginatedData<Fine>> {
  return request.get<ApiResponse<PaginatedData<Fine>>>('/fines', { params }).then(res => res.data.data)
}

export function getById(id: number): Promise<Fine> {
  return request.get<ApiResponse<Fine>>(`/fines/${id}`).then(res => res.data.data)
}

export function pay(id: number): Promise<{ fineId: number; amount: number; status: string; paidAt: string }> {
  return request.put<ApiResponse<{ fineId: number; amount: number; status: string; paidAt: string }>>(`/fines/${id}/pay`).then(res => res.data.data)
}
