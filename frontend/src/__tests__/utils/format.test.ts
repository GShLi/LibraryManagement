import { describe, it, expect } from 'vitest'
import {
  formatDate, formatDateTime, formatMoney, formatFileSize,
  formatRole, formatReaderType, formatBookStatus,
  formatBorrowStatus, formatCopyStatus, formatReaderStatus, formatFineStatus
} from '@/utils/format'

describe('format', () => {
  describe('formatDate', () => {
    it('should format date string', () => {
      expect(formatDate('2026-07-04')).toBe('2026-07-04')
    })

    it('should return dash for empty date', () => {
      expect(formatDate('')).toBe('-')
    })
  })

  describe('formatDateTime', () => {
    it('should format datetime', () => {
      const result = formatDateTime('2026-07-04T10:30:00')
      expect(result).toContain('2026-07-04')
    })

    it('should return dash for empty value', () => {
      expect(formatDateTime('')).toBe('-')
    })
  })

  describe('formatMoney', () => {
    it('should format money with ¥ sign', () => {
      expect(formatMoney(10)).toBe('¥10.00')
      expect(formatMoney(0.5)).toBe('¥0.50')
      expect(formatMoney(129.5)).toBe('¥129.50')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B')
    })

    it('should format KB', () => {
      expect(formatFileSize(2048)).toContain('KB')
    })

    it('should format MB', () => {
      expect(formatFileSize(10485760)).toContain('MB')
    })
  })

  describe('formatRole', () => {
    it('should translate roles to Chinese', () => {
      expect(formatRole('admin')).toBe('系统管理员')
      expect(formatRole('librarian')).toBe('图书管理员')
      expect(formatRole('reader')).toBe('读者')
    })

    it('should return original for unknown role', () => {
      expect(formatRole('unknown')).toBe('unknown')
    })
  })

  describe('formatReaderType', () => {
    it('should translate reader types', () => {
      expect(formatReaderType('student')).toBe('学生')
      expect(formatReaderType('teacher')).toBe('教师')
      expect(formatReaderType('staff')).toBe('职工')
      expect(formatReaderType('external')).toBe('外部读者')
    })
  })

  describe('formatBookStatus', () => {
    it('should translate book status', () => {
      expect(formatBookStatus('active')).toBe('正常')
      expect(formatBookStatus('withdrawn')).toBe('已下架')
    })
  })

  describe('formatBorrowStatus', () => {
    it('should translate borrow status', () => {
      expect(formatBorrowStatus('borrowing')).toBe('借阅中')
      expect(formatBorrowStatus('returned')).toBe('已归还')
      expect(formatBorrowStatus('overdue')).toBe('逾期')
    })
  })

  describe('formatCopyStatus', () => {
    it('should translate copy status', () => {
      expect(formatCopyStatus('stock')).toBe('在库')
      expect(formatCopyStatus('available')).toBe('可借')
      expect(formatCopyStatus('borrowed')).toBe('已借出')
      expect(formatCopyStatus('withdrawn')).toBe('已下架')
    })
  })

  describe('formatReaderStatus', () => {
    it('should translate reader status', () => {
      expect(formatReaderStatus('active')).toBe('正常')
      expect(formatReaderStatus('frozen')).toBe('已冻结')
      expect(formatReaderStatus('lost')).toBe('已挂失')
      expect(formatReaderStatus('disabled')).toBe('已禁用')
    })
  })

  describe('formatFineStatus', () => {
    it('should translate fine status', () => {
      expect(formatFineStatus('unpaid')).toBe('未缴')
      expect(formatFineStatus('paid')).toBe('已缴')
    })
  })
})
