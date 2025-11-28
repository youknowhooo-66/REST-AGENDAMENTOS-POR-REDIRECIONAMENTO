import React from 'react';
import moment from 'moment'; // Assuming moment.js is available or will be installed

const CalendarView = ({ slots, onEditSlot, onDeleteSlot }) => {
  // Group slots by day
  const groupedSlots = slots.reduce((acc, slot) => {
    const date = moment(slot.startAt).format('YYYY-MM-DD');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  // Generate the next 7 days starting from today
  const days = Array.from({ length: 7 }).map((_, i) => moment().add(i, 'days').format('YYYY-MM-DD'));

  return (
    <div className="bg-card rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold text-text mb-4">Visualização Semanal de Horários</h2>
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => (
          <div key={day} className="border border-border rounded-lg p-2">
            <h3 className="font-semibold text-text mb-2">{moment(day).format('ddd, MMM D')}</h3>
            <div className="space-y-2">
              {groupedSlots[day] && groupedSlots[day].length > 0 ? (
                groupedSlots[day]
                  .sort((a, b) => moment(a.startAt).valueOf() - moment(b.startAt).valueOf())
                  .map(slot => (
                    <div
                      key={slot.id}
                      className={`p-2 rounded-md text-xs ${
                        slot.status === 'OPEN' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        slot.status === 'BOOKED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}
                    >
                      <p className="font-medium">{moment(slot.startAt).format('HH:mm')} - {moment(slot.endAt).format('HH:mm')}</p>
                      <p>{slot.service?.name}</p>
                      <p>{slot.staff ? slot.staff.name : 'Nenhum Funcionário'}</p>
                      <div className="flex justify-end gap-1 mt-1">
                        <button onClick={() => onEditSlot(slot)} className="text-primary hover:text-primary/80">Editar</button>
                        <button onClick={() => onDeleteSlot(slot.id)} className="text-destructive hover:text-destructive/80">Excluir</button>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-text-muted text-xs">Nenhum horário</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
