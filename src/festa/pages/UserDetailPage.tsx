import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { panelApi, type ActivityItem, type PanelUser } from '../api/panel';
import { ApiError } from '../api/http';
import { actionLabel, activityDetail, formatDate } from '../lib/format';

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

  async function toggleApprove() {
    if (!user) return;
    setBusy(true);
    setError('');
    setOk('');
    try {
      const { user: updated } = await panelApi.setApproved(user.id, !user.is_approved);
      setUser(updated);
      setOk(updated.is_approved ? 'Acesso ao app liberado' : 'Liberação removida');
      const act = await panelApi.activity({ userId: id, page: 1, pageSize: 40 });
      setActivity(act.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao atualizar');
    } finally {
      setBusy(false);
    }
  }

  async function wipeContent() {
    if (!user) return;
    const confirmed = window.confirm(
      `Apagar todas as fotos, vídeos, comentários e reações de @${user.username}? A conta permanece.`,
    );
    if (!confirmed) return;
    setBusy(true);
    setError('');
    setOk('');
    try {
      const result = await panelApi.wipeContent(user.id);
      setOk(
        `Conteúdo removido: ${result.photos} fotos, ${result.videos} vídeos, ${result.comments} comentários, ${result.reactions} reações.`,
      );
      const act = await panelApi.activity({ userId: id, page: 1, pageSize: 40 });
      setActivity(act.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao apagar conteúdo');
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
        {user.is_approved ? (
          <span className="badge ok">liberado</span>
        ) : (
          <span className="badge">aguardando</span>
        )}
        {user.is_blocked ? <span className="badge bad">bloqueado</span> : <span className="badge ok">não bloqueado</span>}
      </div>
      {error ? <p className="error">{error}</p> : null}
      {ok ? <p className="ok">{ok}</p> : null}

      <section className="card stack-sm">
        <h2>Acesso ao app</h2>
        <button className={`btn ${user.is_approved ? 'ghost' : 'primary'}`} disabled={busy} onClick={toggleApprove}>
          {user.is_approved ? 'Remover liberação' : 'Liberar acesso'}
        </button>
        <button className={`btn ${user.is_blocked ? 'primary' : 'danger'}`} disabled={busy} onClick={toggleBlock}>
          {user.is_blocked ? 'Desbloquear conta' : 'Bloquear conta'}
        </button>
        <p className="muted small">
          Sem liberação, o usuário não entra nem usa o app. Bloqueio impede login e todas as operações.
        </p>
      </section>

      <section className="card stack-sm">
        <h2>Conteúdo</h2>
        <button className="btn danger" disabled={busy} onClick={wipeContent}>
          Apagar tudo que postou
        </button>
        <p className="muted small">
          Remove fotos, vídeos, comentários, reações, notificações e avatar. A conta continua existindo.
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
          {activity.map((item) => {
            const detail = activityDetail(item);
            return (
              <li key={item.id}>
                <strong>{actionLabel(item.action)}</strong>
                {detail ? <p className="activity-detail">{detail}</p> : null}
                <p className="muted">{formatDate(item.createdAt)}</p>
              </li>
            );
          })}
          {activity.length === 0 ? <li className="muted">Sem atividades.</li> : null}
        </ul>
      </section>
    </div>
  );
}
