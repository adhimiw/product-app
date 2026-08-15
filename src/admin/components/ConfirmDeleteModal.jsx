import React from 'react';

export default function ConfirmDeleteModal({
    isOpen,
    title = "Delete Item",
    itemName = "this item",
    warningText = "This action cannot be undone and will permanently remove this record from the database.",
    onConfirm,
    onCancel,
    isDeleting = false
}) {
    if (!isOpen) return null;

    return (
        <div className="admin-modal-backdrop" onClick={onCancel}>
            <div 
                className="admin-modal-card" 
                onClick={e => e.stopPropagation()} 
                style={{ maxWidth: '440px' }}
            >
                <div className="admin-modal-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--admin-danger-bg)',
                            color: 'var(--admin-danger-text)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </div>
                        <h3 className="admin-modal-title" style={{ fontSize: '1.1rem' }}>{title}</h3>
                    </div>
                    <button 
                        className="admin-modal-close" 
                        onClick={onCancel}
                        disabled={isDeleting}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="admin-modal-body" style={{ paddingTop: '12px' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.92rem', color: 'var(--admin-text-secondary)', lineHeight: '1.5' }}>
                        Are you sure you want to delete <strong style={{ color: 'var(--admin-text-main)' }}>"{itemName}"</strong>?
                    </p>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--admin-text-muted)', lineHeight: '1.5' }}>
                        {warningText}
                    </p>
                </div>

                <div className="admin-modal-footer">
                    <button 
                        type="button" 
                        className="admin-btn admin-btn-secondary" 
                        onClick={onCancel}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className="admin-btn admin-btn-danger" 
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="admin-spinner-svg">
                                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                                </svg>
                                Deleting...
                            </span>
                        ) : (
                            'Confirm Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
