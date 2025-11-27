import LoginForm from '../../components/Loginform/Loginform';
import { IconTicket } from '../../components/Icons';

export default function Login() {
    return (
        <div className='flex min-h-screen bg-background'>
            {/* Left side - Branding */}
            <div className='hidden md:flex w-1/2 bg-primary flex-col items-center justify-center p-12 text-primary-foreground text-center'>
                <IconTicket size={80} className="mb-6" />
                <h1 className="text-4xl font-bold mb-4">Sistema de Agendamento</h1>
                <p className="text-lg text-primary-foreground/80">Gerencie seus horários de forma fácil e eficiente.</p>
            </div>
            {/* Right side - Form */}
            <div className='flex w-full md:w-1/2 items-center justify-center p-8'>
                <LoginForm />
            </div>
        </div>
    )
}