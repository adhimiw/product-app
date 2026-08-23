import React, { useState, useEffect } from 'react';
import { adminAnalyticsService } from '../../services/adminAnalyticsService';

export default function OrderPerformanceBarChart() {
    const [data, setData] = useState([]);
    const [hoveredBar, setHoveredBar] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        adminAnalyticsService.getOrderPerformance('30D').then(res => {
            if (isMounted && res.success) {
                setData(res.data);
                setLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, []);

    const width = 450;
    const height = 200;
    const paddingLeft = 40;
    const paddingRight = 16;
    const paddingTop = 20;
    const paddingBottom = 32;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...data.map(d => d.value), 10) * 1.15;
    const barWidth = Math.min(32, (chartWidth / (data.length || 1)) * 0.45);

    const bars = data.map((d, idx) => {
        const groupWidth = chartWidth / data.length;
        const x = paddingLeft + idx * groupWidth + (groupWidth - barWidth) / 2;
        const barHeight = (d.value / maxVal) * chartHeight;
        const y = height - paddingBottom - barHeight;
        return { ...d, x, y, barHeight, index: idx };
    });

    const yTicks = [0, 0.5, 1].map(r => Math.round(maxVal * r));

    return (
        <div className="admin-card admin-chart-card">
            <div className="admin-card-header">
                <div>
                    <h3 className="admin-card-title">Order Performance</h3>
                    <p style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)', margin: '1px 0 0 0' }}>
                        Comparative volume per historical period
                    </p>
                </div>
            </div>

            <div className="admin-chart-body">
                {loading ? (
                    <div className="admin-chart-loading">Loading performance data...</div>
                ) : (
                    <div className="admin-svg-wrapper">
                        <svg viewBox={`0 0 ${width} ${height}`} className="admin-chart-svg">
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10B981" />
                                    <stop offset="100%" stopColor="#059669" />
                                </linearGradient>
                                <linearGradient id="barHoverGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#3B82F6" />
                                    <stop offset="100%" stopColor="#1D4ED8" />
                                </linearGradient>
                            </defs>

                            {/* Horizontal grid lines & Y labels */}
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

                            {/* Bars */}
                            {bars.map((bar, idx) => {
                                const isHovered = hoveredBar?.index === idx;
                                return (
                                    <g
                                        key={idx}
                                        onMouseEnter={() => setHoveredBar(bar)}
                                        onMouseLeave={() => setHoveredBar(null)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {/* Bar Rect */}
                                        <rect
                                            x={bar.x}
                                            y={bar.y}
                                            width={barWidth}
                                            height={bar.barHeight}
                                            rx="4"
                                            fill={isHovered ? "url(#barHoverGradient)" : "url(#barGradient)"}
                                            style={{ transition: 'all 0.15s ease' }}
                                        />

                                        {/* Value above bar */}
                                        <text
                                            x={bar.x + barWidth / 2}
                                            y={bar.y - 6}
                                            textAnchor="middle"
                                            fill={isHovered ? "var(--admin-primary)" : "var(--admin-text-main)"}
                                            fontSize="10"
                                            fontWeight="700"
                                        >
                                            {bar.value}
                                        </text>

                                        {/* X-axis Label */}
                                        <text
                                            x={bar.x + barWidth / 2}
                                            y={height - 10}
                                            textAnchor="middle"
                                            fill="var(--admin-text-muted)"
                                            fontSize="10"
                                            fontWeight="600"
                                        >
                                            {bar.period}
                                        </text>
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
