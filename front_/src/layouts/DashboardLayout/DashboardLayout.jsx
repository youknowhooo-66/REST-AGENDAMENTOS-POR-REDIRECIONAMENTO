import { useState, useEffect, useContext } from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import SideMenu from "../../components/SideMenu/SideMenu";
import { IconMenu, IconSun, IconMoon, IconUser, IconLogOut } from "../../components/Icons";

const Header = ({ toggleMenu }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isProfileOpen, setProfileOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between
            bg-background/70 backdrop-blur-xl border-b border-border 
            p-4 shadow-sm transition-all duration-200"
    >
      {/* Botão de menu (mobile) */}
      <button
        onClick={toggleMenu}
        className="text-text-muted hover:text-primary"
      >
        <IconMenu size={24} />
      </button>

      {/* Título */}
      <div className="hidden md:block font-bold text-xl text-text">
        Painel do Sistema
      </div>

      {/* Ações do cabeçalho */}
      <div className="flex items-center gap-4">
        {/* Perfil do usuário */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 text-text-muted hover:text-primary transition"
            >
              <span className="hidden sm:inline font-medium">
                Olá, {user.name || user.email}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full rounded-full" /> : (user.name ? user.name.charAt(0).toUpperCase() : "?")}
              </div>
            </button>

            {isProfileOpen && (
              <div
                className="absolute right-0 mt-3 w-52 bg-popover text-popover-foreground rounded-xl
                                shadow-lg ring-1 ring-black/5 dark:ring-white/10 overflow-hidden animate-fade-in z-30"
              >
                <div className="px-4 py-3 text-sm border-b border-border">
                  <p className="font-semibold text-text">
                    {user.name}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {user.email}
                  </p>
                </div>

                <Link to="/profile" className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-muted
                                        hover:bg-muted hover:text-text transition-colors">
                  <IconUser size={16} /> Perfil
                </Link>

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive
                                        hover:bg-muted transition-colors"
                >
                  <IconLogOut size={16} /> Sair
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

const DashboardLayout = () => {
  const [isMenuCollapsed, setMenuCollapsed] = useState(
    window.innerWidth < 768
  );

  const toggleMenu = () => setMenuCollapsed(!isMenuCollapsed);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setMenuCollapsed(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="min-h-screen bg-background text-text transition-colors duration-300"
    >
      <SideMenu isCollapsed={isMenuCollapsed} toggleMenu={toggleMenu} />
      <div
        className={`transition-all duration-300 ease-in-out ${
          isMenuCollapsed ? "md:ml-20" : "md:ml-64"
        } ${isMenuCollapsed ? '' : 'ml-64'}`}
      >
        <Header toggleMenu={toggleMenu} />
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
