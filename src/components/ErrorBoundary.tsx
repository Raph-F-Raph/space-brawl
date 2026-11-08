import { Component, type ReactNode } from 'react';

// Si une erreur imprévue survient, on affiche un écran de secours au lieu d'une page blanche.
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="screen center">
        <div className="auth-card">
          <p className="auth-message">Oups, quelque chose s'est mal passé. Recharge le jeu pour continuer.</p>
          <button className="btn btn-green" onClick={() => location.reload()}>
            Recharger
          </button>
        </div>
      </div>
    );
  }
}
