import React from 'react';

const AppointmentTable = ({ appointments }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              ID
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Cliente
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Serviço
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Início
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
                {appointment.clientName}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {appointment.serviceName}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {new Date(appointment.startTime).toLocaleString()}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {new Date(appointment.endTime).toLocaleString()}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {appointment.status}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <button className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                <button className="text-red-600 hover:text-red-900">Cancelar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentTable;
