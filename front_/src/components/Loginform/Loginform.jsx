import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Modal from "../Modal/Modal";
import RegisterUser from "../RegisterUser/RegisterUser";
import api from "../../services/api.js";
import Input from "../Form/Input";
import Button from "../Form/Button";
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
        <div className="w-full max-w-md bg-card text-card-foreground p-8 rounded-xl shadow-2xl">

            <h2 className="text-3xl font-bold text-center mb-2 text-text">Bem-vindo!</h2>
            <p className="text-center text-text-muted mb-8">Faça login para continuar</p>

            <form onSubmit={handleLogin} className="space-y-6">
                <Input 
                    id="email"
                    label="Endereço de e-mail"
                    icon={<IconMail />}
                    type="email"
                    placeholder="E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <Input 
                    id="password"
                    label="Senha"
                    icon={<IconLock />}
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                
                <Button type="submit" fullWidth>
                    Entrar
                </Button>
            </form>
            <div className="flex justify-between mt-6 text-sm">
                <button className="cursor-pointer text-text-muted hover:text-primary transition">Esqueceu sua senha?</button>
                <button className="cursor-pointer font-semibold text-primary hover:underline" onClick={() => setIsModalOpen(true)}>Criar conta</button>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <RegisterUser onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>

    )
}

export default LoginForm