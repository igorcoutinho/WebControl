const LABELS: Record<string, string> = {
  register: 'Criou conta no app',
  login: 'Entrou no app',
  panel_register: 'Criou conta no painel',
  panel_login: 'Entrou no painel',
  user_block: 'Bloqueou usuário',
  user_unblock: 'Desbloqueou usuário',
  user_approve: 'Liberou acesso',
  user_revoke: 'Removeu liberação',
  user_content_wipe: 'Apagou conteúdo do usuário',
  password_reset: 'Resetou senha',
  settings_update: 'Atualizou configurações',
  photo_post: 'Postou foto',
  photo_delete: 'Apagou foto',
  video_post: 'Postou vídeo',
  comment_create: 'Comentou',
  comment_delete: 'Apagou comentário',
  reaction: 'Reagiu a uma foto',
};

export function actionLabel(action: string): string {
  return LABELS[action] || action;
}

export function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleString('pt-BR');
  } catch {
    return value;
  }
}

export function activityDetail(item: {
  action: string;
  meta: unknown;
}): string | null {
  if (!item.meta || typeof item.meta !== 'object') return null;
  const meta = item.meta as Record<string, unknown>;
  if (typeof meta.body === 'string' && meta.body.trim()) return meta.body;
  if (typeof meta.caption === 'string' && meta.caption.trim()) return meta.caption;
  if (typeof meta.message === 'string' && meta.message.trim()) return meta.message;
  if (typeof meta.emoji === 'string') return meta.emoji;
  if (typeof meta.autoApproveUsers === 'boolean') {
    return meta.autoApproveUsers
      ? 'Liberação automática ligada'
      : 'Liberação automática desligada';
  }
  return null;
}
