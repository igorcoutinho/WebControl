import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { panelApi, type ErrorLogItem } from '../api/panel';
import { ApiError } from '../api/http';
import { errorActionLabel, formatDate } from '../lib/format';

function metaSummary(meta: unknown): string | null {
  if (!meta || typeof meta !== 'object') return null;
  const m = meta as Record<string, unknown>;
  const parts: string[] = [];
  if (typeof m.attemptedUsername === 'string' && m.attemptedUsername) {
    parts.push(`tentou @${m.attemptedUsername}`);
  }
  if (typeof m.caption === 'string' && m.caption.trim()) {
    parts.push(`legenda: ${m.caption}`);
  }
  const files = m.files as
    | { photoCount?: number; photos?: { name?: string; mime?: string; size?: number }[]; video?: unknown }
    | undefined;
  if (files?.photoCount != null) {
    parts.push(`${files.photoCount} foto(s)`);
  }
  if (files?.photos?.[0]?.mime) {
    parts.push(files.photos.map((p) => `${p.mime || '?'} ${p.size ?? 0}b`).join(', '));
  }
  if (files?.video) parts.push('com vídeo');
  return parts.length ? parts.join(' · ') : null;
}

export function ErrorsPage() {
  const [items, setItems] = useState<ErrorLogItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await panelApi.errors({
          page,
          pageSize: 30,
          action: action || undefined,
        });
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
  }, [page, action]);

  const totalPages = Math.max(1, Math.ceil(total / 30));

  return (
    <div className="stack">
      <h1>Erros</h1>
      <p className="muted">Falhas de login e de publicação de fotos no app.</p>

      <div className="row gap">
        <select
          value={action}
          onChange={(e) => {
            setPage(1);
            setAction(e.target.value);
          }}
        >
          <option value="">Todas as ações</option>
          <option value="login">Login</option>
          <option value="photo_post">Publicar foto</option>
        </select>
      </div>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="muted">Carregando...</p> : null}

      <div className="card">
        <ul className="list">
          {items.map((item) => {
            const summary = metaSummary(item.meta);
            const open = expanded === item.id;
            return (
              <li key={item.id}>
                <div className="row between">
                  <strong>{errorActionLabel(item.action)}</strong>
                  <span className="badge bad">{formatDate(item.createdAt)}</span>
                </div>
                <p className="error-msg">{item.errorMessage}</p>
                <p className="muted">
                  {item.user?.id ? (
                    <Link to={`/users/${item.user.id}`}>
                      {item.user.full_name || 'Usuário'}{' '}
                      {item.user.username ? `(@${item.user.username})` : ''}
                    </Link>
                  ) : item.user?.username ? (
                    <>@{item.user.username}</>
                  ) : (
                    'usuário desconhecido'
                  )}
                  {item.user?.id ? (
                    <>
                      {' '}
                      · id <code>{item.user.id}</code>
                    </>
                  ) : null}
                </p>
                {summary ? <p className="muted small">{summary}</p> : null}
                {item.errorStack ? (
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => setExpanded(open ? null : item.id)}
                  >
                    {open ? 'Ocultar stack' : 'Ver stack'}
                  </button>
                ) : null}
                {open && item.errorStack ? (
                  <pre className="error-stack">{item.errorStack}</pre>
                ) : null}
              </li>
            );
          })}
          {!loading && items.length === 0 ? <li className="muted">Nenhum erro registrado.</li> : null}
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
