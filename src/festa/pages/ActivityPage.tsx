import { useEffect, useState } from 'react';
import { panelApi, type ActivityItem } from '../api/panel';
import { ApiError } from '../api/http';
import { actionLabel, formatDate } from '../lib/format';

export function ActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await panelApi.activity({ page, pageSize: 40 });
        if (cancelled) return;
        setItems(data.items);
        setTotal(data.total);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Erro');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / 40));

  return (
    <div className="stack">
      <h1>Histórico</h1>
      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="muted">Carregando...</p> : null}
      <div className="card">
        <ul className="list">
          {items.map((item) => (
            <li key={item.id}>
              <strong>{actionLabel(item.action)}</strong>
              <p className="muted">
                {item.actor?.username ? `@${item.actor.username}` : 'sistema'} · {formatDate(item.createdAt)}
              </p>
            </li>
          ))}
          {!loading && items.length === 0 ? <li className="muted">Nenhuma atividade.</li> : null}
        </ul>
      </div>
      <div className="row between">
        <button className="btn ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Anterior
        </button>
        <span className="muted">
          Página {page} / {totalPages}
        </span>
        <button
          className="btn ghost"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
