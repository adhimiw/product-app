import React from 'react';

export default function StatCard({
    title,
    value,
    subtext,
    icon,
    iconBg,
    iconColor,
    trend
}) {
    return (
        <div className="admin-stat-card">
            <div className="admin-stat-card-header">
                <span className="admin-stat-title">{title}</span>
                {icon && (
                    <div 
                        className="admin-stat-icon-wrapper"
                        style={{
                            backgroundColor: iconBg || 'var(--admin-primary-faint)',
                            color: iconColor || 'var(--admin-primary)'
                        }}
                    >
                        {icon}
                    </div>
                )}
            </div>
            <div>
                <div className="admin-stat-value">{value}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    {subtext && <span className="admin-stat-subtext">{subtext}</span>}
                    {trend && (
                        <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: trend.isPositive ? 'var(--admin-success-text)' : 'var(--admin-danger-text)',
                            background: trend.isPositive ? 'var(--admin-success-bg)' : 'var(--admin-danger-bg)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                        }}>
                            {trend.isPositive ? '↑' : '↓'} {trend.text}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
