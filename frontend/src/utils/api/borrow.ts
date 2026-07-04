import request from '@/utils/request'
import type { ApiResponse, PaginatedData, BorrowRecord, BorrowCreateData, BorrowResult, ReturnResult, RenewResult, OverdueRecord, BorrowQueryParams } from '@/types'

export function create(data: BorrowCreateData): Promise<{ borrowRecords: BorrowResult[] }> {
  return request.post<ApiResponse<{ borrowRecords: BorrowResult[] }>>('/borrows', data).then(res => res.data.data)
}

export function returnBook(id: number): Promise<ReturnResult> {
  return request.put<ApiResponse<ReturnResult>>(`/borrows/${id}/return`).then(res => res.data.data)
}

export function renew(id: number): Promise<RenewResult> {
  return request.put<ApiResponse<RenewResult>>(`/borrows/${id}/renew`).then(res => res.data.data)
}

export function list(params?: BorrowQueryParams): Promise<PaginatedData<BorrowRecord>> {
  return request.get<ApiResponse<PaginatedData<BorrowRecord>>>('/borrows', { params }).then(res => res.data.data)
}

export function listOverdue(params?: { page?: number; pageSize?: number; readerId?: number }): Promise<PaginatedData<OverdueRecord>> {
  return request.get<ApiResponse<PaginatedData<OverdueRecord>>>('/borrows/overdue', { params }).then(res => res.data.data)
}
