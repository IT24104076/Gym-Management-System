import React from 'react'

export default function Pagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2
  const left = Math.max(1, currentPage - delta)
  const right = Math.min(totalPages, currentPage + delta)

  if (left > 1) {
    pages.push(1)
    if (left > 2) pages.push('...')
  }
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < totalPages) {
    if (right < totalPages - 1) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
      >
        ‹ Prev
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`pagination-btn${p === currentPage ? ' pagination-btn--active' : ''}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
      >
        Next ›
      </button>
    </div>
  )
}
