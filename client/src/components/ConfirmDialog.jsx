import { useEffect } from 'react';

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isProcessing = false,
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isProcessing) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isProcessing, onCancel]);

  if (!open) return null;

  return (
    <div className="dialog-overlay" onClick={isProcessing ? undefined : onCancel}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog__header">
          <div className="dialog__icon-wrapper">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 id="dialog-title" className="dialog__title">{title}</h3>
        </div>

        <p className="dialog__message">{message}</p>

        <div className="dialog__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
            disabled={isProcessing}
            id="dialog-cancel-btn"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={onConfirm}
            disabled={isProcessing}
            id="dialog-confirm-btn"
          >
            {isProcessing ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
