import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';
import { IconCalendar, IconClock, IconPlus, IconTrash } from '../../components/Icons';

const BulkSlotCreator = ({ onClose, staffList, serviceList, onSuccess }) => {
    const [formData, setFormData] = useState({
        serviceId: '',
        staffId: '',
        startDate: '',
        endDate: '',
        daysOfWeek: [],
        timeSlots: [{ start: '09:00', end: '10:00' }],
    });
    const [loading, setLoading] = useState(false);

    const weekDays = [
        { value: 0, label: 'Domingo' },
        { value: 1, label: 'Segunda' },
        { value: 2, label: 'Terça' },
        { value: 3, label: 'Quarta' },
        { value: 4, label: 'Quinta' },
        { value: 5, label: 'Sexta' },
        { value: 6, label: 'Sábado' },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDayToggle = (dayValue) => {
        const isSelected = formData.daysOfWeek.includes(dayValue);
        if (isSelected) {
            setFormData({
                ...formData,
                daysOfWeek: formData.daysOfWeek.filter((d) => d !== dayValue),
            });
        } else {
            setFormData({
                ...formData,
                daysOfWeek: [...formData.daysOfWeek, dayValue],
            });
        }
    };

    const handleTimeSlotChange = (index, field, value) => {
        const newTimeSlots = [...formData.timeSlots];
        newTimeSlots[index][field] = value;
        setFormData({ ...formData, timeSlots: newTimeSlots });
    };

    const addTimeSlot = () => {
        setFormData({
            ...formData,
            timeSlots: [...formData.timeSlots, { start: '09:00', end: '10:00' }],
        });
    };

    const removeTimeSlot = (index) => {
        if (formData.timeSlots.length > 1) {
            const newTimeSlots = formData.timeSlots.filter((_, i) => i !== index);
            setFormData({ ...formData, timeSlots: newTimeSlots });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.daysOfWeek.length === 0) {
            toast.warning('Selecione pelo menos um dia da semana.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/availability-slots/bulk', formData);
            toast.success(response.data.message || 'Horários criados com sucesso!');
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Erro ao criar horários em lote:', err);
            const errorMessage = err.response?.data?.error || 'Erro ao criar horários em lote.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card p-8 rounded-lg shadow-md w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-center mb-6 text-text">Criar Horários em Lote</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Service Selection */}
                <div>
                    <label htmlFor="serviceId" className="block text-sm font-medium text-text-muted mb-1">
                        Serviço
                    </label>
                    <select
                        id="serviceId"
                        name="serviceId"
                        value={formData.serviceId}
                        onChange={handleChange}
                        className="w-full p-3 border border-[var(--border)] rounded-lg bg-input text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                    >
                        <option value="">Selecione um serviço</option>
                        {serviceList.map((service) => (
                            <option key={service.id} value={service.id}>
                                {service.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Staff Selection */}
                <div>
                    <label htmlFor="staffId" className="block text-sm font-medium text-text-muted mb-1">
                        Funcionário (Opcional)
                    </label>
                    <select
                        id="staffId"
                        name="staffId"
                        value={formData.staffId}
                        onChange={handleChange}
                        className="w-full p-3 border border-[var(--border)] rounded-lg bg-input text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="">Nenhum funcionário</option>
                        {staffList.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                                {staff.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Data Inicial"
                        type="date"
                        name="startDate"
                        icon={<IconCalendar />}
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Data Final"
                        type="date"
                        name="endDate"
                        icon={<IconCalendar />}
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Days of Week */}
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Dias da Semana</label>
                    <div className="grid grid-cols-4 gap-2">
                        {weekDays.map((day) => (
                            <button
                                key={day.value}
                                type="button"
                                onClick={() => handleDayToggle(day.value)}
                                className={`p-2 rounded-lg border-2 transition-colors text-sm font-medium ${formData.daysOfWeek.includes(day.value)
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'border-[var(--border)] bg-card text-text hover:border-primary/50'
                                    }`}
                            >
                                {day.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Slots */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-text-muted">Horários</label>
                        <button
                            type="button"
                            onClick={addTimeSlot}
                            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium"
                        >
                            <IconPlus size={16} />
                            Adicionar Horário
                        </button>
                    </div>
                    <div className="space-y-2">
                        {formData.timeSlots.map((slot, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <input
                                    type="time"
                                    value={slot.start}
                                    onChange={(e) => handleTimeSlotChange(index, 'start', e.target.value)}
                                    className="flex-1 p-2 border border-[var(--border)] rounded-lg bg-input text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                                <span className="text-text-muted">até</span>
                                <input
                                    type="time"
                                    value={slot.end}
                                    onChange={(e) => handleTimeSlotChange(index, 'end', e.target.value)}
                                    className="flex-1 p-2 border border-[var(--border)] rounded-lg bg-input text-text focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                />
                                {formData.timeSlots.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeTimeSlot(index)}
                                        className="text-destructive hover:text-destructive/80 p-2"
                                    >
                                        <IconTrash size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? 'Criando...' : 'Criar Horários'}
                    </Button>
                    <Button type="button" fullWidth variant="secondary" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default BulkSlotCreator;
