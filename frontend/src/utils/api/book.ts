import request from '@/utils/request'
import type { ApiResponse, PaginatedData, Book, BookFormData, BookQueryParams } from '@/types'

export function list(params?: BookQueryParams): Promise<PaginatedData<Book>> {
  return request.get<ApiResponse<PaginatedData<Book>>>('/books', { params }).then(res => res.data.data)
}

export function getById(id: number): Promise<Book> {
  return request.get<ApiResponse<Book>>(`/books/${id}`).then(res => res.data.data)
}

export function create(data: BookFormData): Promise<{ bookId: number; isbn: string; totalCopies: number; barcodes: string[] }> {
  return request.post<ApiResponse<{ bookId: number; isbn: string; totalCopies: number; barcodes: string[] }>>('/books', data).then(res => res.data.data)
}

export function update(id: number, data: Partial<BookFormData>): Promise<void> {
  return request.put<ApiResponse<null>>(`/books/${id}`, data).then(() => {})
}

export function withdraw(id: number, data: { reason: string; remark?: string }): Promise<void> {
  return request.delete<ApiResponse<null>>(`/books/${id}`, { data }).then(() => {})
}

export function restore(id: number): Promise<void> {
  return request.post<ApiResponse<null>>(`/books/${id}/restore`).then(() => {})
}
