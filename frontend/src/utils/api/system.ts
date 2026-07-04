import request from '@/utils/request'
import type { ApiResponse, PaginatedData, ConfigItem, AuditLog, BackupItem } from '@/types'

export function getConfigs(): Promise<{ list: ConfigItem[] }> {
  return request.get<ApiResponse<{ list: ConfigItem[] }>>('/system/configs').then(res => res.data.data)
}

export function updateConfigs(data: { configs: { configKey: string; configValue: string }[] }): Promise<void> {
  return request.put<ApiResponse<null>>('/system/configs', data).then(() => {})
}

export function getLogs(params?: { page?: number; pageSize?: number; action?: string; userId?: number; startDate?: string; endDate?: string }): Promise<PaginatedData<AuditLog>> {
  return request.get<ApiResponse<PaginatedData<AuditLog>>>('/system/logs', { params }).then(res => res.data.data)
}

export function listBackups(): Promise<{ list: BackupItem[] }> {
  return request.get<ApiResponse<{ list: BackupItem[] }>>('/system/backups').then(res => res.data.data)
}

export function createBackup(): Promise<BackupItem> {
  return request.post<ApiResponse<BackupItem>>('/system/backups').then(res => res.data.data)
}

export function restoreBackup(id: number): Promise<void> {
  return request.post<ApiResponse<null>>(`/system/backups/${id}/restore`).then(() => {})
}
