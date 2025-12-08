import React, { useEffect, useState, useCallback, useMemo } from 'react'; // Added useMemo
import api from '../../services/api';
import { toast } from 'react-toastify';
import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';
import { IconCalendar, IconClock, IconPlus, IconTrash, IconChevronRight } from '../../components/Icons'; // Added IconChevronRight

const BulkSlotCreator = ({ onClose, staffList, serviceList, onSuccess }) => {
    const [formData, setFormData] = useState({
        serviceId: '',
        staffId: '',
        startDate: '',
        endDate: '',
        daysOfWeek: [],
        dailyStartTime: '09:00', // New: Daily start time for slot generation
        dailyEndTime: '17:00',   // New: Daily end time for slot generation
        timeSlots: [], // This will be dynamically generated
    });
    const [loading, setLoading] = useState(false);

    const weekDays = [
        { value: 0, label: 'Dom' }, // Abbreviated labels for compactness
        { value: 1, label: 'Seg' },
        { value: 2, label: 'Ter' },
        { value: 3, label: 'Qua' },
        { value: 4, label: 'Qui' },
        { value: 5, label: 'Sex' },
        { value: 6, label: 'Sáb' },
    ];

    // Get selected service details to derive slot duration
    const selectedService = useMemo(() => {
        return serviceList.find(s => s.id === formData.serviceId);
    }, [formData.serviceId, serviceList]);

    const slotDurationMin = selectedService ? selectedService.durationMin : 60; // Default to 60 min

    // Function to generate time slots based on daily range and duration
    const generateTimeSlots = useCallback(() => {
        if (!formData.dailyStartTime || !formData.dailyEndTime || !slotDurationMin) {
            setFormData(prev => ({ ...prev, timeSlots: [] }));
            return;
        }

        const slots = [];
        let currentStartTime = new Date(`2000-01-01T${formData.dailyStartTime}:00`);
        const dailyEndTimeObj = new Date(`2000-01-01T${formData.dailyEndTime}:00`);

        while (currentStartTime < dailyEndTimeObj) {
            const slotEnd = new Date(currentStartTime.getTime() + slotDurationMin * 60 * 1000);

            if (slotEnd > dailyEndTimeObj) {
                break; // Stop if the next slot goes past the daily end time
            }

            slots.push({
                start: currentStartTime.toTimeString().slice(0, 5),
                end: slotEnd.toTimeString().slice(0, 5),
            });
            currentStartTime = slotEnd; // Start of next slot is end of current slot
        }
        setFormData(prev => ({ ...prev, timeSlots: slots }));
    }, [formData.dailyStartTime, formData.dailyEndTime, slotDurationMin]);

    // Regenerate time slots whenever relevant dependencies change
    useEffect(() => {
        generateTimeSlots();
    }, [generateTimeSlots]);

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

    // Removed manual add/remove time slot functions

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.daysOfWeek.length === 0) {
            toast.warning('Selecione pelo menos um dia da semana.');
            return;
        }
        if (formData.timeSlots.length === 0) {
            toast.warning('Nenhum horário gerado. Verifique os horários diários e a duração do serviço.');
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
                                {service.name} ({service.durationMin} min)
                            </option>
                        ))}
                    </select>
                    {formData.serviceId && (
                        <p className="text-sm text-text-muted mt-2">
                            Duração de cada slot: <span className="font-semibold">{slotDurationMin} minutos</span>
                        </p>
                    )}
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

                {/* Daily Time Range */}
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-2">Horário Diário de Trabalho</label>
                    <div className="flex gap-2 items-center">
                        <Input
                            label="Início do Dia"
                            type="time"
                            name="dailyStartTime"
                            value={formData.dailyStartTime}
                            onChange={handleChange}
                            required
                            className="flex-1"
                        />
                        <span className="text-text-muted">até</span>
                        <Input
                            label="Fim do Dia"
                            type="time"
                            name="dailyEndTime"
                            value={formData.dailyEndTime}
                            onChange={handleChange}
                            required
                            className="flex-1"
                        />
                    </div>
                </div>

                {/* Generated Time Slots Preview */}
                <div className="mt-4">
                    <h3 className="text-sm font-medium text-text-muted mb-2">Horários Gerados ({formData.timeSlots.length})</h3>
                    {formData.timeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 border border-[var(--border)] rounded-lg bg-input">
                            {formData.timeSlots.map((slot, index) => (
                                <span key={index} className="bg-primary/10 text-primary-foreground text-xs px-2 py-1 rounded-md flex items-center justify-between">
                                    {slot.start} <IconChevronRight size={12} /> {slot.end}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-text-muted">Nenhum horário gerado. Selecione um serviço e defina o horário diário.</p>
                    )}
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
