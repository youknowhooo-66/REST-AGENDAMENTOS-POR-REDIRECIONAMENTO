# REST-AGENDAMENTOS-POR-REDIRECIONAMENTO

Este é um sistema de agendamento completo, com funcionalidades de agendamento de serviços, gestão de horários, autenticação de usuários (clientes e provedores), e um dashboard para provedores. O projeto é dividido em um frontend React e um backend Node.js (Express) com PostgreSQL e Prisma ORM.

## Índice

1.  [Visão Geral](#1-visão-geral)
2.  [Funcionalidades](#2-funcionalidades)
3.  [Tecnologias Utilizadas](#3-tecnologias-utilizadas)
    *   [Backend](#backend)
    *   [Frontend](#frontend)
4.  [Configuração do Ambiente](#4-configuração-do-ambiente)
    *   [Pré-requisitos](#pré-requisitos)
    *   [Passos para Configuração](#passos-para-configuração)
5.  [Executando o Projeto](#5-executando-o-projeto)
    *   [Backend](#backend-1)
    *   [Frontend](#frontend-1)
6.  [Variáveis de Ambiente](#6-variáveis-de-ambiente)
7.  [Rotas da API](#7-rotas-da-api)
8.  [Estrutura do Projeto](#8-estrutura-do-projeto)
9.  [Próximos Passos / Melhorias](#9-próximos-passos--melhorias)
10. [Licença](#10-licença)

---

## 1. Visão Geral

Este projeto implementa um sistema de agendamento robusto, permitindo que provedores gerenciem seus serviços, funcionários e horários de disponibilidade, enquanto clientes podem agendar, visualizar e cancelar seus próprios agendamentos. Inclui um dashboard para provedores com estatísticas e visualização de próximos agendamentos.

## 2. Funcionalidades

### Backend
*   Autenticação e Autorização (JWT, bcrypt)
*   Gestão de Usuários (Clientes, Provedores, Admin)
*   Gestão de Provedores
*   Gestão de Serviços (CRUD)
*   Gestão de Funcionários (Staff) (CRUD)
*   Gestão de Horários de Disponibilidade (Criação individual e em lote)
*   Gestão de Agendamentos (Criação, Cancelamento por cliente e provedor)
*   Dashboard de Provedor (Estatísticas, Agendamentos por serviço/período, Próximos agendamentos)
*   Sistema de E-mail para confirmação e cancelamento de agendamentos
*   Validação de dados e tratamento de erros

### Frontend
*   Páginas de Login e Registro
*   Dashboard do Provedor (visão geral, gráficos de agendamentos, lista de próximos agendamentos)
*   Gestão de Serviços (CRUD, busca e filtros)
*   Gestão de Funcionários (CRUD)
*   Gestão de Horários de Disponibilidade (Criação individual e em lote, visualização em tabela e calendário)
*   Gerenciamento de Agendamentos do Provedor (listagem, filtros, cancelamento)
*   Página de Agendamento de Serviço para Clientes
*   Lista de Agendamentos do Cliente com opção de cancelamento
*   Página de Perfil do Cliente (atualização de dados e senha)
*   Página Pública de Serviços
*   Página de Cancelamento de Agendamento via link de e-mail
*   Design responsivo com Tailwind CSS
*   Notificações `toast` consistentes

## 3. Tecnologias Utilizadas

### Backend
*   **Node.js**: Ambiente de execução JavaScript
*   **Express**: Framework web para Node.js
*   **Prisma ORM**: ORM (Object-Relational Mapper) para interagir com o banco de dados
*   **PostgreSQL**: Banco de dados relacional
*   **JWT (JSON Web Tokens)**: Para autenticação e autorização
*   **Bcrypt**: Para hashing de senhas
*   **Nodemailer**: Para envio de e-mails
*   **uuid**: Para geração de IDs únicos (tokens de cancelamento)

### Frontend
*   **React**: Biblioteca JavaScript para construção de interfaces de usuário
*   **Vite**: Ferramenta de build para projetos web
*   **Tailwind CSS**: Framework CSS utility-first para design rápido e responsivo
*   **React Router DOM**: Para roteamento na SPA
*   **React Toastify**: Para notificações
*   **Recharts**: Para gráficos no dashboard
*   **Moment.js**: Para manipulação de datas

## 4. Configuração do Ambiente

### Pré-requisitos
*   Node.js (v18.x ou superior)
*   npm (gerenciador de pacotes do Node.js)
*   PostgreSQL (instância local ou remota)
*   Git

### Passos para Configuração

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd REST-AGENDAMENTOS-POR-REDIRECIONAMENTO
    ```

2.  **Configurar o Backend:**
    ```bash
    cd back_
    npm install
    cp .env.example .env
    ```
    Edite o arquivo `.env` com suas credenciais do banco de dados e outras configurações. Veja a seção [Variáveis de Ambiente](#6-variáveis-de-ambiente) para mais detalhes.

    **Configurar Banco de Dados com Prisma:**
    ```bash
    npx prisma migrate dev --name init # ou o nome da sua última migration
    npx prisma generate
    ```
    Se você estiver começando do zero, `init` é um bom nome. Se já existirem migrations, use o nome da sua última.

3.  **Configurar o Frontend:**
    ```bash
    cd ../front_
    npm install
    cp .env.example .env # Se você tiver um .env.example no frontend
    ```
    Edite o arquivo `.env` no frontend (se aplicável). Veja a seção [Variáveis de Ambiente](#6-variáveis-de-ambiente) para mais detalhes (ex: `VITE_APP_API_URL`).

## 5. Executando o Projeto

### Backend
No diretório `back_`:
```bash
npm run dev # ou npm start, dependendo do seu package.json
```
O backend estará rodando em `http://localhost:3001` (ou a porta configurada no seu `.env`).

### Frontend
No diretório `front_`:
```bash
npm run dev
```
O frontend estará rodando em `http://localhost:5173` (ou a porta configurada pelo Vite).

## 6. Variáveis de Ambiente

Crie um arquivo `.env` na raiz dos diretórios `back_` e `front_` (se necessário).

### `back_/.env`
```
DATABASE_URL="postgresql://user:password@localhost:5432/mydatabase?schema=public"
JWT_SECRET="seu_segredo_jwt_aqui"
JWT_REFRESH_SECRET="seu_segredo_jwt_refresh_aqui"
ACCESS_TOKEN_EXPIRATION="15m" # Ex: 15 minutos
REFRESH_TOKEN_EXPIRATION="7d" # Ex: 7 dias

# Configurações de E-mail (Nodemailer)
EMAIL_SERVICE="gmail" # ou 'Outlook', 'SendGrid', etc.
EMAIL_USER="seu_email@exemplo.com"
EMAIL_PASS="sua_senha_do_email_ou_app_password"
FRONTEND_URL="http://localhost:5173" # URL do seu frontend para links de cancelamento
```

### `front_/.env` (Exemplo)
```
VITE_APP_API_URL="http://localhost:3001/api"
```

## 7. Rotas da API

Consulte os arquivos na pasta `back_/src/routes/` para uma lista detalhada de todas as rotas e seus respectivos middlewares de autenticação.

*   `publicRoutes.js`: Rotas acessíveis sem autenticação (ex: listagem pública de serviços).
*   `authRoutes.js`: Rotas de autenticação (registro, login, refresh, logout).
*   `authUser.js`: Rotas para gestão de usuários (protegidas por autenticação e, em alguns casos, por role).
*   `authService.js`: Rotas para gestão de serviços (protegidas para provedores).
*   `authStaff.js`: Rotas para gestão de funcionários (protegidas para provedores).
*   `authAvailabilitySlot.js`: Rotas para gestão de horários de disponibilidade (protegidas para provedores).
*   `authBooking.js`: Rotas para gestão de agendamentos (protegidas para clientes e provedores).
*   `authDashboard.js`: Rotas para dados do dashboard (protegidas para provedores).

## 8. Estrutura do Projeto

```
.
├── back_/
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/             # Configurações globais (ex: Prisma Client)
│   │   ├── controller/         # Lógica de negócio e manipulação de requisições
│   │   │   ├── Appointment/
│   │   │   ├── Auth/
│   │   │   ├── AvailabilitySlot/
│   │   │   ├── Booking/
│   │   │   ├── Dashboard/
│   │   │   ├── Public/
│   │   │   ├── Service/
│   │   │   ├── Staff/
│   │   │   └── User/
│   │   ├── middleware/         # Middlewares (ex: autenticação)
│   │   ├── routes/             # Definição das rotas da API
│   │   ├── services/           # Serviços externos (ex: e-mail)
│   │   └── utils/              # Funções utilitárias (ex: JWT)
│   ├── prisma/                 # Esquemas e migrations do Prisma
│   └── ...                     # Outros arquivos de configuração e dependências
└── front_/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── assets/             # Imagens, ícones
    │   ├── components/         # Componentes React reutilizáveis
    │   │   ├── AppointmentForm/
    │   │   ├── AppointmentTable/
    │   │   ├── BookingForm/
    │   │   ├── BulkSlotCreator/
    │   │   ├── Card/
    │   │   ├── ClientDetailsModal/
    │   │   ├── DashboardChart/
    │   │   ├── Form/
    │   │   ├── Icons/
    │   │   ├── Loginform/
    │   │   ├── Modal/
    │   │   ├── PrivateRoute/
    │   │   ├── RegisterForm/
    │   │   ├── RegisterModal/
    │   │   ├── RegisterUser/
    │   │   ├── ServiceCard/
    │   │   ├── ServiceForm/
    │   │   ├── SideMenu/
    │   │   ├── UserForm/
    │   │   └── UserTable/
    │   ├── contexts/           # Context API (ex: AuthContext, ThemeContext)
    │   ├── data/               # Dados mock (se aplicável)
    │   ├── layouts/            # Layouts principais (ex: DashboardLayout)
    │   ├── pages/              # Páginas da aplicação
    │   │   ├── Admin/
    │   │   ├── AppointmentDetail/
    │   │   ├── AppointmentForm/
    │   │   ├── AppointmentList/
    │   │   ├── Cancellation/
    │   │   ├── Client/
    │   │   ├── Dashboard/
    │   │   ├── Landing/
    │   │   ├── Login/
    │   │   ├── Provider/
    │   │   ├── Public/
    │   │   ├── Register/
    │   │   ├── Scheduling/
    │   │   ├── ServiceDetail/
    │   │   ├── ServiceForm/
    │   │   ├── ServiceList/
    │   │   ├── ServiceSearch/
    │   │   ├── UserList/
    │   │   └── UserProfile/
    │   └── services/           # Serviços de API (ex: axios instance)
    └── ...                     # Outros arquivos de configuração (package.json, tailwind.config.js, etc.)
```

## 9. Próximos Passos / Melhorias

*   Implementar autenticação de dois fatores (2FA).
*   Adicionar notificações em tempo real (WebSockets) para novos agendamentos/cancelamentos.
*   Integrar sistemas de pagamento para serviços pagos.
*   Melhorar a experiência de usuário para a seleção de horários (ex: visualização semanal/mensal mais robusta).
*   Implementar mais testes de unidade e integração (backend e frontend).
*   Internacionalização (i18n).
*   Otimização de performance e SEO.

## 10. Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
