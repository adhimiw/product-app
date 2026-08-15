import React from 'react';

export default function EmptyState({
    icon = "📦",
    title = "No data found",
    description = "There are no records matching your current filter or query.",
    actionLabel,
    onAction
}) {
    return (
        <div style={{
            padding: '48px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--admin-card-bg)',
            borderRadius: 'var(--admin-radius-xl)'
        }}>
            <div style={{
                fontSize: '2.5rem',
                marginBottom: '12px',
                width: '64px',
                height: '64px',
                borderRadius: 'var(--admin-radius-full)',
                backgroundColor: 'var(--admin-surface-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {icon}
            </div>
            <h3 style={{
                margin: '0 0 6px 0',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--admin-text-main)'
            }}>
                {title}
            </h3>
            <p style={{
                margin: '0 0 16px 0',
                fontSize: '0.85rem',
                color: 'var(--admin-text-muted)',
                maxWidth: '380px',
                lineHeight: '1.5'
            }}>
                {description}
            </p>
            {actionLabel && onAction && (
                <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={onAction}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
