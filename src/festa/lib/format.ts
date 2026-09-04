const LABELS: Record<string, string> = {
  register: 'Criou conta no app',
  login: 'Entrou no app',
  panel_register: 'Criou conta no painel',
  panel_login: 'Entrou no painel',
  user_block: 'Bloqueou usuário',
  user_unblock: 'Desbloqueou usuário',
  password_reset: 'Resetou senha',
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
