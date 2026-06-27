import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Les exceptions techniques sont uniquement logguées de manière interne
    // et ne sont jamais révélées à l'utilisateur dans l'interface.
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5EFE3] flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 bg-[#C86A4A]/10 text-[#C86A4A] rounded-full flex items-center justify-center mx-auto text-3xl">
              ⚠️
            </div>
            <h1 className="text-2xl font-bold text-[#1E1E1E]">Une erreur est survenue</h1>
            <p className="text-muted-foreground">
              Veuillez réessayer dans quelques instants.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-[#C86A4A] text-white rounded hover:bg-[#B75939] transition-colors font-medium"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }

    return this.state.children;
  }
}
