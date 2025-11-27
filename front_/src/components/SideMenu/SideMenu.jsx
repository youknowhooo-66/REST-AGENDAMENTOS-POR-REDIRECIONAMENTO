import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
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
    IconUser // Adicionado para Perfil
} from "../Icons";

// Componente para cada item do menu
const MenuItem = ({ to, icon, children, isCollapsed }) => (
    <li>
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-text-muted hover:bg-muted hover:text-text'
                }`
            }
        >
            {icon}
            <span className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 ml-0' : 'w-full ml-3'}`}>
                {children}
            </span>
        </NavLink>
    </li>
);

const SideMenu = ({ isCollapsed, toggleMenu }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useContext(ThemeContext);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`fixed inset-0 bg-black/60 z-30 md:hidden ${isCollapsed ? 'hidden' : 'block'}`}
                onClick={toggleMenu}
            ></div>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-background border-r border-border text-text flex flex-col transition-all duration-300 ease-in-out z-40 ${
                    isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-64'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className={`flex items-center gap-2 overflow-hidden transition-all duration-200 ${isCollapsed ? 'md:w-0' : 'w-full'}`}>
                        <IconTicket size={28} className="text-primary" />
                        <h1 className="font-bold text-xl whitespace-nowrap">
                            SA-SENAI
                        </h1>
                    </div>
                    <button
                        onClick={toggleMenu}
                        className="text-text-muted hover:text-primary focus:outline-none md:hidden"
                    >
                        <IconClose size={24} />
                    </button>
                </div>

                {/* Menu */}
                <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                    <ul>
                        <MenuItem to="/dashboard" icon={<IconDashboard size={20} />} isCollapsed={isCollapsed}>
                            Dashboard
                        </MenuItem>
                        <MenuItem to="/profile" icon={<IconUser size={20} />} isCollapsed={isCollapsed}>
                            Meu Perfil
                        </MenuItem>
                        {user && user.role === 'PROVIDER' && (
                            <>
                                <MenuItem to="/provider/services" icon={<IconBriefcase size={20} />} isCollapsed={isCollapsed}>
                                    Meus Serviços
                                </MenuItem>
                                <MenuItem to="/provider/staff" icon={<IconUsers size={20} />} isCollapsed={isCollapsed}>
                                    Funcionários
                                </MenuItem>
                                <MenuItem to="/provider/slots" icon={<IconClock size={20} />} isCollapsed={isCollapsed}>
                                    Horários
                                </MenuItem>
                            </>
                        )}
                        <MenuItem to="/appointments" icon={<IconCalendarCheck size={20} />} isCollapsed={isCollapsed}>
                            Agendamentos
                        </MenuItem>
                        <MenuItem to="/users" icon={<IconUsers size={20} />} isCollapsed={isCollapsed}>
                            Usuários
                        </MenuItem>
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-2 border-t border-border">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center p-3 my-1 w-full rounded-lg transition-colors duration-200 text-text-muted hover:bg-muted hover:text-text"
                    >
                        {theme === 'light' ? <IconMoon size={20} /> : <IconSun size={20} />}
                        <span className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 ml-0' : 'w-full ml-3'}`}>
                            {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                        </span>
                    </button>
                    <button
                        className="flex items-center p-3 my-1 w-full rounded-lg transition-colors duration-200 text-destructive/90 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={handleLogout}
                    >
                        <IconLogOut size={20} />
                        <span className={`overflow-hidden transition-all duration-200 ${isCollapsed ? 'w-0 ml-0' : 'w-full ml-3'}`}>
                            Sair
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default SideMenu;