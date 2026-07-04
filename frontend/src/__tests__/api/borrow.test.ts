import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/utils/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn()
  }
}))

import request from '@/utils/request'
import { create, returnBook, renew, list, listOverdue } from '@/utils/api/borrow'

describe('borrow API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create borrow', async () => {
    const mockPost = vi.mocked(request.post)
    mockPost.mockResolvedValue({
      data: { code: 201, message: 'ok', data: { borrowRecords: [{ borrowId: 1, barcode: 'BC-001', bookTitle: 'Test', dueDate: '2026-08-01' }] } }
    })

    const result = await create({ readerNo: 'R-001', barcodes: ['BC-001'] })
    expect(result.borrowRecords).toHaveLength(1)
    expect(result.borrowRecords[0].bookTitle).toBe('Test')
  })

  it('should return book', async () => {
    const mockPut = vi.mocked(request.put)
    mockPut.mockResolvedValue({
      data: { code: 200, message: 'ok', data: { borrowId: 1, returnDate: '2026-07-04', overdue: false, fine: null } }
    })

    const result = await returnBook(1)
    expect(result.overdue).toBe(false)
    expect(result.fine).toBeNull()
  })

  it('should renew borrow', async () => {
    const mockPut = vi.mocked(request.put)
    mockPut.mockResolvedValue({
      data: { code: 200, message: 'ok', data: { borrowId: 1, newDueDate: '2026-08-31', renewCount: 1 } }
    })

    const result = await renew(1)
    expect(result.newDueDate).toBe('2026-08-31')
    expect(result.renewCount).toBe(1)
  })

  it('should list borrows', async () => {
    const mockGet = vi.mocked(request.get)
    mockGet.mockResolvedValue({
      data: { code: 200, message: 'ok', data: { total: 10, page: 1, pageSize: 20, list: [{ id: 1, bookTitle: 'Test Book' }] } }
    })

    const result = await list({ page: 1, pageSize: 20 })
    expect(result.total).toBe(10)
    expect(result.list).toHaveLength(1)
  })

  it('should list overdue records', async () => {
    const mockGet = vi.mocked(request.get)
    mockGet.mockResolvedValue({
      data: { code: 200, message: 'ok', data: { total: 5, page: 1, pageSize: 20, list: [{ id: 1, overdueDays: 10 }] } }
    })

    const result = await listOverdue()
    expect(result.total).toBe(5)
  })
})
