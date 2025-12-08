import LoginForm from '../../components/Loginform/Loginform';
import { IconTicket } from '../../components/Icons';

export default function Login() {
    return (
        <div className='flex min-h-screen page-gradient'>
            {/* Left side - Branding */}
            <div className='hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 flex-col items-center justify-center p-12 text-white text-center relative overflow-hidden'>
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                <div className="relative z-10">
                    <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm mb-8 inline-block">
                        <IconTicket size={80} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 tracking-tight">Sistema de Agendamento</h1>
                    <p className="text-xl text-blue-100 max-w-md mx-auto leading-relaxed">Gerencie seus horários de forma fácil, rápida e eficiente em uma única plataforma.</p>
                </div>
            </div>
            {/* Right side - Form */}
            <div className='flex w-full md:w-1/2 items-center justify-center p-8'>
                <LoginForm />
            </div>
        </div>
    )
}