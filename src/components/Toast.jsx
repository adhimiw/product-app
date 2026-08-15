import React, { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => {
            onClose();
        }, 3500);
        return () => clearTimeout(timer);
    }, [toast, onClose]);

    if (!toast) return null;

    const isSuccess = toast.type === 'success';

    return (
        <div className="toast-notification-banner" role="alert">
            <div className={`toast-icon-wrap ${isSuccess ? 'success' : 'info'}`}>
                {isSuccess ? '🌱' : '👋'}
            </div>
            
            <div className="toast-content-body">
                <h4 className="toast-title">{toast.title}</h4>
                <p className="toast-message">{toast.message}</p>
            </div>

            <button className="toast-close-btn" onClick={onClose} aria-label="Close notification">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
    );
}
