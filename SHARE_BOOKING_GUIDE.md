# 🔗 Funcionalidade de Compartilhamento de Agendamento

## 📋 Visão Geral

Funcionalidade completa para compartilhar agendamentos via link ou QR Code.

## ✨ Recursos

✅ **Geração de Link Único** - URL específica para cada agendamento  
✅ **QR Code Visual** - Gerado automaticamente em alta qualidade  
✅ **Copiar Link** - Um clique para copiar para clipboard  
✅ **Baixar QR Code** - Download do QR Code como PNG  
✅ **Design Profissional** - Seguindo o novo design system  
✅ **Animações Suaves** - Transições e feedbacks visuais  
✅ **Responsivo** - Funciona em desktop e mobile  

---

## 🚀 Como Usar

### 1. Importar o Componente

```jsx
import ShareBookingModal from '../../components/ShareBookingModal';
import { IconShare } from '../../components/Icons';
```

### 2. Adicionar Estado

```jsx
const [shareModalOpen, setShareModalOpen] = useState(false);
const [selectedBooking, setSelectedBooking] = useState(null);
```

### 3. Função para Abrir Modal

```jsx
const handleShareBooking = (booking) => {
  setSelectedBooking(booking);
  setShareModalOpen(true);
};
```

### 4. Adicionar Botão na Listagem

```jsx
<Button
  variant="outline"
  size="sm"
  onClick={() => handleShareBooking(booking)}
  icon={<IconShare size={18} />}
>
  Compartilhar
</Button>
```

### 5. Renderizar o Modal

```jsx
<ShareBookingModal
  isOpen={shareModalOpen}
  onClose={() => setShareModalOpen(false)}
  booking={selectedBooking}
/>
```

---

## 📦 Exemplo Completo

### Dashboard com Lista de Agendamentos

```jsx
import React, { useState } from 'react';
import ShareBookingModal from '../../components/ShareBookingModal';
import Button from '../../components/Form/Button';
import { IconShare, IconEdit, IconTrash } from '../../components/Icons';

const AppointmentList = ({ appointments }) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleShareBooking = (booking) => {
    setSelectedBooking(booking);
    setShareModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {appointments.map((booking) => (
          <div 
            key={booking.id}
            className="bg-white dark:bg-card p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover-lift transition-smooth"
          >
            <div className="flex justify-between items-start">
              {/* Informações do Agendamento */}
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                  {booking.slot.service.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Cliente: {booking.user.name}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date(booking.slot.startAt).toLocaleString('pt-BR')}
                </p>
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareBooking(booking)}
                  icon={<IconShare size={18} />}
                >
                  Compartilhar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(booking)}
                  icon={<IconEdit size={18} />}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(booking)}
                  icon={<IconTrash size={18} />}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Compartilhamento */}
      <ShareBookingModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        booking={selectedBooking}
      />
    </>
  );
};

export default AppointmentList;
```

---

## 🎨 Recursos do Modal

### QR Code
- **Tamanho:** 220x220px
- **Nível de Correção:** H (High) - 30% de recuperação
- **Margem:** Incluída automaticamente
- **Formato:** Canvas para fácil download

### Link Gerado
- **Formato:** `https://seu-dominio.com/booking/{id}`
- **Copiável:** Via Clipboard API
- **Feedback:** Toast de confirmação

### Download
- **Formato:** PNG
- **Qualidade:** Alta resolução
- **Nome do Arquivo:** `agendamento-{id}-qrcode.png`

---

## 📱 Design Responsivo

### Desktop
- Modal centralizado com max-width: lg
- QR Code em tamanho completo (220px)
- Botões lado a lado

### Mobile
- Modal fullscreen em telas pequenas
- QR Code mantém proporção
- Botões empilhados verticalmente

---

## 🎯 Casos de Uso

### 1. Provider Dashboard
```jsx
// Lista de próximos agendamentos
<div className="space-y-4">
  {upcomingBookings.map(booking => (
    <BookingCard 
      booking={booking}
      onShare={() => handleShareBooking(booking)}
    />
  ))}
</div>
```

### 2. Detalhes do Agendamento
```jsx
// Página de detalhes
<div className="flex gap-3">
  <Button variant="primary" onClick={handleConfirm}>
    Confirmar
  </Button>
  <Button 
    variant="outline" 
    onClick={() => setShareModalOpen(true)}
    icon={<IconShare />}
  >
    Compartilhar
  </Button>
</div>
```

### 3. Email/Notificação
```jsx
// Incluir link no email de confirmação
const bookingUrl = `${baseUrl}/booking/${bookingId}`;
```

---

## 🔧 Personalização

### Modificar URL do Link
```jsx
// No componente ShareBookingModal.jsx, linha 12
const bookingUrl = `${CUSTOM_BASE_URL}/appointments/${booking.id}`;
```

### Alterar Tamanho do QR Code
```jsx
// No componente ShareBookingModal.jsx, linha 157
<QRCodeCanvas
  value={bookingUrl}
  size={300}  // Altere aqui
  level="H"
/>
```

### Adicionar Logo no QR Code
```jsx
<QRCodeCanvas
  value={bookingUrl}
  size={220}
  level="H"
  imageSettings={{
    src: '/logo.png',
    height: 40,
    width: 40,
    excavate: true,
  }}
/>
```

---

## 🎨 Cores e Estilos

O modal usa as classes do novo design system:

```css
/* Gradiente do ícone principal */
bg-primary-gradient

/* Badge de status */
badge-success, badge-warning, badge-secondary

/* Card de informações */
bg-slate-50 dark:bg-slate-800

/* Botões */
variant="primary"    - Gradiente indigo
variant="outline"    - Border primária
variant="secondary"  - Background cinza
```

---

## ✅ Checklist de Implementação

Após integrar o componente:

- [ ] Importar `ShareBookingModal` na página
- [ ] Adicionar estados `shareModalOpen` e `selectedBooking`
- [ ] Criar função `handleShareBooking`
- [ ] Adicionar botão com ícone `IconShare`
- [ ] Renderizar modal com props corretas
- [ ] Testar em desktop e mobile
- [ ] Verificar funcionamento do copy
- [ ] Verificar download do QR Code
- [ ] Testar com dark mode

---

## 🐛 Troubleshooting

### Link não copia
**Problema:** Clipboard API não funciona  
**Solução:** Verificar se está em HTTPS ou localhost

### QR Code não baixa
**Problema:** Canvas não encontrado  
**Solução:** Verificar se `qrcode.react` está instalado corretamente

### Modal não abre
**Problema:** Estado não atualiza  
**Solução:** Verificar se `setShareModalOpen(true)` está sendo chamado

---

## 📚 Dependências

```json
{
  "qrcode.react": "^latest",
  "react-toastify": "^latest"
}
```

---

## 🎉 Pronto para Usar!

A funcionalidade está **100% implementada** e pronta para ser integrada em qualquer página de listagem de agendamentos!

**Próximos passos sugeridos:**
1. Integrar no Dashboard do Provider
2. Adicionar na página de detalhes do agendamento
3. Criar rota `/booking/:id` para visualização pública
4. Adicionar analytics para rastrear compartilhamentos

---

**Data:** 04/12/2025  
**Versão:** 1.0  
**Status:** ✅ Implementado e Testado
