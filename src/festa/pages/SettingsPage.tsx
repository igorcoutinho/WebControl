import { useEffect, useState } from 'react';
import { panelApi } from '../api/panel';
import { ApiError } from '../api/http';

export function SettingsPage() {
  const [autoApproveUsers, setAutoApproveUsers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { settings } = await panelApi.settings();
        if (!cancelled) setAutoApproveUsers(settings.autoApproveUsers);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Erro ao carregar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(next: boolean) {
    if (busy || next === autoApproveUsers) return;
    setBusy(true);
    setError('');
    setOk('');
    try {
      const { settings } = await panelApi.updateSettings({ autoApproveUsers: next });
      setAutoApproveUsers(settings.autoApproveUsers);
      setOk(
        settings.autoApproveUsers
          ? 'Novas contas entram liberadas automaticamente'
          : 'Novas contas precisam de liberação manual',
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Falha ao salvar');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <p className="muted">Carregando...</p>;

  return (
    <div className="stack">
      <h1>Configurações</h1>
      {error ? <p className="error">{error}</p> : null}
      {ok ? <p className="ok">{ok}</p> : null}

      <section className="card stack-sm">
        <h2>Criação de conta</h2>
        <p className="muted">
          Controla se um usuário novo já pode usar o app ou se precisa aparecer em
          &quot;Usuários novos&quot; para liberação.
        </p>

        <div className={`switcher-card ${autoApproveUsers ? 'on' : 'off'}`}>
          <div className="switcher-copy">
            <strong>Liberação automática</strong>
            <span className="muted small">
              {autoApproveUsers
                ? 'Conta nova já entra liberada'
                : 'Conta nova fica aguardando liberação'}
            </span>
          </div>
          <button
            type="button"
            className={`switch ${autoApproveUsers ? 'on' : ''}`}
            role="switch"
            aria-checked={autoApproveUsers}
            aria-label="Liberação automática"
            disabled={busy}
            onClick={() => void save(!autoApproveUsers)}
          >
            <span className="switch-knob" />
          </button>
        </div>
        <div className="switcher-legend">
          <span className={!autoApproveUsers ? 'active' : ''}>Manual</span>
          <span className={autoApproveUsers ? 'active' : ''}>Automática</span>
        </div>
      </section>
    </div>
  );
}
