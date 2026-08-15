import React from 'react';

export default function TableSkeleton({
    columns = 6,
    rows = 5,
    rowHeight = 48
}) {
    const colList = Array.from({ length: columns });
    const rowList = Array.from({ length: rows });

    return (
        <div className="admin-table-responsive">
            <table className="admin-table">
                <thead>
                    <tr>
                        {colList.map((_, colIdx) => (
                            <th key={colIdx} style={{ padding: '14px 16px' }}>
                                <div
                                    className="admin-skeleton"
                                    style={{
                                        height: '14px',
                                        width: colIdx === 0 ? '60px' : colIdx === 1 ? '120px' : '80px'
                                    }}
                                />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rowList.map((_, rowIdx) => (
                        <tr key={rowIdx}>
                            {colList.map((_, colIdx) => (
                                <td key={colIdx} style={{ padding: '16px' }}>
                                    <div
                                        className="admin-skeleton"
                                        style={{
                                            height: '16px',
                                            width: colIdx === 0 
                                                ? '80px' 
                                                : colIdx === 1 
                                                ? '160px' 
                                                : colIdx === colList.length - 1 
                                                ? '90px' 
                                                : '100px',
                                            borderRadius: '6px'
                                        }}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
