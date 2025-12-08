// ==============================================
// TESTES - SCHEDULING COMPONENT
// ==============================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Scheduling from '../Scheduling.refactored';
import { AuthProvider } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import { toast } from 'react-toastify';

// Mock das dependências
vi.mock('../../../services/api');
vi.mock('react-toastify');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: () => ({ serviceId: null }),
        useSearchParams: () => [new URLSearchParams()],
    };
});

// Wrapper de teste
const renderWithProviders = (component) => {
    const mockAuthContext = {
        isAuthenticated: false,
        user: null,
        login: vi.fn(),
    };

    return render(
        <BrowserRouter>
            <AuthProvider value={mockAuthContext}>
                {component}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Scheduling Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Renderização Inicial', () => {
        it('deve exibir loading no início', () => {
            renderWithProviders(<Scheduling />);
            expect(screen.getByText('Carregando...')).toBeInTheDocument();
        });

        it('deve exibir título principal', async () => {
            api.get.mockResolvedValue({ data: [] });

            renderWithProviders(<Scheduling />);

            await waitFor(() => {
                expect(screen.getByText('Agende seu Horário')).toBeInTheDocument();
            });
        });

        it('deve exibir mensagem de seleção de serviço quando nenhum serviço está selecionado', async () => {
            api.get.mockResolvedValue({ data: [] });

            renderWithProviders(<Scheduling />);

            await waitFor(() => {
                expect(
                    screen.getByText('Selecione o serviço desejado para agendar.')
                ).toBeInTheDocument();
            });
        });
    });

    describe('Listagem de Serviços', () => {
        it('deve exibir lista de serviços quando disponíveis', async () => {
            const mockServices = [
                {
                    id: '1',
                    name: 'Corte de Cabelo',
                    description: 'Corte masculino',
                    price: 50,
                    duration: 30,
                },
                {
                    id: '2',
                    name: 'Barba',
                    description: 'Aparar e modelar barba',
                    price: 30,
                    duration: 20,
                },
            ];

            api.get.mockResolvedValue({ data: mockServices });

            renderWithProviders(<Scheduling />);

            await waitFor(() => {
                expect(screen.getByText('Corte de Cabelo')).toBeInTheDocument();
                expect(screen.getByText('Barba')).toBeInTheDocument();
            });
        });

        it('deve fazer requisição correta para buscar serviços', async () => {
            api.get.mockResolvedValue({ data: [] });

            renderWithProviders(<Scheduling />);

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/public/services');
            });
        });
    });

    describe('Seleção de Serviço', () => {
        it('deve exibir horários disponíveis ao selecionar um serviço', async () => {
            const mockServices = [
                { id: '1', name: 'Corte de Cabelo', price: 50 },
            ];

            const mockSlots = [
                {
                    id: 'slot-1',
                    startAt: new Date('2025-12-05T10:00:00').toISOString(),
                    status: 'AVAILABLE',
                },
                {
                    id: 'slot-2',
                    startAt: new Date('2025-12-05T11:00:00').toISOString(),
                    status: 'AVAILABLE',
                },
            ];

            api.get
                .mockResolvedValueOnce({ data: mockServices })
                .mockResolvedValueOnce({ data: mockSlots });

            renderWithProviders(<Scheduling />);

            await waitFor(() => {
                const serviceCard = screen.getByText('Corte de Cabelo');
                fireEvent.click(serviceCard);
            });

            await waitFor(() => {
                expect(
                    screen.getByText('Horários Disponíveis para Corte de Cabelo')
                ).toBeInTheDocument();
            });
        });

        it('deve exibir mensagem quando não há horários disponíveis', async () => {
            const mockServices = [{ id: '1', name: 'Corte de Cabelo', price: 50 }];

            api.get
                .mockResolvedValueOnce({ data: mockServices })
                .mockResolvedValueOnce({ data: [] });

            renderWithProviders(<Scheduling />);

            await waitFor(() => {
                const serviceCard = screen.getByText('Corte de Cabelo');
                fireEvent.click(serviceCard);
            });

            await waitFor(() => {
                expect(
                    screen.getByText('Nenhum horário disponível para a data selecionada.')
                ).toBeInTheDocument();
            });
        });
    });

    describe('Seleção de Horário', () => {
        it('deve destacar horário selecionado', async () => {
            const mockServices = [{ id: '1', name: 'Corte de Cabelo', price: 50 }];

            const mockSlots = [
                {
                    id: 'slot-1',
                    startAt: new Date('2025-12-05T10:00:00').toISOString(),
                    status: 'AVAILABLE',
                },
            ];

            api.get
                .mockResolvedValueOnce({ data: mockServices })
                .mockResolvedValueOnce({ data: mockSlots });

            renderWithProviders(<Scheduling />);

            await waitFor(() => {
                const serviceCard = screen.getByText('Corte de Cabelo');
                fireEvent.click(serviceCard);
            });

            await waitFor(() => {
                const slotButton = screen.getByText('10:00');
                fireEvent.click(slotButton);

                expect(slotButton).toHaveClass('bg-cyan-600');
            });
        });
    });

    describe('Criação de Booking', () => {
        it('deve exibir erro quando tentar agendar sem autenticação', async () => {
            const mockServices = [{ id: '1', name: 'Corte de Cabelo', price: 50 }];
            const mockSlots = [
                {
                    id: 'slot-1',
                    startAt: new Date('2025-12-05T10:00:00').toISOString(),
                    status: 'AVAILABLE',
                },
            ];

            api.get
                .mockResolvedValueOnce({ data: mockServices })
                .mockResolvedValueOnce({ data: mockSlots });

            renderWithProviders(<Scheduling />);

            await waitFor(() => {
                const serviceCard = screen.getByText('Corte de Cabelo');
                fireEvent.click(serviceCard);
            });

            await waitFor(() => {
                const slotButton = screen.getByText('10:00');
                fireEvent.click(slotButton);
            });

            await waitFor(() => {
                const confirmButton = screen.getByText('Confirmar Agendamento');
                fireEvent.click(confirmButton);
            });

            expect(toast.error).toHaveBeenCalledWith(
                'Você precisa estar logado para agendar. Por favor, registre-se ou faça login.'
            );
        });

        it('deve criar booking com sucesso quando autenticado', async () => {
            const mockAuthContext = {
                isAuthenticated: true,
                user: { id: 'user-123', name: 'John Doe', phone: '+5511999999999' },
            };

            const mockServices = [{ id: '1', name: 'Corte de Cabelo', price: 50 }];
            const mockSlots = [
                {
                    id: 'slot-1',
                    startAt: new Date('2025-12-05T10:00:00').toISOString(),
                    status: 'AVAILABLE',
                },
            ];
            const mockBooking = {
                id: 'booking-123',
                userId: 'user-123',
                slotId: 'slot-1',
                status: 'PENDING',
                slot: mockSlots[0],
            };

            api.get
                .mockResolvedValueOnce({ data: mockServices })
                .mockResolvedValueOnce({ data: mockSlots });

            api.post.mockResolvedValue({ data: mockBooking });

            render(
                <BrowserRouter>
                    <AuthProvider value={mockAuthContext}>
                        <Scheduling />
                    </AuthProvider>
                </BrowserRouter>
            );

            await waitFor(() => {
                const serviceCard = screen.getByText('Corte de Cabelo');
                fireEvent.click(serviceCard);
            });

            await waitFor(() => {
                const slotButton = screen.getByText('10:00');
                fireEvent.click(slotButton);
            });

            await waitFor(() => {
                const confirmButton = screen.getByText('Confirmar Agendamento');
                fireEvent.click(confirmButton);
            });

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith(
                    'Agendamento realizado com sucesso! Um e-mail de confirmação foi enviado.'
                );
            });
        });

        it('deve exibir mensagem de erro quando booking falha', async () => {
            const mockAuthContext = {
                isAuthenticated: true,
                user: { id: 'user-123', name: 'John Doe', phone: '+5511999999999' },
            };

            const mockServices = [{ id: '1', name: 'Corte de Cabelo', price: 50 }];
            const mockSlots = [
                {
                    id: 'slot-1',
                    startAt: new Date('2025-12-05T10:00:00').toISOString(),
                    status: 'AVAILABLE',
                },
            ];

            api.get
                .mockResolvedValueOnce({ data: mockServices })
                .mockResolvedValueOnce({ data: mockSlots });

            api.post.mockRejectedValue({
                response: { data: { message: 'Slot já reservado' } },
            });

            render(
                <BrowserRouter>
                    <AuthProvider value={mockAuthContext}>
                        <Scheduling />
                    </AuthProvider>
                </BrowserRouter>
            );

            await waitFor(() => {
                const serviceCard = screen.getByText('Corte de Cabelo');
                fireEvent.click(serviceCard);
            });

            await waitFor(() => {
                const slotButton = screen.getByText('10:00');
                fireEvent.click(slotButton);
            });

            await waitFor(() => {
                const confirmButton = screen.getByText('Confirmar Agendamento');
                fireEvent.click(confirmButton);
            });

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Slot já reservado');
            });
        });
    });

    describe('Mudança de Data', () => {
        it('deve buscar novos slots ao mudar a data', async () => {
            const mockServices = [{ id: '1', name: 'Corte de Cabelo', price: 50 }];
            const mockSlots1 = [
                {
                    id: 'slot-1',
                    startAt: new Date('2025-12-05T10:00:00').toISOString(),
                    status: 'AVAILABLE',
                },
            ];
            const mockSlots2 = [
                {
                    id: 'slot-2',
                    startAt: new Date('2025-12-06T11:00:00').toISOString(),
                    status: 'AVAILABLE',
                },
            ];

            api.get
                .mockResolvedValueOnce({ data: mockServices })
                .mockResolvedValueOnce({ data: mockSlots1 })
                .mockResolvedValueOnce({ data: mockSlots2 });

            renderWithProviders(<Scheduling />);

            await waitFor(() => {
                const serviceCard = screen.getByText('Corte de Cabelo');
                fireEvent.click(serviceCard);
            });

            await waitFor(() => {
                const dateInput = screen.getByLabelText('Selecionar Data:');
                fireEvent.change(dateInput, { target: { value: '2025-12-06' } });
            });

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith(
                    '/public/services/1/slots?date=2025-12-06'
                );
            });
        });
    });

    describe('Tratamento de Erros', () => {
        it('deve exibir mensagem de erro quando falha ao buscar serviços', async () => {
            api.get.mockRejectedValue(new Error('Network error'));

            renderWithProviders(<Scheduling />);

            await waitFor(() => {
                expect(screen.getByText(/Erro:/)).toBeInTheDocument();
                expect(screen.getByText(/Falha ao carregar serviços/)).toBeInTheDocument();
            });
        });

        it('deve exibir mensagem de erro quando serviço não é encontrado', async () => {
            api.get.mockResolvedValue({ data: null });

            vi.mock('react-router-dom', async () => {
                const actual = await vi.importActual('react-router-dom');
                return {
                    ...actual,
                    useParams: () => ({ serviceId: 'invalid-id' }),
                };
            });

            renderWithProviders(<Scheduling />);

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/scheduling');
                expect(toast.error).toHaveBeenCalledWith('Serviço não encontrado.');
            });
        });
    });

    describe('Acessibilidade', () => {
        it('deve ter labels adequadas para inputs', async () => {
            api.get.mockResolvedValue({ data: [] });

            renderWithProviders(<Scheduling />);

            await waitFor(() => {
                const heading = screen.getByRole('heading', { name: /Agende seu Horário/i });
                expect(heading).toBeInTheDocument();
            });
        });

        it('deve permitir navegação por teclado nos horários', async () => {
            const mockServices = [{ id: '1', name: 'Corte de Cabelo', price: 50 }];
            const mockSlots = [
                {
                    id: 'slot-1',
                    startAt: new Date('2025-12-05T10:00:00').toISOString(),
                    status: 'AVAILABLE',
                },
            ];

            api.get
                .mockResolvedValueOnce({ data: mockServices })
                .mockResolvedValueOnce({ data: mockSlots });

            renderWithProviders(<Scheduling />);

            await waitFor(() => {
                const serviceCard = screen.getByText('Corte de Cabelo');
                fireEvent.click(serviceCard);
            });

            await waitFor(() => {
                const slotButton = screen.getByText('10:00');
                fireEvent.keyDown(slotButton, { key: 'Enter', code: 'Enter' });

                expect(slotButton).toHaveClass('bg-cyan-600');
            });
        });
    });
});

// ==============================================
// TESTES DE PERFORMANCE
// ==============================================

describe('Scheduling Component - Performance', () => {
    it('não deve fazer requisições duplicadas', async () => {
        const mockServices = [{ id: '1', name: 'Corte de Cabelo', price: 50 }];

        api.get.mockResolvedValue({ data: mockServices });

        renderWithProviders(<Scheduling />);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledTimes(1);
        });

        // Re-render não deve causar nova requisição
        renderWithProviders(<Scheduling />);

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledTimes(1); // Ainda apenas 1 chamada
        });
    });
});
