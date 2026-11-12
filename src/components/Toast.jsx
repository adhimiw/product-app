import React, { useEffect, useState } from 'react';

export default function Toast({ toast, onClose }) {
    const [isExiting, setIsExiting] = useState(false);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300);
    };

    useEffect(() => {
        if (!toast) return;
        setIsExiting(false);

        const autoCloseTimer = setTimeout(() => {
            handleDismiss();
        }, 3500);

        return () => clearTimeout(autoCloseTimer);
    }, [toast]);

    return (
        <div 
            className={`tb-slide-toaster ${isExiting ? 'exit' : 'enter'}`}
            role="alert"
        >
            {/* Clean Notification Text Only */}
            <div className="tb-toaster-body">
                <p className="tb-toaster-text">
                    {toast.message || toast.title}
                </p>
            </div>

            {/* Minimalist Close '✕' Button */}
            <button 
                type="button"
                className="tb-toaster-close" 
                onClick={handleDismiss} 
                aria-label="Close"
            >
                ✕
            </button>
        </div>
    );
}
