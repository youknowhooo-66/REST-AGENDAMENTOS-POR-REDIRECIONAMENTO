import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Modal from '../Modal/Modal';
import Button from '../Form/Button';
import { toast } from 'react-toastify';
import { IconShare, IconQrCode, IconCircleCheck } from '../Icons';

const ShareModal = ({ isOpen, onClose, booking, customUrl, customTitle, customDescription }) => {
    const qrCodeRef = useRef(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    // Determinar URL, Título e Descrição
    const url = customUrl || (booking ? `${window.location.origin}/booking/${booking.id}` : '');
    const title = customTitle || 'Compartilhar Agendamento';
    const description = customDescription || 'Use o link ou QR Code para compartilhar';

    if (!url) return null;

    // Copiar link para clipboard
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success('Link copiado com sucesso!', {
                autoClose: 2000,
                hideProgressBar: true,
            });
            setTimeout(() => setCopied(false), 3000);
        } catch (error) {
            toast.error('Erro ao copiar link', {
                autoClose: 2000,
                hideProgressBar: true,
            });
        }
    };

    // Baixar QR Code como imagem
    const handleDownloadQRCode = () => {
        try {
            const canvas = qrCodeRef.current?.querySelector('canvas');
            if (!canvas) {
                toast.error('QR Code não encontrado', {
                    autoClose: 2000,
                    hideProgressBar: true,
                });
                return;
            }

            // Converter canvas para blob
            canvas.toBlob((blob) => {
                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                // Nome do arquivo seguro
                const filename = customTitle ? `qrcode-${customTitle.toLowerCase().replace(/\s+/g, '-')}.png` : `agendamento-${booking?.id || 'qrcode'}.png`;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(blobUrl);

                toast.success('QR Code baixado com sucesso!', {
                    autoClose: 2000,
                    hideProgressBar: true,
                });
            });
        } catch (error) {
            console.error(error);
            toast.error('Erro ao baixar QR Code', {
                autoClose: 2000,
                hideProgressBar: true,
            });
        }
    };

    // Formatar data (apenas se tiver booking)
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
            <div className="animate-scale-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-primary-gradient rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-pulse-glow">
                        <IconShare size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        {description}
                    </p>
                </div>

                {/* Informações do Agendamento (Condicional) */}
                {booking && !customUrl && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                            <IconCircleCheck size={20} className="text-primary" />
                            Detalhes do Agendamento
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Serviço:</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {booking.slot?.service?.name || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Cliente:</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {booking.user?.name || 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Data/Hora:</span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {booking.slot?.startAt ? formatDate(booking.slot.startAt) : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Status:</span>
                                <span className={`badge ${booking.status === 'CONFIRMED' ? 'badge-success' :
                                    booking.status === 'PENDING' ? 'badge-warning' :
                                        'badge-secondary'
                                    }`}>
                                    {booking.status}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* QR Code */}
                <div className="flex justify-center mb-6">
                    <div
                        ref={qrCodeRef}
                        className="bg-white p-6 rounded-2xl shadow-lg border-2 border-slate-200 hover-scale transition-smooth"
                    >
                        <QRCodeCanvas
                            value={url}
                            size={220}
                            level="H"
                            includeMargin={true}
                            imageSettings={{
                                excavate: true,
                            }}
                        />
                    </div>
                </div>

                {/* Link para copiar */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                        Link de Acesso
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 font-mono overflow-x-auto custom-scrollbar whitespace-nowrap">
                            {url}
                        </div>
                        <Button
                            variant={copied ? 'success' : 'outline'}
                            size="md"
                            onClick={handleCopyLink}
                            icon={
                                copied ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )
                            }
                        >
                            {copied ? 'Copiado!' : 'Copiar'}
                        </Button>
                    </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        variant="primary"
                        fullWidth
                        onClick={handleDownloadQRCode}
                        icon={<IconQrCode size={20} />}
                    >
                        Baixar QR Code
                    </Button>
                    <Button variant="secondary" fullWidth onClick={onClose}>
                        Fechar
                    </Button>
                </div>

                {/* Dica */}
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex gap-3">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                                💡 Dica
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                Compartilhe este link ou QR Code com seus clientes para facilitar o acesso.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ShareModal;
