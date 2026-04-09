"use client"

import React, { ReactNode, Component, ErrorInfo } from 'react';
import { toast } from '@/hooks/useLocalToast';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Aquí podrías enviar el error a un servicio de logging
    // logErrorToService(error, errorInfo);
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center space-y-4 max-w-md">
              <div className="flex justify-center">
                <AlertCircle className="h-16 w-16 text-destructive" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">Algo salió mal</h1>
                <p className="text-muted-foreground">
                  Ocurrió un error inesperado. Por favor intenta de nuevo.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <p className="text-sm text-red-500 font-mono mt-4 bg-secondary p-3 rounded overflow-auto max-h-40">
                    {this.state.error.message}
                  </p>
                )}
              </div>
              <button
                onClick={this.resetError}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
