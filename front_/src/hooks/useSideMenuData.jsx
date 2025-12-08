import React from 'react';
import {
    IconDashboard,
    IconCalendarCheck,
    IconUsers,
    IconBriefcase,
    IconClock,
    IconUser // Adicionado para Perfil
} from "../components/Icons"; // Path adjusted as it's a hook now

export const useSideMenuData = (user) => {
    const menuItems = React.useMemo(() => {
        const baseItems = [
            { to: "/dashboard", icon: <IconDashboard size={20} />, label: "Dashboard", key: "dashboard" },
        ];

        if (!user) {
            return []; // No user, no menu items (or only public ones if any)
        }

        let roleSpecificItems = [];

        if (user.role === 'CLIENT') {
            roleSpecificItems = [
                { to: "/client/booking", icon: <IconCalendarCheck size={20} />, label: "Agendar Serviço", key: "client-booking" },
                { to: "/appointments", icon: <IconClock size={20} />, label: "Meus Agendamentos", key: "my-appointments" },
            ];
        } else if (user.role === 'PROVIDER') {
            roleSpecificItems = [
                { to: "/provider/services", icon: <IconBriefcase size={20} />, label: "Meus Serviços", key: "provider-services" },
                { to: "/provider/staff", icon: <IconUsers size={20} />, label: "Funcionários", key: "provider-staff" },
                { to: "/provider/slots", icon: <IconClock size={20} />, label: "Horários", key: "provider-slots" },
                { to: "/appointments", icon: <IconCalendarCheck size={20} />, label: "Agendamentos", key: "provider-appointments" },
            ];
        }

        // Common items for ADMIN/PROVIDER
        if (user.role === 'ADMIN' || user.role === 'PROVIDER') {
            // Check if 'Usuários' item already exists to avoid duplication if it's considered common
            const usersItemExists = roleSpecificItems.some(item => item.key === 'users');
            if (!usersItemExists) {
                roleSpecificItems.push({ to: "/users", icon: <IconUsers size={20} />, label: "Usuários", key: "users" });
            }
        }

        return [...baseItems, ...roleSpecificItems];
    }, [user]); // Recompute only if user object changes

    return menuItems;
};
