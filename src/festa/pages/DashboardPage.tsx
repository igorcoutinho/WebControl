import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { panelApi, type ActivityItem } from '../api/panel';
import { actionLabel, activityDetail, formatDate } from '../lib/format';
import { ApiError } from '../api/http';

export function DashboardPage() {
  const [users, setUsers] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [pending, setPending] = useState(0);
  const [recent, setRecent] = useState<ActivityItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await panelApi.dashboard();
        if (cancelled) return;
        setUsers(data.users);
        setBlocked(data.blocked);
        setPending(data.pending);
        setRecent(data.recentActivity);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Erro ao carregar');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="stack">
      <h1>Painel</h1>
      {error ? <p className="error">{error}</p> : null}
      <div className="stats">
        <div className="card stat">
          <span>Usuários</span>
          <strong>{users}</strong>
        </div>
        <Link to="/pending" className="card stat">
          <span>Aguardando</span>
          <strong>{pending}</strong>
        </Link>
        <div className="card stat">
          <span>Bloqueados</span>
          <strong>{blocked}</strong>
        </div>
      </div>

      <section className="card">
        <div className="row between">
          <h2>Atividade recente</h2>
          <Link to="/activity">Ver tudo</Link>
        </div>
        <ul className="list">
          {recent.map((item) => {
            const detail = activityDetail(item);
            return (
              <li key={item.id}>
                <div>
                  <strong>{actionLabel(item.action)}</strong>
                  {detail ? <p className="activity-detail">{detail}</p> : null}
                  <p className="muted">
                    {item.actor?.username ? `@${item.actor.username}` : 'sistema'} ·{' '}
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              </li>
            );
          })}
          {recent.length === 0 ? <li className="muted">Nenhuma atividade ainda.</li> : null}
        </ul>
      </section>
    </div>
  );
}
