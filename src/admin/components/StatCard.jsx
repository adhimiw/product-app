import React from 'react';

export default function StatCard({ title, value, subtext, icon, iconBg, iconColor }) {
    return (
        <div className="admin-stat-card">
            <div className="admin-stat-header">
                <span className="admin-stat-title">{title}</span>
                {icon && (
                    <div 
                        className="admin-stat-icon"
                        style={{
                            backgroundColor: iconBg || 'rgba(27, 59, 43, 0.08)',
                            color: iconColor || 'var(--color-primary)'
                        }}
                    >
                        {icon}
                    </div>
                )}
            </div>
            <div>
                <div className="admin-stat-value">{value}</div>
                {subtext && <div className="admin-stat-subtext">{subtext}</div>}
            </div>
        </div>
    );
}
