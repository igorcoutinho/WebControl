# WebControl

Painel web do **Jardim da Olívia** (React + Vite), dentro de `src/festa`.

## Rodar

```bash
cd WebControl
cp .env.example .env
npm install
npm run dev
```

API local padrão: `http://127.0.0.1:4000` (`VITE_API_URL`).

## Acesso

1. Criar conta no painel (`/register`) — liberado.
2. No MySQL, liberar o usuário:

```sql
UPDATE users SET panel_access = 1 WHERE username = 'seu.usuario';
```

3. Entrar em `/login`.

## Funcionalidades

- Dashboard com totais e atividade recente
- Lista/busca de usuários
- Detalhe: bloquear/desbloquear, reset de senha, histórico
- Histórico global
- Layout responsivo (browser mobile)

## Backend

Rotas em `OliviaBff` sob `/api/panel/*` (sem assinatura `APP_SECRET`).
Flags: `users.panel_access`, `users.is_blocked`. Tabela: `activity_logs`.
