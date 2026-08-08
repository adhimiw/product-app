import React, { useState, useEffect } from 'react';
import { TIME_PERIODS, adminAnalyticsService } from '../../services/adminAnalyticsService';

export default function RevenueTimelineChart() {
    const [period, setPeriod] = useState('30D');
    const [data, setData] = useState([]);
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        adminAnalyticsService.getRevenueTimeline(period).then(res => {
            if (isMounted && res.success) {
                setData(res.data);
                setLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, [period]);

    const formatCurrency = (amt) => {
        if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`;
        if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}k`;
        return `₹${amt}`;
    };

    const width = 800;
    const height = 240;
    const paddingLeft = 55;
    const paddingRight = 30;
    const paddingTop = 30;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...data.map(d => d.revenue), 1000) * 1.15;

    const points = data.map((d, index) => {
        const x = paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
        const y = height - paddingBottom - (d.revenue / maxVal) * chartHeight;
        return { x, y, label: d.label, val: d.revenue };
    });

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

    const yTicks = [0, 0.33, 0.66, 1].map(r => Math.round(maxVal * r));

    return (
        <div className="admin-card admin-chart-card">
            <div className="admin-card-header">
                <div>
                    <h3 className="admin-card-title">Revenue Timeline</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Gross sales revenue trends over selected time periods
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
                    <div className="admin-chart-loading">Loading revenue data...</div>
                ) : (
                    <div className="admin-svg-wrapper">
                        <svg viewBox={`0 0 ${width} ${height}`} className="admin-chart-svg">
                            <defs>
                                <linearGradient id="revenueTimelineGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#c2a13f" stopOpacity="0.3" />
                                    <stop offset="100%" stopColor="#c2a13f" stopOpacity="0.01" />
                                </linearGradient>
                            </defs>

                            {/* Horizontal Grid Lines */}
                            {yTicks.map((t, idx) => {
                                const y = height - paddingBottom - (t / maxVal) * chartHeight;
                                return (
                                    <g key={idx}>
                                        <line
                                            x1={paddingLeft}
                                            y1={y}
                                            x2={width - paddingRight}
                                            y2={y}
                                            stroke="rgba(194, 161, 63, 0.12)"
                                            strokeDasharray="4,4"
                                        />
                                        <text
                                            x={paddingLeft - 8}
                                            y={y + 4}
                                            textAnchor="end"
                                            fill="var(--color-text-muted)"
                                            fontSize="11"
                                            fontFamily="var(--font-sans)"
                                        >
                                            {formatCurrency(t)}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Area & Line */}
                            <path d={areaPath} fill="url(#revenueTimelineGradient)" />
                            <path d={linePath} fill="none" stroke="#c2a13f" strokeWidth="3" strokeLinecap="round" />

                            {/* Data Points */}
                            {points.map((pt, idx) => {
                                const isHovered = hoveredPoint?.index === idx;
                                return (
                                    <g key={idx} onMouseEnter={() => setHoveredPoint({ ...pt, index: idx })} onMouseLeave={() => setHoveredPoint(null)}>
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

                                        <circle
                                            cx={pt.x}
                                            cy={pt.y}
                                            r={isHovered ? '6' : '4'}
                                            fill="#ffffff"
                                            stroke="#c2a13f"
                                            strokeWidth={isHovered ? '3' : '2'}
                                            style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                                        />
                                    </g>
                                );
                            })}

                            {/* Hover Tooltip */}
                            {hoveredPoint && (
                                <g transform={`translate(${hoveredPoint.x}, ${hoveredPoint.y - 45})`}>
                                    <rect x="-50" y="0" width="100" height="34" rx="6" fill="#182e22" />
                                    <text x="0" y="14" textAnchor="middle" fill="#c2a13f" fontSize="10" fontWeight="600">
                                        {hoveredPoint.label}
                                    </text>
                                    <text x="0" y="27" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700">
                                        ₹{hoveredPoint.val.toLocaleString('en-IN')}
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
