export function getPaginationData(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit)
  const currentPage = Math.max(1, Math.min(page, totalPages))
  const offset = (currentPage - 1) * limit

  return {
    page: currentPage,
    limit,
    total,
    totalPages,
    offset,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  }
}

export function buildPaginationPages(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = [1]

  if (currentPage > 3) pages.push('...')

  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (currentPage < totalPages - 2) pages.push('...')
  pages.push(totalPages)

  return pages
}
