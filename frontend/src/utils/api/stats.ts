import request from '@/utils/request'
import type { ApiResponse, OverviewStats, BorrowRankingItem, OverdueStatsItem } from '@/types'

export function getOverview(): Promise<OverviewStats> {
  return request.get<ApiResponse<OverviewStats>>('/stats/overview').then(res => res.data.data)
}

export function getBorrowRanking(params: { startDate: string; endDate: string; categoryCode?: string; topN?: number }): Promise<{ startDate: string; endDate: string; list: BorrowRankingItem[] }> {
  return request.get<ApiResponse<{ startDate: string; endDate: string; list: BorrowRankingItem[] }>>('/stats/borrow-ranking', { params }).then(res => res.data.data)
}

export function getOverdueStats(params?: { startDate?: string; endDate?: string; dimension?: string }): Promise<{ totalOverdueRecords: number; overdueRate: string; totalFinesAmount: number; list: OverdueStatsItem[] }> {
  return request.get<ApiResponse<{ totalOverdueRecords: number; overdueRate: string; totalFinesAmount: number; list: OverdueStatsItem[] }>>('/stats/overdue', { params }).then(res => res.data.data)
}
