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
    const size = 200;
    const center = size / 2;
    const radius = 70;
    const strokeWidth = 26;

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
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Current fulfillment distribution
                    </p>
                </div>
            </div>

            <div className="admin-chart-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {loading ? (
                    <div className="admin-chart-loading">Loading status distribution...</div>
                ) : (
                    <>
                        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
                            <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
                                <circle
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    fill="none"
                                    stroke="rgba(27, 59, 43, 0.05)"
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
                                                transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                                                cursor: 'pointer',
                                                opacity: hoveredSlice && !isHovered ? 0.6 : 1
                                            }}
                                            onMouseEnter={() => setHoveredSlice(slice)}
                                            onMouseLeave={() => setHoveredSlice(null)}
                                        />
                                    );
                                })}
                            </svg>

                            {/* Donut Center Display */}
                            <div className="admin-donut-center">
                                <span className="donut-value">
                                    {hoveredSlice ? hoveredSlice.count : totalOrders}
                                </span>
                                <span className="donut-label">
                                    {hoveredSlice ? hoveredSlice.label : 'Total Orders'}
                                </span>
                            </div>
                        </div>

                        {/* Status Legend Pills */}
                        <div className="admin-pie-legend">
                            {statusData.map(item => (
                                <div
                                    key={item.status}
                                    className={`legend-item ${hoveredSlice?.status === item.status ? 'highlight' : ''}`}
                                    onMouseEnter={() => setHoveredSlice(item)}
                                    onMouseLeave={() => setHoveredSlice(null)}
                                >
                                    <span className="legend-dot" style={{ backgroundColor: item.color }} />
                                    <span className="legend-name">{item.label}</span>
                                    <span className="legend-count">{item.count} ({item.percentage}%)</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
