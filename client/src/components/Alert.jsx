import React from 'react'

const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null
  return (
    <div className={`alert alert--${type}`} role="alert">
      <span className="alert-icon">{icons[type]}</span>
      <span className="alert-message">{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      )}
    </div>
  )
}
