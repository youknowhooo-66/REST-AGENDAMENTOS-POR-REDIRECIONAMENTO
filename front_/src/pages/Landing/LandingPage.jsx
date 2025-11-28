import React from 'react';
import { Link } from 'react-router-dom';
import { IconCalendar, IconClock, IconUsers, IconCheck, IconArrowRight } from '../../components/Icons';

const LandingPage = () => {
  const benefits = [
    {
      icon: <IconCalendar size={32} />,
      title: 'Agendamento Fácil',
      description: 'Reserve seu horário em poucos cliques, de forma rápida e intuitiva.'
    },
    {
      icon: <IconClock size={32} />,
      title: 'Disponibilidade 24/7',
      description: 'Acesse o sistema a qualquer momento e escolha o melhor horário para você.'
    },
    {
      icon: <IconUsers size={32} />,
      title: 'Múltiplos Serviços',
      description: 'Encontre diversos profissionais e serviços em um só lugar.'
    }
  ];

  const features = [
    'Confirmação automática por e-mail',
    'Cancelamento fácil e rápido',
    'Gestão completa de agendamentos',
    'Interface moderna e responsiva',
    'Notificações em tempo real',
    'Suporte dedicado'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-fade-in">
            <IconCheck size={16} />
            Sistema Completo de Agendamento
          </div>

          {/* Headline */}
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight animate-fade-in">
            Agende seus <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">serviços</span> com facilidade
          </h1>

          {/* Subheadline */}
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto animate-fade-in">
            A plataforma completa para você encontrar o melhor horário e profissional para seus serviços.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
            <Link
              to="/register"
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
            >
              Começar Agora
              <IconArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/public/services"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg border-2 border-gray-200 dark:border-gray-700"
            >
              Ver Serviços
            </Link>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
            ✨ Junte-se a centenas de clientes satisfeitos
          </p>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white dark:bg-gray-800 py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Por que escolher nossa plataforma?
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Oferecemos a melhor experiência em agendamento de serviços
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-600"
              >
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-16 h-16 rounded-xl flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 lg:p-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Tudo que você precisa
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full p-1 flex-shrink-0">
                    <IconCheck size={20} />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Crie sua conta gratuitamente e comece a agendar seus serviços hoje mesmo!
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Criar Conta Grátis
            <IconArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2025 Sistema de Agendamento. Todos os direitos reservados.
          </p>
          <div className="mt-4 space-x-4">
            <Link to="/login" className="text-gray-400 hover:text-white transition">
              Já tem conta? Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
