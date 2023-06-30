export interface ISSOLogin {
  action: 'testLogin';
}

export function apply() {
  const opener: Window = window.opener;
  if (opener) {
    opener.dispatchEvent(new CustomEvent('odcssotest'));
  }
}
