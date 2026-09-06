import React from 'react';

export default function TableSkeleton({
    columns = 6,
    rows = 6,
    hasImage = true
}) {
    const rowList = Array.from({ length: rows });

    return (
        <div className="admin-table-responsive" style={{ border: 'none' }}>
            <table className="admin-table">
                <thead>
                    <tr>
                        {hasImage && (
                            <th style={{ width: '64px', paddingLeft: '20px' }}>
                                <div className="admin-skeleton skeleton-cell-sm" style={{ width: '32px', height: '14px' }} />
                            </th>
                        )}
                        <th>
                            <div className="admin-skeleton skeleton-cell-sm" style={{ width: '130px', height: '14px' }} />
                        </th>
                        <th>
                            <div className="admin-skeleton skeleton-cell-sm" style={{ width: '100px', height: '14px' }} />
                        </th>
                        <th>
                            <div className="admin-skeleton skeleton-cell-sm" style={{ width: '80px', height: '14px' }} />
                        </th>
                        <th>
                            <div className="admin-skeleton skeleton-cell-sm" style={{ width: '70px', height: '14px' }} />
                        </th>
                        <th style={{ textAlign: 'right', paddingRight: '20px' }}>
                            <div className="admin-skeleton skeleton-cell-sm" style={{ width: '60px', height: '14px', marginLeft: 'auto' }} />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {rowList.map((_, rowIdx) => (
                        <tr key={rowIdx}>
                            {hasImage && (
                                <td style={{ paddingLeft: '20px' }}>
                                    <div 
                                        className="admin-skeleton" 
                                        style={{ width: '38px', height: '38px', borderRadius: '10px' }} 
                                    />
                                </td>
                            )}
                            <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <div 
                                        className="admin-skeleton" 
                                        style={{ height: '15px', width: `${140 + (rowIdx % 3) * 35}px`, borderRadius: '4px' }} 
                                    />
                                    <div 
                                        className="admin-skeleton" 
                                        style={{ height: '11px', width: `${80 + (rowIdx % 2) * 40}px`, borderRadius: '4px', opacity: 0.7 }} 
                                    />
                                </div>
                            </td>
                            <td>
                                <div 
                                    className="admin-skeleton" 
                                    style={{ height: '13px', width: `${90 + (rowIdx % 4) * 20}px`, borderRadius: '4px' }} 
                                />
                            </td>
                            <td>
                                <div 
                                    className="admin-skeleton" 
                                    style={{ height: '13px', width: '65px', borderRadius: '4px' }} 
                                />
                            </td>
                            <td>
                                <div 
                                    className="admin-skeleton" 
                                    style={{ height: '22px', width: '68px', borderRadius: '12px' }} 
                                />
                            </td>
                            <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                                <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    <div 
                                        className="admin-skeleton" 
                                        style={{ width: '30px', height: '30px', borderRadius: '6px' }} 
                                    />
                                    <div 
                                        className="admin-skeleton" 
                                        style={{ width: '30px', height: '30px', borderRadius: '6px' }} 
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
