import React from 'react';

const UserTable = ({ users }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full leading-normal">
        <thead>
          <tr>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              ID
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Nome
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              E-mail
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Função
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {user.id}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {user.name}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {user.email}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                {user.role}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                <button className="text-indigo-600 hover:text-indigo-900 mr-3">Editar</button>
                <button className="text-red-600 hover:text-red-900">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
