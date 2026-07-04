import request from '@/utils/request'
import type { ApiResponse, PaginatedData, Reader, ReaderQueryParams, BorrowRecord } from '@/types'

export function list(params?: ReaderQueryParams): Promise<PaginatedData<Reader>> {
  return request.get<ApiResponse<PaginatedData<Reader>>>('/readers', { params }).then(res => res.data.data)
}

export function getById(id: number): Promise<Reader> {
  return request.get<ApiResponse<Reader>>(`/readers/${id}`).then(res => res.data.data)
}

export function update(id: number, data: Partial<Reader>): Promise<void> {
  return request.put<ApiResponse<null>>(`/readers/${id}`, data).then(() => {})
}

export function getBorrowHistory(id: number, params?: { page?: number; pageSize?: number; status?: string; startDate?: string; endDate?: string }): Promise<PaginatedData<BorrowRecord>> {
  return request.get<ApiResponse<PaginatedData<BorrowRecord>>>(`/readers/${id}/borrow-history`, { params }).then(res => res.data.data)
}

export function updateStatus(id: number, status: string): Promise<void> {
  return request.put<ApiResponse<null>>(`/readers/${id}/status`, { status }).then(() => {})
}
