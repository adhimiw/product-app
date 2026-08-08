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
    const height = 220;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...data.map(d => d.value), 10) * 1.15;
    const barWidth = Math.min(36, (chartWidth / (data.length || 1)) * 0.45);

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
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Comparative order volume per period
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
                                    <stop offset="0%" stopColor="#1b3b2b" />
                                    <stop offset="100%" stopColor="#285c43" />
                                </linearGradient>
                                <linearGradient id="barHoverGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#c2a13f" />
                                    <stop offset="100%" stopColor="#d8b756" />
                                </linearGradient>
                            </defs>

                            {/* Y-axis Ticks & Horizontal Lines */}
                            {yTicks.map((t, i) => {
                                const y = height - paddingBottom - (t / maxVal) * chartHeight;
                                return (
                                    <g key={i}>
                                        <line
                                            x1={paddingLeft}
                                            y1={y}
                                            x2={width - paddingRight}
                                            y2={y}
                                            stroke="rgba(27, 59, 43, 0.08)"
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
                                            {t}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Render Bars */}
                            {bars.map((bar) => {
                                const isHovered = hoveredBar?.index === bar.index;
                                return (
                                    <g
                                        key={bar.index}
                                        onMouseEnter={() => setHoveredBar(bar)}
                                        onMouseLeave={() => setHoveredBar(null)}
                                    >
                                        <rect
                                            x={bar.x}
                                            y={bar.y}
                                            width={barWidth}
                                            height={bar.barHeight}
                                            rx="4"
                                            fill={isHovered ? "url(#barHoverGradient)" : "url(#barGradient)"}
                                            style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                                        />
                                        <text
                                            x={bar.x + barWidth / 2}
                                            y={height - 12}
                                            textAnchor="middle"
                                            fill="var(--color-text-muted)"
                                            fontSize="11"
                                            fontWeight={isHovered ? '700' : '500'}
                                            fontFamily="var(--font-sans)"
                                        >
                                            {bar.label}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Tooltip */}
                            {hoveredBar && (
                                <g transform={`translate(${hoveredBar.x + barWidth / 2}, ${hoveredBar.y - 30})`}>
                                    <rect x="-35" y="0" width="70" height="24" rx="4" fill="#182e22" />
                                    <text x="0" y="16" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="700">
                                        {hoveredBar.value} Orders
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
