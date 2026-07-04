export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedData<T> {
  total: number
  page: number
  pageSize: number
  list: T[]
}

export interface LoginRequest {
  username: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  username: string
  password: string
  name: string
  phone: string
  email?: string
}

export interface LoginResponse {
  token: string
  user: UserInfo
}

export interface UserInfo {
  id: number
  username: string
  role: 'admin' | 'librarian' | 'reader'
  name?: string
  readerNo?: string
}

export interface User {
  id: number
  username: string
  role: 'admin' | 'librarian' | 'reader'
  status: 'active' | 'disabled' | 'locked'
  loginAttempts: number
  lockedUntil: string | null
  createdAt: string
  updatedAt: string
  reader?: {
    readerNo: string
    name: string
    phone: string
    readerType: string
  }
}

export interface Reader {
  userId: number
  username?: string
  readerNo: string
  name: string
  phone: string
  email: string
  readerType: 'student' | 'teacher' | 'staff' | 'external'
  borrowLimit: number
  currentBorrowed: number
  status: 'active' | 'frozen' | 'lost' | 'disabled'
  createdAt: string
  updatedAt: string
}

export interface Book {
  id: number
  isbn: string
  title: string
  author: string
  publisher: string
  publishDate: string
  categoryCode: string
  categoryName: string
  price: number
  pages?: number
  language: string
  edition?: string
  keywords?: string[]
  description?: string
  coverUrl?: string
  status: 'active' | 'withdrawn'
  totalCopies: number
  availableCopies: number
  createdAt?: string
  updatedAt?: string
}

export interface BookFormData {
  isbn: string
  title: string
  author: string
  publisher: string
  publishDate: string
  categoryCode: string
  price: number
  pages?: number
  language?: string
  edition?: string
  keywords?: string[]
  description?: string
  coverUrl?: string
  copyCount?: number
  location?: string
}

export interface BookCopy {
  id: number
  bookId: number
  barcode: string
  status: 'stock' | 'available' | 'borrowed' | 'withdrawn'
  location: string
  condition: 'new' | 'good' | 'fair' | 'damaged'
  createdAt: string
  book?: {
    title: string
    isbn: string
  }
}

export interface BorrowRecord {
  id: number
  readerName: string
  readerNo: string
  bookTitle: string
  barcode: string
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status: 'borrowing' | 'returned' | 'overdue'
  renewCount: number
  operatorName: string
  fine?: {
    fineId: number
    amount: number
    status: string
  }
}

export interface BorrowCreateData {
  readerNo: string
  barcodes: string[]
  borrowDays?: number
}

export interface BorrowResult {
  borrowId: number
  barcode: string
  bookTitle: string
  dueDate: string
}

export interface ReturnResult {
  borrowId: number
  returnDate: string
  overdue: boolean
  overdueDays?: number
  fine?: {
    fineId: number
    amount: number
    status: string
  }
}

export interface RenewResult {
  borrowId: number
  newDueDate: string
  renewCount: number
}

export interface OverdueRecord {
  id: number
  readerName: string
  readerNo: string
  bookTitle: string
  barcode: string
  borrowDate: string
  dueDate: string
  overdueDays: number
  fine?: {
    fineId: number
    amount: number
    status: string
  }
}

export interface Fine {
  id: number
  borrowId: number
  readerName: string
  readerNo: string
  bookTitle: string
  barcode?: string
  borrowDate?: string
  dueDate?: string
  returnDate?: string
  overdueDays: number
  amount: number
  status: 'unpaid' | 'paid'
  paidAt: string | null
  createdAt: string
}

export interface Reserve {
  id: number
  bookId: number
  bookTitle: string
  bookAuthor?: string
  copyId?: number
  reserveDate: string
  expireDate: string
  status: 'waiting' | 'fulfilled' | 'cancelled' | 'expired'
}

export interface ReserveCreateData {
  bookId: number
  copyId?: number
}

export interface OverviewStats {
  totalBooks: number
  totalCopies: number
  totalBorrowed: number
  totalOverdue: number
  totalReaders: number
  totalFinesUnpaid: number
  todayBorrows: number
  todayReturns: number
}

export interface BorrowRankingItem {
  rank: number
  bookId: number
  title: string
  author: string
  borrowCount: number
}

export interface OverdueStatsItem {
  rank: number
  readerId?: number
  readerName?: string
  readerNo?: string
  bookId?: number
  title?: string
  author?: string
  overdueCount: number
  totalFineAmount: number
}

export interface CategoryItem {
  code: string
  name: string
  level: number
  children: CategoryItem[]
}

export interface ConfigItem {
  configKey: string
  configValue: string
  description: string
}

export interface AuditLog {
  id: number
  userId: number
  username: string
  action: string
  detail: string
  ipAddress: string
  createdAt: string
}

export interface BackupItem {
  id: number
  filename: string
  fileSize: number
  createdAt: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface ReaderQueryParams extends PaginationParams {
  status?: string
  readerType?: string
  keyword?: string
}

export interface BookQueryParams extends PaginationParams {
  keyword?: string
  author?: string
  isbn?: string
  categoryCode?: string
  status?: string
  publishYearStart?: number
  publishYearEnd?: number
  sortBy?: string
  sortOrder?: string
}

export interface BorrowQueryParams extends PaginationParams {
  status?: string
  readerId?: number
  startDate?: string
  endDate?: string
}

export interface FineQueryParams extends PaginationParams {
  status?: string
  readerId?: number
  startDate?: string
  endDate?: string
}

export interface UserQueryParams extends PaginationParams {
  role?: string
  status?: string
  keyword?: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}
