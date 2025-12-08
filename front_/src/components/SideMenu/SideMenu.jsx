import React, { useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSideMenuData } from '../../hooks/useSideMenuData.jsx';
import Modal from '../Modal/Modal';
import {
    IconDashboard,
    IconCalendarCheck,
    IconUsers,
    IconLogOut,
    IconClose,
    IconTicket,
    IconSun,
    IconMoon,
    IconBriefcase,
    IconClock,
    IconUser,
    IconPalette
} from "../Icons";

// Fallback icon if IconMonitor doesn't exist (likely doesn't, so I'll use IconDashboard as placeholder or just text)
const SystemIcon = IconBriefcase;

// Componente para cada item do menu
const MenuItem = React.memo(({ to, icon, children, isCollapsed }) => (
    <li>
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center p-3 my-1 rounded-xl transition-all duration-200 font-medium ${isActive
                    ? 'bg-gradient-to-r from-primary-dark to-primary text-white shadow-md'
                    : 'text-muted-foreground hover:bg-muted hover:text-primary'
                }`
            }
        >
            {icon}
            <span className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 ml-0' : 'w-full ml-3'}`} aria-hidden={isCollapsed ? "true" : "false"}>
                {children}
            </span>
        </NavLink>
    </li>
));

const SideMenu = ({ isCollapsed, toggleMenu }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const {
        themeMode,
        setThemeMode,
        isDark,
        colorTheme,
        setColorTheme,
        availableColors
    } = useTheme();
    const menuItems = useSideMenuData(user);
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

    const handleLogout = useCallback(() => {
        logout();
        navigate("/");
    }, [logout, navigate]);

    // Cycling through modes for the quick toggle button
    const handleQuickThemeToggle = () => {
        if (themeMode === 'light') setThemeMode('dark');
        else if (themeMode === 'dark') setThemeMode('system');
        else setThemeMode('light');
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/60 z-30 md:hidden ${isCollapsed ? 'hidden' : 'block'}`}
                onClick={toggleMenu}
                aria-label="Close menu"
                role="button"
                tabIndex={0}
            ></div>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-background-elevated border-r border-border text-foreground flex flex-col transition-all duration-300 ease-in-out z-40 shadow-xl
                    ${isCollapsed ? 'w-20' : 'w-64'}
                    ${isCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}
                role="navigation"
                aria-label="Main sidebar navigation"
                aria-expanded={!isCollapsed}
                aria-hidden={isCollapsed ? "true" : "false"}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className={`flex items-center gap-2 overflow-hidden transition-all duration-200 ${isCollapsed ? 'md:w-0' : 'w-full'}`}>
                        <IconTicket size={28} className="text-primary" />
                        <h1 className="font-bold text-xl whitespace-nowrap text-foreground">
                            SA-SENAI
                        </h1>
                    </div>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar" aria-label="Sidebar menu items">
                    <ul>
                        {menuItems.map(item => (
                            <MenuItem
                                key={item.key}
                                to={item.to}
                                icon={item.icon}
                                isCollapsed={isCollapsed}
                            >
                                {item.label}
                            </MenuItem>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-2 border-t border-border space-y-1">
                    <button
                        onClick={() => setIsThemeModalOpen(true)}
                        className="flex items-center p-3 w-full rounded-xl transition-colors duration-200 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Personalizar Tema"
                    >
                        <IconPalette size={20} />
                        <span className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 ml-0' : 'w-full ml-3'}`} aria-hidden={isCollapsed ? "true" : "false"}>
                            Personalizar
                        </span>
                    </button>

                    <button
                        onClick={handleQuickThemeToggle}
                        className="flex items-center p-3 w-full rounded-xl transition-colors duration-200 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label={`Current theme: ${themeMode}`}
                    >
                        {themeMode === 'light' && <IconSun size={20} />}
                        {themeMode === 'dark' && <IconMoon size={20} />}
                        {themeMode === 'system' && <IconBriefcase size={20} />}
                        <span className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 ml-0' : 'w-full ml-3'}`} aria-hidden={isCollapsed ? "true" : "false"}>
                            {themeMode === 'light' ? 'Claro' : themeMode === 'dark' ? 'Escuro' : 'Sistema'}
                        </span>
                    </button>

                    <button
                        className="flex items-center p-3 w-full rounded-xl transition-colors duration-200 text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                        aria-label="Logout"
                    >
                        <IconLogOut size={20} />
                        <span className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 ml-0' : 'w-full ml-3'}`} aria-hidden={isCollapsed ? "true" : "false"}>
                            Sair
                        </span>
                    </button>
                </div>
            </aside>

            {/* Theme Customization Modal */}
            <Modal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} maxWidth="sm">
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                            <IconPalette size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Personalizar Aparência</h2>
                        <p className="text-sm text-muted-foreground mt-1">Escolha como você quer visualizar o sistema.</p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground block">Modo</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setThemeMode('light')}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${themeMode === 'light' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-border-strong text-muted-foreground'}`}
                            >
                                <IconSun size={24} />
                                <span className="font-medium text-sm">Claro</span>
                            </button>
                            <button
                                onClick={() => setThemeMode('dark')}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${themeMode === 'dark' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-border-strong text-muted-foreground'}`}
                            >
                                <IconMoon size={24} />
                                <span className="font-medium text-sm">Escuro</span>
                            </button>
                            <button
                                onClick={() => setThemeMode('system')}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${themeMode === 'system' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-border-strong text-muted-foreground'}`}
                            >
                                <IconBriefcase size={24} />
                                <span className="font-medium text-sm">Sistema</span>
                            </button>
                        </div>
                    </div>

                    {/* Color Palette */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground block">Cor de Destaque</label>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.entries(availableColors).map(([key, value]) => (
                                <button
                                    key={key}
                                    onClick={() => setColorTheme(key)}
                                    className={`
                                        group relative flex items-center gap-3 p-2 pr-3 rounded-lg border transition-all text-left
                                        ${colorTheme === key
                                            ? 'border-primary ring-1 ring-primary bg-primary/5'
                                            : 'border-transparent hover:bg-muted'
                                        }
                                    `}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full shadow-sm flex items-center justify-center transition-transform group-hover:scale-110`}
                                        style={{ backgroundColor: value.colors['--primary'] }}
                                    >
                                        {colorTheme === key && <span className="text-white text-xs font-bold">✓</span>}
                                    </div>
                                    <span className="text-sm font-medium text-foreground">
                                        {value.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="p-4 rounded-xl bg-background border border-border">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-light to-primary animate-pulse-glow flex items-center justify-center text-white font-bold">A</div>
                            <div>
                                <div className="h-2.5 w-24 bg-muted-foreground/20 rounded mb-1.5"></div>
                                <div className="h-2 w-16 bg-muted-foreground/20 rounded"></div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-8 flex-1 bg-primary rounded-lg opacity-80"></div>
                            <div className="h-8 w-20 bg-muted-foreground/20 rounded-lg"></div>
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                            Visualização no modo <span className="font-bold">{isDark ? 'Escuro' : 'Claro'}</span>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default SideMenu;