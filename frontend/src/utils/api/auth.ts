import request from '@/utils/request'
import type { ApiResponse, LoginRequest, RegisterRequest, LoginResponse, UserInfo } from '@/types'

export function login(data: LoginRequest): Promise<LoginResponse> {
  return request.post<ApiResponse<LoginResponse>>('/auth/login', data).then(res => res.data.data)
}

export function register(data: RegisterRequest): Promise<{ userId: number; username: string; readerNo: string }> {
  return request.post<ApiResponse<{ userId: number; username: string; readerNo: string }>>('/auth/register', data).then(res => res.data.data)
}

export function getMe(): Promise<UserInfo & { reader?: Record<string, unknown> }> {
  return request.get<ApiResponse<UserInfo & { reader?: Record<string, unknown> }>>('/auth/me').then(res => res.data.data)
}

export function logout(): Promise<void> {
  return request.post<ApiResponse<null>>('/auth/logout').then(() => {})
}
