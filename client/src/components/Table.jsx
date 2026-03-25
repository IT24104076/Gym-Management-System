import React from 'react'
import LoadingSpinner from './LoadingSpinner.jsx'

export default function Table({ columns, data, loading, emptyMessage = 'No records found.' }) {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.style}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="table-loading-cell">
                <LoadingSpinner />
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty-cell">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row._id || row.id || idx}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
