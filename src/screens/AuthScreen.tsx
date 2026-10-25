import { useState, type FormEvent } from 'react';
import { useGame } from '../lib/GameContext';

export function AuthScreen() {
  const { signIn, signUp } = useGame();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (mode === 'signup' && username.trim().length < 3) {
      setMessage('Choisis un pseudo de 3 lettres minimum.');
      return;
    }
    setBusy(true);
    const err =
      mode === 'signup'
        ? await signUp(username.trim(), email.trim(), password)
        : await signIn(email.trim(), password);
    setBusy(false);
    if (err) setMessage(err);
  }

  return (
    <div className="screen auth">
      <form className="auth-card" onSubmit={submit}>
        <h1 className="logo">
          SPACE
          <br />
          BRAWL
        </h1>
        <p className="auth-sub">{mode === 'login' ? 'Content de te revoir, pilote !' : 'Crée ton compte de pilote'}</p>

        {mode === 'signup' && (
          <input
            className="input"
            type="text"
            placeholder="Pseudo"
            autoComplete="nickname"
            maxLength={20}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}
        <input
          className="input"
          type="email"
          placeholder="E-mail"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="input"
          type="password"
          placeholder="Mot de passe (6 caractères min.)"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          minLength={6}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && <p className="auth-message">{message}</p>}

        <button className="btn btn-yellow btn-big" type="submit" disabled={busy}>
          {busy ? '…' : mode === 'login' ? 'SE CONNECTER' : 'CRÉER MON COMPTE'}
        </button>

        <button
          type="button"
          className="link"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setMessage(null);
          }}
        >
          {mode === 'login' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
        </button>
      </form>
    </div>
  );
}
