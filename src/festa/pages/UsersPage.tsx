import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { panelApi, type PanelUser } from '../api/panel';
import { ApiError } from '../api/http';
import { formatDate } from '../lib/format';

export function UsersPage() {
  const [users, setUsers] = useState<PanelUser[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await panelApi.users({ search: query || undefined, page, pageSize: 20 });
        if (cancelled) return;
        setUsers(data.users);
        setTotal(data.total);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Erro ao listar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, page]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="stack">
      <h1>Usuários</h1>
      <form className="row gap" onSubmit={onSearch}>
        <input
          className="grow"
          placeholder="Buscar por nome ou @usuario"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn primary" type="submit">
          Buscar
        </button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="muted">Carregando...</p> : null}

      <div className="card list-card">
        <ul className="list">
          {users.map((user) => (
            <li key={user.id}>
              <Link to={`/users/${user.id}`} className="user-row">
                <div>
                  <strong>{user.full_name}</strong>
                  <p className="muted">@{user.username}</p>
                </div>
                <div className="badges">
                  {!user.is_approved ? <span className="badge">aguardando</span> : null}
                  {user.is_blocked ? <span className="badge bad">bloqueado</span> : null}
                  <span className="muted small">{formatDate(user.created_at)}</span>
                </div>
              </Link>
            </li>
          ))}
          {!loading && users.length === 0 ? <li className="muted">Nenhum usuário.</li> : null}
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
