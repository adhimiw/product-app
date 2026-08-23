import React, { useState, useEffect } from 'react';
import { adminAnalyticsService } from '../../services/adminAnalyticsService';

export default function OrderStatusPieChart() {
    const [statusData, setStatusData] = useState([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [hoveredSlice, setHoveredSlice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        adminAnalyticsService.getOrdersByStatus().then(res => {
            if (isMounted && res.success) {
                setStatusData(res.data);
                setTotalOrders(res.total);
                setLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, []);

    // SVG donut dimensions
    const size = 180;
    const center = size / 2;
    const radius = 62;
    const strokeWidth = 22;

    // Calculate arc angles
    let cumulativeAngle = -90; // start at top

    const slices = statusData.map(item => {
        const angle = (item.count / (totalOrders || 1)) * 360;
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + angle;
        cumulativeAngle = endAngle;

        // Path calculation for arc stroke
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;
        const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

        return {
            ...item,
            pathData,
            startAngle,
            endAngle
        };
    });

    return (
        <div className="admin-card admin-chart-card">
            <div className="admin-card-header">
                <div>
                    <h3 className="admin-card-title">Orders by Status</h3>
                    <p style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', margin: '1px 0 0 0' }}>
                        Current fulfillment distribution
                    </p>
                </div>
            </div>

            <div className="admin-chart-body">
                {loading ? (
                    <div className="admin-chart-loading">Loading status distribution...</div>
                ) : (
                    <div className="admin-pie-layout">
                        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
                            <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
                                <circle
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    fill="none"
                                    stroke="var(--admin-surface-active)"
                                    strokeWidth={strokeWidth}
                                />

                                {slices.map((slice, idx) => {
                                    const isHovered = hoveredSlice?.status === slice.status;
                                    return (
                                        <path
                                            key={idx}
                                            d={slice.pathData}
                                            fill="none"
                                            stroke={slice.color}
                                            strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                                            strokeLinecap="butt"
                                            style={{
                                                transition: 'stroke-width 0.15s ease, opacity 0.15s ease',
                                                cursor: 'pointer',
                                                opacity: hoveredSlice && !isHovered ? 0.45 : 1
                                            }}
                                            onMouseEnter={() => setHoveredSlice(slice)}
                                            onMouseLeave={() => setHoveredSlice(null)}
                                        />
                                    );
                                })}
                            </svg>

                            {/* Donut Center Display */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                pointerEvents: 'none'
                            }}>
                                <span style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 800,
                                    color: 'var(--admin-text-main)',
                                    lineHeight: 1.1
                                }}>
                                    {hoveredSlice ? hoveredSlice.count : totalOrders}
                                </span>
                                <span style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 600,
                                    color: 'var(--admin-text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.04em'
                                }}>
                                    {hoveredSlice ? hoveredSlice.label : 'Orders'}
                                </span>
                            </div>
                        </div>

                        {/* Status Legend Pills */}
                        <div className="admin-pie-legend">
                            {statusData.map(item => {
                                const isHovered = hoveredSlice?.status === item.status;
                                return (
                                    <div
                                        key={item.status}
                                        className="admin-legend-item"
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            backgroundColor: isHovered ? 'var(--admin-surface-hover)' : 'transparent',
                                            transition: 'background-color 0.15s ease'
                                        }}
                                        onMouseEnter={() => setHoveredSlice(item)}
                                        onMouseLeave={() => setHoveredSlice(null)}
                                    >
                                        <span className="admin-legend-dot" style={{ backgroundColor: item.color }} />
                                        <span className="admin-legend-label">{item.label}</span>
                                        <span className="admin-legend-value">{item.count}</span>
                                        <span className="admin-legend-percent">({item.percentage}%)</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
