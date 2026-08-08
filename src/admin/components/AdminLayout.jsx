import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayout({ children, activeTab, setActiveTab, user, onLogout, onGoToStore, onResetData }) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    return (
        <div className="admin-app-shell">
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={(tab) => {
                    setActiveTab(tab);
                    setIsMobileSidebarOpen(false);
                }}
                user={user}
                onLogout={onLogout}
                onGoToStore={onGoToStore}
                isOpen={isMobileSidebarOpen}
            />

            <div className="admin-main-wrapper">
                <AdminHeader
                    activeTab={activeTab}
                    onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    onGoToStore={onGoToStore}
                    onResetData={onResetData}
                />
                <main className="admin-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
