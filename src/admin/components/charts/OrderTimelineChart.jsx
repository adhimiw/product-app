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
    const width = 600;
    const height = 230;
    const paddingLeft = 45;
    const paddingRight = 24;
    const paddingTop = 24;
    const paddingBottom = 34;

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

    // Horizontal Y-axis grid lines (3 ticks)
    const yTicks = [0, 0.5, 1].map(ratio => Math.round(maxVal * ratio));

    return (
        <div className="admin-card admin-chart-card">
            <div className="admin-card-header">
                <div>
                    <h3 className="admin-card-title">Order Timeline</h3>
                    <p style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', margin: '1px 0 0 0' }}>
                        Historical order volumes
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
                                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
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
                                            stroke="var(--admin-border-color)"
                                            strokeDasharray="3,3"
                                        />
                                        <text
                                            x={paddingLeft - 8}
                                            y={y + 3}
                                            textAnchor="end"
                                            fill="var(--admin-text-muted)"
                                            fontSize="10"
                                            fontWeight="600"
                                        >
                                            {tick}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Area & Line */}
                            <path d={areaPath} fill="url(#orderTimelineGradient)" />
                            <path d={linePath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />

                            {/* Data Points & X Labels */}
                            {points.map((pt, idx) => {
                                const isHovered = hoveredPoint?.index === idx;
                                return (
                                    <g key={idx} onMouseEnter={() => setHoveredPoint({ ...pt, index: idx })} onMouseLeave={() => setHoveredPoint(null)}>
                                        {/* X-axis Label */}
                                        <text
                                            x={pt.x}
                                            y={height - 10}
                                            textAnchor="middle"
                                            fill="var(--admin-text-muted)"
                                            fontSize="10"
                                            fontWeight="600"
                                        >
                                            {pt.label}
                                        </text>

                                        {/* Point Circle */}
                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={isHovered ? 5 : 3.5}
                                            fill={isHovered ? '#10B981' : '#FFFFFF'}
                                            stroke="#10B981"
                                            strokeWidth={isHovered ? 2.5 : 2}
                                            style={{ transition: 'all 0.15s ease', cursor: 'pointer' }}
                                        />

                                        {/* Tooltip Hover Overlay */}
                                        {isHovered && (
                                            <g>
                                                <rect
                                                    x={pt.x - 36}
                                                    y={pt.y - 32}
                                                    width="72"
                                                    height="22"
                                                    rx="4"
                                                    fill="#0F172A"
                                                />
                                                <text
                                                    x={pt.x}
                                                    y={pt.y - 18}
                                                    textAnchor="middle"
                                                    fill="#FFFFFF"
                                                    fontSize="10"
                                                    fontWeight="700"
                                                >
                                                    {pt.val} orders
                                                </text>
                                            </g>
                                        )}
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}
