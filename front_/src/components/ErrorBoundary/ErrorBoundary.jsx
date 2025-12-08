import React from 'react';
import { IconAlertTriangle } from '../Icons'; // Assuming it's available or use SVG directly if preferred, but it is in index.jsx

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
                    <div className="bg-card p-8 rounded-2xl shadow-2xl max-w-2xl w-full border border-border">
                        <div className="flex items-center gap-3 mb-6 text-destructive">
                            <div className="p-3 bg-destructive/10 rounded-full">
                                <IconAlertTriangle size={32} />
                            </div>
                            <h1 className="text-2xl font-bold">
                                Algo deu errado
                            </h1>
                        </div>

                        <p className="text-muted-foreground mb-8 text-lg">
                            Ocorreu um erro inesperado na aplicação. Nossos engenheiros já foram notificados.
                            Tente recarregar a página.
                        </p>

                        <div className="bg-muted p-4 rounded-lg overflow-auto mb-8 max-h-60 border border-border">
                            <p className="font-mono text-sm text-destructive whitespace-pre-wrap">
                                {this.state.error && this.state.error.toString()}
                            </p>
                            {this.state.errorInfo && (
                                <pre className="font-mono text-xs text-muted-foreground mt-2 whitespace-pre-wrap">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            )}
                        </div>

                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg transition-all font-semibold shadow-lg shadow-primary/20 active:scale-95"
                        >
                            Recarregar Página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
