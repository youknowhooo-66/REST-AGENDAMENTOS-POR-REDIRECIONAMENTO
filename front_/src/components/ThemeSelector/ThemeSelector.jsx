import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { IconSun, IconMoon, IconBriefcase, IconPalette } from '../Icons';

const ThemeSelector = ({ className = '' }) => {
    const {
        themeMode,
        setThemeMode,
        colorTheme,
        setColorTheme,
        availableColors,
        isDark
    } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    // Toggle logic: Light -> Dark -> System
    const handleToggleMode = () => {
        if (themeMode === 'light') setThemeMode('dark');
        else if (themeMode === 'dark') setThemeMode('system');
        else setThemeMode('light');
    };

    return (
        <div className={`relative flex items-center gap-2 ${className}`}>
            {/* Mode Toggle Button */}
            <button
                onClick={handleToggleMode}
                className="p-2 rounded-lg transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
                title={`Modo: ${themeMode === 'system' ? 'Sistema' : themeMode === 'dark' ? 'Escuro' : 'Claro'}`}
                aria-label="Alternar modo de tema"
            >
                {themeMode === 'light' && <IconSun size={20} className="text-warning" />}
                {themeMode === 'dark' && <IconMoon size={20} className="text-primary" />}
                {themeMode === 'system' && <IconBriefcase size={20} className="text-muted-foreground" />}
            </button>

            {/* Color Theme Selector */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background-elevated hover:bg-muted transition-all text-sm font-medium text-foreground"
                >
                    <IconPalette size={16} />
                    <span className="hidden sm:inline">
                        {availableColors[colorTheme]?.name || 'Tema'}
                    </span>
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute right-0 mt-2 w-48 bg-background-elevated border border-border rounded-lg shadow-xl z-20 overflow-hidden animate-fade-in-up">
                            <div className="p-1">
                                {Object.entries(availableColors).map(([key, value]) => (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setColorTheme(key);
                                            setIsOpen(false);
                                        }}
                                        className={`
                                            w-full px-3 py-2 text-left flex items-center gap-3 rounded-md transition-colors text-sm
                                            ${colorTheme === key ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-muted'}
                                        `}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full shadow-sm"
                                            style={{ backgroundColor: value.colors['--primary'] }}
                                        />
                                        <span>{value.name}</span>
                                        {colorTheme === key && (
                                            <span className="ml-auto text-xs font-bold">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ThemeSelector;
