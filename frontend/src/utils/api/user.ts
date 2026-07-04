import request from '@/utils/request'
import type { ApiResponse, PaginatedData, User, UserQueryParams } from '@/types'

export function list(params?: UserQueryParams): Promise<PaginatedData<User>> {
  return request.get<ApiResponse<PaginatedData<User>>>('/users', { params }).then(res => res.data.data)
}

export function getById(id: number): Promise<User> {
  return request.get<ApiResponse<User>>(`/users/${id}`).then(res => res.data.data)
}

export function create(data: Record<string, unknown>): Promise<User> {
  return request.post<ApiResponse<User>>('/users', data).then(res => res.data.data)
}

export function update(id: number, data: Record<string, unknown>): Promise<void> {
  return request.put<ApiResponse<null>>(`/users/${id}`, data).then(() => {})
}

export function updateStatus(id: number, status: string): Promise<void> {
  return request.put<ApiResponse<null>>(`/users/${id}/status`, { status }).then(() => {})
}

export function resetPassword(id: number, password: string): Promise<void> {
  return request.put<ApiResponse<null>>(`/users/${id}/password`, { password }).then(() => {})
}

export function changePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
  return request.patch<ApiResponse<null>>(`/users/${id}/password`, { oldPassword, newPassword }).then(() => {})
}

export function deleteUser(id: number): Promise<void> {
  return request.delete<ApiResponse<null>>(`/users/${id}`).then(() => {})
}
