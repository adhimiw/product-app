import React, { useState, useEffect } from 'react';
import { TIME_PERIODS, adminAnalyticsService } from '../../services/adminAnalyticsService';

export default function OrderTimelineChart() {
    const [period, setPeriod] = useState('30D');
    const [data, setData] = useState([]);
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        adminAnalyticsService.getOrderTimeline(period).then(res => {
            if (isMounted && res.success) {
                setData(res.data);
                setLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, [period]);

    // Dimensions for SVG container
    const width = 800;
    const height = 260;
    const paddingLeft = 50;
    const paddingRight = 30;
    const paddingTop = 30;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...data.map(d => d.orders), 10) * 1.15;

    const points = data.map((d, index) => {
        const x = paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
        const y = height - paddingBottom - (d.orders / maxVal) * chartHeight;
        return { x, y, label: d.label, val: d.orders };
    });

    // Generate smooth cubic bezier SVG path string
    const generatePath = (pts) => {
        if (pts.length === 0) return '';
        if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

        let d = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[i];
            const p1 = pts[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 2;
            const cp1y = p0.y;
            const cp2x = p0.x + (p1.x - p0.x) / 2;
            const cp2y = p1.y;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }
        return d;
    };

    const linePath = generatePath(points);
    const areaPath = points.length > 0
        ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
        : '';

    // Horizontal Y-axis grid lines (4 ticks)
    const yTicks = [0, 0.33, 0.66, 1].map(ratio => Math.round(maxVal * ratio));

    return (
        <div className="admin-card admin-chart-card primary-chart">
            <div className="admin-card-header">
                <div>
                    <h3 className="admin-card-title">Order Timeline</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Order volume over time across selected historical periods
                    </p>
                </div>

                <div className="admin-tabs">
                    {TIME_PERIODS.map(p => (
                        <button
                            key={p.id}
                            className={`admin-tab-btn ${period === p.id ? 'active' : ''}`}
                            onClick={() => setPeriod(p.id)}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="admin-chart-body">
                {loading ? (
                    <div className="admin-chart-loading">Loading timeline data...</div>
                ) : (
                    <div className="admin-svg-wrapper">
                        <svg viewBox={`0 0 ${width} ${height}`} className="admin-chart-svg">
                            <defs>
                                <linearGradient id="orderTimelineGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#1b3b2b" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#1b3b2b" stopOpacity="0.01" />
                                </linearGradient>
                            </defs>

                            {/* Horizontal Grid Lines & Y Labels */}
                            {yTicks.map((tick, idx) => {
                                const y = height - paddingBottom - (tick / maxVal) * chartHeight;
                                return (
                                    <g key={idx}>
                                        <line
                                            x1={paddingLeft}
                                            y1={y}
                                            x2={width - paddingRight}
                                            y2={y}
                                            stroke="rgba(27, 59, 43, 0.08)"
                                            strokeDasharray="4,4"
                                        />
                                        <text
                                            x={paddingLeft - 10}
                                            y={y + 4}
                                            textAnchor="end"
                                            fill="var(--color-text-muted)"
                                            fontSize="11"
                                            fontFamily="var(--font-sans)"
                                        >
                                            {tick}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Area & Line */}
                            <path d={areaPath} fill="url(#orderTimelineGradient)" />
                            <path d={linePath} fill="none" stroke="#1b3b2b" strokeWidth="3" strokeLinecap="round" />

                            {/* Data Points & X Labels */}
                            {points.map((pt, idx) => {
                                const isHovered = hoveredPoint?.index === idx;
                                return (
                                    <g key={idx} onMouseEnter={() => setHoveredPoint({ ...pt, index: idx })} onMouseLeave={() => setHoveredPoint(null)}>
                                        {/* X-axis Label */}
                                        <text
                                            x={pt.x}
                                            y={height - 12}
                                            textAnchor="middle"
                                            fill="var(--color-text-muted)"
                                            fontSize="12"
                                            fontWeight={isHovered ? '700' : '500'}
                                            fontFamily="var(--font-sans)"
                                        >
                                            {pt.label}
                                        </text>

                                        {/* Point Circle */}
                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={isHovered ? '6' : '4'}
                                            fill="#ffffff"
                                            stroke="#1b3b2b"
                                            strokeWidth={isHovered ? '3' : '2'}
                                            style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                                        />
                                    </g>
                                );
                            })}

                            {/* Hover Tooltip Overlay */}
                            {hoveredPoint && (
                                <g transform={`translate(${hoveredPoint.x}, ${hoveredPoint.y - 45})`}>
                                    <rect
                                        x="-45"
                                        y="0"
                                        width="90"
                                        height="34"
                                        rx="6"
                                        fill="#1b3b2b"
                                        boxShadow="0 4px 12px rgba(0,0,0,0.15)"
                                    />
                                    <text x="0" y="14" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="500">
                                        {hoveredPoint.label}
                                    </text>
                                    <text x="0" y="27" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700">
                                        {hoveredPoint.val} Orders
                                    </text>
                                </g>
                            )}
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}
