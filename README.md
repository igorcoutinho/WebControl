# WebControl

Painel web do **Jardim da Olívia** (React + Vite), em `src/festa`.

## Rodar

```bash
cd WebControl
cp .env.example .env
npm install
npm run dev
```

Por padrão conecta na API de produção: `https://api.minhasfotos.net`.

## Login

Somente o admin fixo configurado no backend:

- usuário: `PANEL_ADMIN_USER` (padrão `admin`)
- senha: `PANEL_ADMIN_PASSWORD` (**obrigatória** no `.env` do backend — sem fallback no código)

Não usa conta do app mobile.

## Backend

Rotas `/api/panel/*` (sem assinatura `APP_SECRET`).

No servidor da API, configure:

```env
PANEL_ADMIN_USER=admin
PANEL_ADMIN_PASSWORD=troque-por-senha-forte-do-painel
JWT_SECRET=troque-por-um-segredo-forte
```

Reinicie o backend depois de atualizar o código do painel.
