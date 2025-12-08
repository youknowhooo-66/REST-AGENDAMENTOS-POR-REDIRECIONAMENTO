import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';
import { useAuth } from './AuthContext';

// Função auxiliar para converter Hex para RGB (r g b)
const hexToRgb = (hex) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b;
  });
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '0 0 0';
};

// Definição das Paletas de Cores (baseadas no Tailwind)
export const COLOR_THEMES = {
  INDIGO: {
    name: 'Indigo',
    colors: {
      '--primary': '#4f46e5', // indigo-600
      '--primary-light': '#6366f1', // indigo-500
      '--primary-dark': '#4338ca', // indigo-700
      '--ring': '#4f46e5',
    }
  },
  BLUE: {
    name: 'Blue',
    colors: {
      '--primary': '#2563eb', // blue-600
      '--primary-light': '#3b82f6', // blue-500
      '--primary-dark': '#1d4ed8', // blue-700
      '--ring': '#2563eb',
    }
  },
  EMERALD: {
    name: 'Emerald',
    colors: {
      '--primary': '#059669', // emerald-600
      '--primary-light': '#10b981', // emerald-500
      '--primary-dark': '#047857', // emerald-700
      '--ring': '#059669',
    }
  },
  VIOLET: {
    name: 'Violet',
    colors: {
      '--primary': '#7c3aed', // violet-600
      '--primary-light': '#8b5cf6', // violet-500
      '--primary-dark': '#6d28d9', // violet-700
      '--ring': '#7c3aed',
    }
  },
  ROSE: {
    name: 'Rose',
    colors: {
      '--primary': '#e11d48', // rose-600
      '--primary-light': '#f43f5e', // rose-500
      '--primary-dark': '#be123c', // rose-700
      '--ring': '#e11d48',
    }
  },
  AMBER: {
    name: 'Amber',
    colors: {
      '--primary': '#d97706', // amber-600
      '--primary-light': '#f59e0b', // amber-500
      '--primary-dark': '#b45309', // amber-700
      '--ring': '#d97706',
    }
  }
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth(); // Access user from AuthContext

  // Estado para o modo de tema: 'light', 'dark', ou 'system'
  const [themeMode, setThemeMode] = useState(() => {
    // Prioritize user's saved themeMode, then localStorage, then system
    if (user?.theme && ['dark', 'light', 'system'].includes(user.theme)) {
        return user.theme;
    }
    return localStorage.getItem('theme-mode') || 'system';
  });

  // Estado calculado para saber se é dark ou não
  const [isDark, setIsDark] = useState(false);

  // Estado para Cor do Tema
  const [colorTheme, setColorTheme] = useState(() => {
    // Prioritize user's saved colorTheme, then localStorage
    if (user?.theme && COLOR_THEMES[user.theme.toUpperCase()]) {
        return user.theme.toUpperCase();
    }
    const saved = localStorage.getItem('theme-color');
    return saved && COLOR_THEMES[saved] ? saved : 'INDIGO';
  });

  // Effect to update themeMode and colorTheme when user changes
  useEffect(() => {
    if (user?.theme) {
        // Update themeMode if user.theme is a valid mode
        if (['dark', 'light', 'system'].includes(user.theme)) {
            setThemeMode(user.theme);
        }
        // Update colorTheme if user.theme is a valid color key
        if (COLOR_THEMES[user.theme.toUpperCase()]) {
            setColorTheme(user.theme.toUpperCase());
        }
    }
  }, [user?.theme]);

  // Efeito para detectar preferências do sistema e atualizar isDark
  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const systemDark = mediaQuery.matches;

      let effectiveDark = false;
      if (themeMode === 'system') {
        effectiveDark = systemDark;
      } else {
        effectiveDark = themeMode === 'dark';
      }

      setIsDark(effectiveDark);

      const root = document.documentElement;
      if (effectiveDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      // Evitar FOUC e transições indesejadas na troca
      root.classList.add('transition-theme');
      setTimeout(() => {
        root.classList.remove('transition-theme');
      }, 0);
    };

    updateTheme();

    // Listener para mudanças no sistema
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [themeMode]);

  // Persistência do modo
  useEffect(() => {
    localStorage.setItem('theme-mode', themeMode);
  }, [themeMode]);

  // Função para aplicar as cores com prioridade
  const applyColors = (themeKey) => {
    const root = document.documentElement;
    const theme = COLOR_THEMES[themeKey];

    if (theme) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        // Converte para RGB para permitir opacidade no Tailwind (ex: bg-primary/20)
        // Usa !important para garantir que a cor selecionada sobrescreva o tema dark/light padrão
        const rgbValue = hexToRgb(value);
        if (rgbValue) {
          root.style.setProperty(key, rgbValue, 'important');
        }
      });

      // Compatibilidade com variáveis legadas (theme.css) e componentes que usam HEX direto
      if (theme.colors['--primary']) {
        root.style.setProperty('--color-primary', theme.colors['--primary'], 'important');
      }
      if (theme.colors['--primary-light']) {
        root.style.setProperty('--color-primary-light', theme.colors['--primary-light'], 'important');
      }
      if (theme.colors['--primary-dark']) {
        root.style.setProperty('--color-primary-dark', theme.colors['--primary-dark'], 'important');
      }
    }
  };

  // Efeito para aplicar Cores do Tema
  useLayoutEffect(() => {
    applyColors(colorTheme);
    localStorage.setItem('theme-color', colorTheme);

    // Atualizar meta theme-color para mobile
    const theme = COLOR_THEMES[colorTheme];
    if (theme) {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme.colors['--primary']);
      }
    }
  }, [colorTheme]);

  const value = {
    themeMode,
    setThemeMode, // 'light' | 'dark' | 'system'
    isDark,
    colorTheme,
    setColorTheme,
    availableColors: COLOR_THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
