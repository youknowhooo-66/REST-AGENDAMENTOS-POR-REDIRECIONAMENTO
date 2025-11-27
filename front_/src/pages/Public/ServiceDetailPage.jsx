import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { IconClock, IconCurrencyDollar, IconCalendar } from '../../components/Icons';
import Input from '../../components/Form/Input';
import Button from '../../components/Form/Button';
import Modal from '../../components/Modal/Modal';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const [loadingService, setLoadingService] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await api.get(`/public/services/${id}`);
        setService(response.data);
      } catch (err) {
        console.error('Erro ao buscar detalhes do serviço:', err);
        toast.error('Erro ao carregar detalhes do serviço.');
      } finally {
        setLoadingService(false);
      }
    };
    fetchService();
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const response = await api.get(`/public/services/${id}/slots?date=${selectedDate}`);
          setSlots(response.data);
        } catch (err) {
          console.error('Erro ao buscar horários:', err);
          toast.error('Erro ao carregar horários disponíveis.');
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [id, selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleBookSlot = (slot) => {
    if (!user) {
      toast.info('Você precisa estar logado para agendar. Redirecionando para o login...');
      navigate('/login');
      return;
    }
    setSelectedSlot(slot);
    setIsBookingModalOpen(true);
  };

  const confirmBooking = async () => {
    try {
      await api.post('/bookings', { slotId: selectedSlot.id });
      toast.success('Agendamento realizado com sucesso! Um e-mail de confirmação foi enviado.');
      setIsBookingModalOpen(false);
      // Refresh slots
      const response = await api.get(`/public/services/${id}/slots?date=${selectedDate}`);
      setSlots(response.data);
    } catch (err) {
      console.error('Erro ao agendar:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao realizar agendamento.';
      toast.error(errorMessage);
    }
  };

  if (loadingService) return <div className="text-center p-8">Carregando serviço...</div>;
  if (!service) return <div className="text-center p-8 text-red-500">Serviço não encontrado.</div>;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Service Header */}
        <div className="bg-card p-8 rounded-xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-text mb-2">{service.name}</h1>
              <p className="text-lg text-primary font-semibold">{service.provider.name}</p>
            </div>
            <div className="flex items-center text-text-muted space-x-6 mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                <IconCurrencyDollar size={22} />
                <span className="text-xl font-semibold">R$ {service.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <IconClock size={22} />
                <span className="text-xl font-semibold">{service.durationMin} min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slot Selection */}
        <div className="bg-card p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-text mb-6">Selecione um Horário</h2>
          <div className="mb-6 max-w-xs">
            <Input
              label="Escolha uma data"
              type="date"
              name="date"
              icon={<IconCalendar />}
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>

          {loadingSlots ? (
            <div className="text-center">Carregando horários...</div>
          ) : slots.length === 0 ? (
            <div className="text-center text-text-muted p-6 border border-border rounded-lg">
              Nenhum horário disponível para esta data.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {slots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => handleBookSlot(slot)}
                  className="p-4 border border-border rounded-lg text-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <p className="font-bold text-lg">
                    {new Date(slot.startAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {slot.staff && (
                    <p className="text-xs text-text-muted group-hover:text-primary-foreground">
                      com {slot.staff.name}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {selectedSlot && (
        <Modal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-text mb-4">Confirmar Agendamento</h2>
            <p className="text-text-muted mb-2">Serviço: <span className="font-semibold text-text">{service.name}</span></p>
            <p className="text-text-muted mb-2">Provedor: <span className="font-semibold text-text">{service.provider.name}</span></p>
            <p className="text-text-muted mb-6">Horário: <span className="font-semibold text-text">{new Date(selectedSlot.startAt).toLocaleString()}</span></p>
            <div className="flex justify-end gap-4">
              <Button variant="secondary" onClick={() => setIsBookingModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmBooking}>
                Confirmar Agendamento
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ServiceDetailPage;
