import React from 'react';

const AppointmentTable = ({ appointments, onCancelAppointment, isProviderView }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Agendamento ID
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {isProviderView ? 'Nome do Cliente' : 'Nome do Provedor'}
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Serviço
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Imagem do Serviço
            </th>
            {isProviderView && (
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Imagem do Profissional
                </th>
            )}
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Data de Início
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Fim
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
            <tr key={appointment.id}>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {appointment.id}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {isProviderView ? appointment.clientName : appointment.providerName}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {appointment.serviceName}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {appointment.serviceImageUrl && <img src={`http://localhost:3000${appointment.serviceImageUrl}`} alt="Service" className="w-10 h-10 object-cover rounded-full" />}
              </td>
              {isProviderView && (
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {appointment.staffImageUrl && <img src={`http://localhost:3000${appointment.staffImageUrl}`} alt="Staff" className="w-10 h-10 object-cover rounded-full" />}
                  </td>
              )}
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {new Date(appointment.startTime).toLocaleString()}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {new Date(appointment.endTime).toLocaleString()}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  appointment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800' // For other statuses like PENDING
                }`}>
                  {appointment.status}
                </span>
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {onCancelAppointment && appointment.status !== 'CANCELLED' && (
                  <button
                    onClick={() => onCancelAppointment(appointment.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Cancelar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentTable;
