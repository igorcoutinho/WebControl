import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { panelApi, type PanelUser } from '../api/panel';
import { ApiError } from '../api/http';
import { formatDate } from '../lib/format';

export function PendingUsersPage() {
  const [users, setUsers] = useState<PanelUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load(p = page) {
    setLoading(true);
    setError('');
    try {
      const data = await panelApi.users({ approved: false, page: p, pageSize: 20 });
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Erro ao listar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(page);
  }, [page]);

  async function approve(user: PanelUser) {
    setBusyId(user.id);
    setError('');
    setOk('');
    try {
      await panelApi.setApproved(user.id, true);
      setOk(`@${user.username} liberado`);
      await load(page);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao liberar');
    } finally {
      setBusyId(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="stack">
      <h1>Usuários novos</h1>
      <p className="muted">Contas aguardando liberação para usar o app.</p>
      {error ? <p className="error">{error}</p> : null}
      {ok ? <p className="ok">{ok}</p> : null}
      {loading ? <p className="muted">Carregando...</p> : null}

      <div className="card list-card">
        <ul className="list">
          {users.map((user) => (
            <li key={user.id} className="user-row">
              <Link to={`/users/${user.id}`}>
                <strong>{user.full_name}</strong>
                <p className="muted">@{user.username}</p>
                <p className="muted small">{formatDate(user.created_at)}</p>
              </Link>
              <button
                className="btn primary"
                disabled={busyId === user.id}
                type="button"
                onClick={() => void approve(user)}
              >
                Liberar
              </button>
            </li>
          ))}
          {!loading && users.length === 0 ? (
            <li className="muted">Nenhum usuário aguardando liberação.</li>
          ) : null}
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
