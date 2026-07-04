import dayjs from 'dayjs'

export function formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
  if (!date) return '-'
  return dayjs(date).format(format)
}

export function formatDateTime(date: string | Date): string {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export function formatMoney(amount: number): string {
  return `¥${amount.toFixed(2)}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

export function formatRole(role: string): string {
  const map: Record<string, string> = {
    admin: '系统管理员',
    librarian: '图书管理员',
    reader: '读者'
  }
  return map[role] || role
}

export function formatReaderType(type: string): string {
  const map: Record<string, string> = {
    student: '学生',
    teacher: '教师',
    staff: '职工',
    external: '外部读者'
  }
  return map[type] || type
}

export function formatBookStatus(status: string): string {
  const map: Record<string, string> = {
    active: '正常',
    withdrawn: '已下架'
  }
  return map[status] || status
}

export function formatBorrowStatus(status: string): string {
  const map: Record<string, string> = {
    borrowing: '借阅中',
    returned: '已归还',
    overdue: '逾期'
  }
  return map[status] || status
}

export function formatCopyStatus(status: string): string {
  const map: Record<string, string> = {
    stock: '在库',
    available: '可借',
    borrowed: '已借出',
    withdrawn: '已下架'
  }
  return map[status] || status
}

export function formatReaderStatus(status: string): string {
  const map: Record<string, string> = {
    active: '正常',
    frozen: '已冻结',
    lost: '已挂失',
    disabled: '已禁用'
  }
  return map[status] || status
}

export function formatFineStatus(status: string): string {
  const map: Record<string, string> = {
    unpaid: '未缴',
    paid: '已缴'
  }
  return map[status] || status
}
