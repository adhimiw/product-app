import React from 'react';

export default function PageHeader({
    breadcrumbs = [],
    title,
    description,
    actions
}) {
    return (
        <div className="admin-page-header">
            <div>
                {breadcrumbs.length > 0 && (
                    <nav className="admin-breadcrumb" aria-label="Breadcrumb">
                        {breadcrumbs.map((crumb, idx) => (
                            <React.Fragment key={idx}>
                                {idx > 0 && <span className="admin-breadcrumb-separator">/</span>}
                                <span className={idx === breadcrumbs.length - 1 ? "admin-breadcrumb-active" : ""}>
                                    {crumb}
                                </span>
                            </React.Fragment>
                        ))}
                    </nav>
                )}
                <h1 className="admin-page-header-title">{title}</h1>
                {description && <p className="admin-page-header-desc">{description}</p>}
            </div>

            {actions && (
                <div className="admin-page-header-actions">
                    {actions}
                </div>
            )}
        </div>
    );
}
