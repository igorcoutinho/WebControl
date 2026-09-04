import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function Shell() {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="brand">WebControl</p>
          <p className="brand-sub">Jardim da Olívia</p>
        </div>
        <div className="topbar-user">
          <span>@{user?.username}</span>
          <button type="button" className="btn ghost" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <nav className="nav">
        <NavLink to="/" end>
          Início
        </NavLink>
        <NavLink to="/pending">Usuários novos</NavLink>
        <NavLink to="/users">Usuários</NavLink>
        <NavLink to="/activity">Histórico</NavLink>
        <NavLink to="/errors">Erros</NavLink>
        <NavLink to="/settings">Configurações</NavLink>
      </nav>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
