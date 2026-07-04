import request from '@/utils/request'
import type { ApiResponse, BookCopy } from '@/types'

export function listByBookId(bookId: number, params?: { status?: string }): Promise<{ list: BookCopy[] }> {
  return request.get<ApiResponse<{ list: BookCopy[] }>>('/book-copies', { params: { bookId, ...params } }).then(res => res.data.data)
}

export function getById(id: number): Promise<BookCopy> {
  return request.get<ApiResponse<BookCopy>>(`/book-copies/${id}`).then(res => res.data.data)
}

export function addCopies(data: { bookId: number; count: number; location?: string }): Promise<{ barcodes: string[] }> {
  return request.post<ApiResponse<{ barcodes: string[] }>>('/book-copies', data).then(res => res.data.data)
}

export function updateLocation(id: number, location: string): Promise<void> {
  return request.put<ApiResponse<null>>(`/book-copies/${id}/location`, { location }).then(() => {})
}
