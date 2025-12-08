import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import api from "../../services/api.js";
import Input from "../Form/Input"; // Adjusted path
import Button from "../Form/Button";   // Adjusted path
import { IconMail, IconLock } from "../Icons"; // Adjusted path
import { jwtDecode } from "jwt-decode";


const ModalLoginForm = ({ onClose, onLoginSuccess, onSwitchToRegister }) => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false);
    const { login } = useAuth()


    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

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

                // Chamada de sucesso para o componente pai (Scheduling.jsx)
                if (onLoginSuccess) {
                    onLoginSuccess(token);
                }
                onClose(); // Fecha o modal
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
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-card p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-text mb-2">
                    Bem-vindo de volta!
                </h2>
                <p className="text-text-muted">
                    Faça login para continuar seu agendamento.
                </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
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

                <Button type="submit" fullWidth disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                </Button>
            </form>

            <div className="flex justify-between mt-6 text-sm gap-4">
                <button
                    type="button"
                    className="text-text-muted hover:text-primary transition-colors-smooth font-medium"
                >
                    Esqueceu sua senha?
                </button>
                {onSwitchToRegister && (
                    <button
                        type="button"
                        className="font-semibold text-primary hover:text-primary/80 transition-colors-smooth"
                        onClick={onSwitchToRegister}
                    >
                        Criar conta
                    </button>
                )}
            </div>
        </div>
    )
}

export default ModalLoginForm