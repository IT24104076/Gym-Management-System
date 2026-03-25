import React from 'react'

export default function LoadingSpinner({ size = 'md', center = false }) {
  return (
    <div className={`spinner-wrapper${center ? ' spinner-wrapper--center' : ''}`}>
      <div className={`spinner spinner--${size}`} role="status" aria-label="Loading" />
    </div>
  )
}
