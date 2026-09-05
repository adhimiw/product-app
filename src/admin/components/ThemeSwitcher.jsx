import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeSwitcher({ theme = 'light', onToggle, onToggleTheme }) {
    const isDark = theme === 'dark';
    const handleToggle = onToggle || onToggleTheme;

    return (
        <button
            type="button"
            className={`admin-theme-toggle-btn ${isDark ? 'is-dark' : 'is-light'}`}
            onClick={handleToggle}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
            <div className="admin-theme-toggle-track">
                <div className="admin-theme-toggle-thumb">
                    {isDark ? (
                        <Sun size={14} className="admin-theme-icon-sun" />
                    ) : (
                        <Moon size={14} className="admin-theme-icon-moon" />
                    )}
                </div>
            </div>
            <span className="admin-theme-toggle-label">{isDark ? 'Dark' : 'Light'}</span>
        </button>
    );
}
