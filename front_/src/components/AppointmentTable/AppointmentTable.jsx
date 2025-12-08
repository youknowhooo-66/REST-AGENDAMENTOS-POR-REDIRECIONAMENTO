import React from 'react';
import { IconUser, IconCalendar, IconClock, IconTrash } from '../../components/Icons'; // Assuming these exist or use similar
import { formatImageUrl } from '../../utils/imageUtils'; // Import formatImageUrl

const AppointmentTable = ({ appointments, onCancelAppointment, isProviderView }) => {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="p-8 text-center bg-card rounded-xl border border-border shadow-sm">
        <p className="text-muted-foreground text-lg">Nenhum agendamento encontrado.</p>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'badge badge-success';
      case 'CANCELLED':
        return 'badge badge-error';
      default:
        return 'badge badge-warning';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmado';
      case 'CANCELLED':
        return 'Cancelado';
      case 'PENDING':
        return 'Pendente';
      default:
        return status;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-secondary/50 border-b border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <th className="px-6 py-4 rounded-tl-lg">ID</th>
            <th className="px-6 py-4">{isProviderView ? 'Cliente' : 'Profissional'}</th>
            <th className="px-6 py-4">Serviço</th>
            <th className="px-6 py-4">Data</th>
            <th className="px-6 py-4">Horário</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 rounded-tr-lg text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {appointments.map((appointment) => {
            const displayImageUrl = isProviderView 
              ? appointment.clientAvatarUrl 
              : appointment.providerAvatarUrl;
            const displayName = isProviderView 
              ? appointment.clientName || appointment.user?.name 
              : appointment.providerName;

            return (
              <tr key={appointment.id} className="hover:bg-muted/50 transition-colors duration-200">
                <td className="px-6 py-4 text-sm text-foreground font-medium">#{appointment.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {displayImageUrl ? (
                      <img
                        src={formatImageUrl(displayImageUrl)}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-background"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <IconUser size={14} />
                      </div>
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {displayName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {appointment.serviceImageUrl && (
                      <img
                        src={formatImageUrl(appointment.serviceImageUrl)}
                        alt="Service"
                        className="w-10 h-10 rounded-lg object-cover border border-border"
                      />
                    )}
                    <span className="text-sm text-foreground">{appointment.serviceName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconCalendar size={14} />
                    {new Date(appointment.startTime).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconClock size={14} />
                    {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadgeClass(appointment.status)}>
                    {getStatusLabel(appointment.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  {onCancelAppointment && appointment.status !== 'CANCELLED' && (
                    <button
                      onClick={() => onCancelAppointment(appointment.id)}
                      className="text-destructive hover:text-destructive-dark hover:bg-destructive/10 p-2 rounded-lg transition-all"
                      title="Cancelar Agendamento"
                    >
                      <IconTrash size={18} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentTable;
