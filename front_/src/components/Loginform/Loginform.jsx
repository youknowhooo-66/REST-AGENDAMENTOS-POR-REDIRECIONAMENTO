import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal/Modal";
import RegisterUser from "../RegisterUser/RegisterUser";
import api from "../../services/api.js";
import Input from "../UI/Input";
import Button from "../UI/Button";
import { IconMail, IconLock } from "../Icons";
import { jwtDecode } from "jwt-decode";



const LoginForm = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    //contexto
    const { login } = useAuth()
    // rotas com react router
    const navigate = useNavigate()
    // modal
    const [isModalOpen, setIsModalOpen] = useState(false)

    // função validação do login
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const data = {
                email: email,
                password: password
            };
            const response = await api.post("/auth/login", data);

            if (response.data.accessToken) {
                const token = response.data.accessToken;
                login(token); // Atualiza o contexto

                toast.success("Login realizado com sucesso!", {
                    autoClose: 3000,
                    hideProgressBar: true,
                    pauseOnHover: false
                });

                const decoded = jwtDecode(token);

                if (decoded.role === 'PROVIDER') {
                    navigate('/dashboard');
                } else if (decoded.role === 'CLIENT') {
                    navigate('/client/booking');
                } else {
                    navigate('/');
                }

            } else {
                toast.error('Token de acesso não recebido.', {
                    autoClose: 3000,
                    hideProgressBar: true,
                    pauseOnHover: false
                });
            }

        } catch (error) {
            console.error('Erro no login:', error);
            const errorMessage = error.response?.data?.error || 'Erro ao conectar com o servidor';
            toast.error(errorMessage, {
                autoClose: 3000,
                hideProgressBar: true,
                pauseOnHover: false
            });
        }
    }

    return (
        <div className="min-h-screen bg-page flex items-center justify-center p-4 animate-fade-in-up">
            <div className="w-full max-w-md bg-white dark:bg-card p-8 lg:p-10 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 hover-lift">

                <div className="text-center mb-8">
                    <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Bem-vindo!
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Faça login para continuar
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <Input
                        id="email"
                        label="Endereço de e-mail"
                        icon={<IconMail />}
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        id="password"
                        label="Senha"
                        icon={<IconLock />}
                        type="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" fullWidth className="mt-8">
                        Entrar
                    </Button>
                </form>

                <div className="flex justify-between mt-8 text-sm gap-4">
                    <button className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary-light transition-colors-smooth font-medium">
                        Esqueceu sua senha?
                    </button>
                    <button
                        className="font-semibold text-primary dark:text-primary-light hover:text-primary-dark dark:hover:text-primary transition-colors-smooth"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Criar conta
                    </button>
                </div>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <RegisterUser onClose={() => setIsModalOpen(false)} />
                </Modal>
            </div>
        </div>

    )
}

export default LoginForm