# Guia de Uso para Clientes

Este guia detalha como os clientes podem utilizar o sistema de agendamento para agendar, visualizar e cancelar seus próprios agendamentos.

## Índice

1.  [Primeiros Passos](#1-primeiros-passos)
2.  [Agendar um Serviço](#2-agendar-um-serviço)
    *   [Visualizar Serviços Disponíveis](#visualizar-serviços-disponíveis)
    *   [Selecionar um Serviço](#selecionar-um-serviço)
    *   [Escolher um Horário](#escolher-um-horário)
    *   [Confirmar Agendamento](#confirmar-agendamento)
3.  [Visualizar Meus Agendamentos](#3-visualizar-meus-agendamentos)
    *   [Status dos Agendamentos](#status-dos-agendamentos)
4.  [Cancelar um Agendamento](#4-cancelar-um-agendamento)
    *   [Pelo Painel do Cliente](#pelo-painel-do-cliente)
    *   [Via Link de E-mail](#via-link-de-e-mail)
5.  [Atualizar Meu Perfil](#5-atualizar-meu-perfil)
6.  [Perguntas Frequentes (FAQ)](#6-perguntas-frequentes-faq)

---

## 1. Primeiros Passos

Para começar, você precisará:
1.  **Registrar-se**: Se ainda não tem uma conta, crie uma através da página de registro (`/register`).
2.  **Fazer Login**: Após o registro, faça login com seu e-mail e senha. Você será direcionado para a página de agendamento de serviços.

## 2. Agendar um Serviço

### Visualizar Serviços Disponíveis
Na página de agendamento (`/client/booking`), você verá uma lista dos serviços oferecidos pelos provedores. Cada cartão de serviço mostrará o nome do serviço, preço e duração.

### Selecionar um Serviço
Clique no serviço que você deseja agendar. Ao selecionar, a área à direita mostrará os horários disponíveis para aquele serviço.

### Escolher um Horário
*   Os horários disponíveis serão exibidos em blocos.
*   Clique no horário que melhor se adapta a você. A cor do bloco mudará para indicar que ele foi selecionado.
*   Uma seção de "Confirmar Agendamento" aparecerá, resumindo os detalhes do seu agendamento (serviço, provedor, data, hora, profissional e valor).

### Confirmar Agendamento
1.  Após revisar os detalhes, clique no botão "**Confirmar Agendamento**".
2.  Você receberá uma notificação de sucesso.
3.  Um e-mail de confirmação será enviado para o seu endereço de e-mail cadastrado, contendo todos os detalhes e um link para cancelar, se necessário.

## 3. Visualizar Meus Agendamentos

Acesse a seção "**Meus Agendamentos**" ou seu "**Perfil**" (rota `/profile`) para ver uma lista de todos os seus agendamentos, passados e futuros.

### Status dos Agendamentos
*   **CONFIRMED**: Seu agendamento está confirmado e ativo.
*   **CANCELLED**: Seu agendamento foi cancelado.

## 4. Cancelar um Agendamento

Você pode cancelar um agendamento de duas maneiras:

### Pelo Painel do Cliente
1.  Na lista de seus agendamentos, localize o agendamento que deseja cancelar.
2.  Clique no botão "**Cancelar**" ao lado do agendamento.
3.  Confirme a ação quando solicitado.
4.  Você receberá uma notificação de sucesso, e o status do agendamento será atualizado para `CANCELLED`.

### Via Link de E-mail
1.  Abra o e-mail de confirmação do agendamento que você deseja cancelar.
2.  Clique no link "**Cancelar Agendamento**" dentro do e-mail.
3.  Você será redirecionado para uma página de cancelamento no sistema.
4.  A página processará o cancelamento e exibirá uma mensagem de sucesso ou erro.

## 5. Atualizar Meu Perfil

Você pode gerenciar suas informações pessoais na página de perfil (`/profile`):
*   **Nome**: Altere seu nome de exibição.
*   **E-mail**: Altere seu endereço de e-mail.
*   **Senha**: Defina uma nova senha.
    *   Deixe o campo de senha em branco se não quiser alterá-la.
1.  Faça as alterações desejadas.
2.  Clique em "**Atualizar Perfil**" para salvar as mudanças.

## 6. Perguntas Frequentes (FAQ)

*   **Esqueci minha senha. Como faço para recuperá-la?**
    *   Atualmente, a funcionalidade de recuperação de senha não está implementada. Entre em contato com o suporte. (Nota: Pode ser implementado em futuras versões).
*   **Não recebi o e-mail de confirmação/cancelamento.**
    *   Verifique sua pasta de spam ou lixo eletrônico.
    *   Certifique-se de que o endereço de e-mail cadastrado está correto no seu perfil.
*   **Posso reagendar um serviço?**
    *   No momento, não há uma função direta de reagendamento. Você precisará cancelar o agendamento existente e criar um novo.
