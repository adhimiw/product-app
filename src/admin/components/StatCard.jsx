import React from 'react';

export default function StatCard({
    title,
    value,
    subtext,
    icon,
    iconBg,
    iconColor,
    trend,
    variant = 'default',
    badgeText
}) {
    return (
        <div className={`admin-stat-card admin-stat-card--${variant}`}>
            <div className="admin-stat-card-header">
                <div className="admin-stat-title-wrap">
                    <span className="admin-stat-title">{title}</span>
                    {badgeText && <span className="admin-stat-chip">{badgeText}</span>}
                </div>
                {icon && (
                    <div 
                        className="admin-stat-icon-wrapper"
                        style={{
                            backgroundColor: iconBg,
                            color: iconColor
                        }}
                    >
                        {icon}
                    </div>
                )}
            </div>
            
            <div className="admin-stat-body">
                <div className="admin-stat-value">{value}</div>
                <div className="admin-stat-footer">
                    {subtext && <span className="admin-stat-subtext">{subtext}</span>}
                    {trend && (
                        <span className={`admin-trend-badge ${trend.isPositive ? 'trend-up' : 'trend-down'}`}>
                            {trend.isPositive ? '↑' : '↓'} {trend.text}
                        </span>
                    )}
                </div>
            </div>

            {/* Subtle matte ambient glow line */}
            <div className="admin-stat-glow-line" />
        </div>
    );
}
