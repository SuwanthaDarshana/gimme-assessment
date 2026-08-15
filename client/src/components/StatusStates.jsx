export function LoadingState({ label = 'Loading listings...' }) {
  return (
    <div className="status-state" role="status" aria-live="polite">
      <div className="spinner" />
      <p className="status-state__label">{label}</p>
    </div>
  );
}

export function ErrorState({ message = 'An unexpected error occurred.', onRetry }) {
  return (
    <div className="status-state status-state--error" role="alert">
      <div className="status-state__icon status-state__icon--error">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="status-state__title">Something went wrong</h3>
      <p className="status-state__message">{message}</p>
      {onRetry && (
        <button type="button" className="btn btn--secondary status-state__action" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title = 'No listings found',
  message = 'Try adjusting your search terms or filters.',
  action,
}) {
  return (
    <div className="status-state status-state--empty">
      <div className="status-state__icon status-state__icon--empty">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>
      <h3 className="status-state__title">{title}</h3>
      <p className="status-state__message">{message}</p>
      {action && <div className="status-state__action">{action}</div>}
    </div>
  );
}
