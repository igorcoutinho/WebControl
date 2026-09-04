import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { panelApi, type ActivityItem, type PanelUser } from '../api/panel';
import { ApiError } from '../api/http';
import { actionLabel, formatDate } from '../lib/format';

export function UserDetailPage() {
  const { id = '' } = useParams();
  const [user, setUser] = useState<PanelUser | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const [{ user: u }, act] = await Promise.all([
      panelApi.user(id),
      panelApi.activity({ userId: id, page: 1, pageSize: 40 }),
    ]);
    setUser(u);
    setActivity(act.items);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Erro ao carregar');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function toggleBlock() {
    if (!user) return;
    setBusy(true);
    setError('');
    setOk('');
    try {
      const { user: updated } = await panelApi.setBlocked(user.id, !user.is_blocked);
      setUser(updated);
      setOk(updated.is_blocked ? 'Usuário bloqueado' : 'Usuário desbloqueado');
      const act = await panelApi.activity({ userId: id, page: 1, pageSize: 40 });
      setActivity(act.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao atualizar');
    } finally {
      setBusy(false);
    }
  }

  async function onReset(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setError('');
    setOk('');
    try {
      await panelApi.resetPassword(user.id, password);
      setPassword('');
      setOk('Senha atualizada');
      const act = await panelApi.activity({ userId: id, page: 1, pageSize: 40 });
      setActivity(act.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao resetar senha');
    } finally {
      setBusy(false);
    }
  }

  if (!user && !error) return <p className="muted">Carregando...</p>;
  if (!user) return <p className="error">{error}</p>;

  return (
    <div className="stack">
      <Link to="/users" className="muted">
        ← Usuários
      </Link>
      <h1>{user.full_name}</h1>
      <p className="muted">@{user.username}</p>
      <div className="badges">
        {user.panel_access ? <span className="badge ok">painel</span> : <span className="badge">sem painel</span>}
        {user.is_blocked ? <span className="badge bad">bloqueado</span> : <span className="badge ok">ativo</span>}
      </div>
      {error ? <p className="error">{error}</p> : null}
      {ok ? <p className="ok">{ok}</p> : null}

      <section className="card stack-sm">
        <h2>Acesso</h2>
        <button className={`btn ${user.is_blocked ? 'primary' : 'danger'}`} disabled={busy} onClick={toggleBlock}>
          {user.is_blocked ? 'Desbloquear acesso' : 'Bloquear acesso'}
        </button>
        <p className="muted small">
          Admin do painel é fixo (login WebControl). Este campo mostra se o usuário do app tem flag
          `panel_access` no banco.
        </p>
      </section>

      <section className="card stack-sm">
        <h2>Reset de senha</h2>
        <form className="stack-sm" onSubmit={onReset}>
          <input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={4}
            required
          />
          <button className="btn primary" disabled={busy} type="submit">
            Salvar nova senha
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Histórico</h2>
        <ul className="list">
          {activity.map((item) => (
            <li key={item.id}>
              <strong>{actionLabel(item.action)}</strong>
              <p className="muted">{formatDate(item.createdAt)}</p>
            </li>
          ))}
          {activity.length === 0 ? <li className="muted">Sem atividades.</li> : null}
        </ul>
      </section>
    </div>
  );
}
