import { useEffect } from 'react';

// Charge le script Google Identity Services une seule fois
let scriptLoading = false;
function loadGoogleScript(callback) {
  if (window.google) { callback(); return; }
  if (scriptLoading) { window.addEventListener('google-loaded', callback, { once: true }); return; }
  scriptLoading = true;
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.async = true;
  s.onload = () => { window.dispatchEvent(new Event('google-loaded')); callback(); };
  document.head.appendChild(s);
}

export default function GoogleAuthButton({ onCredential, buttonId = 'g-signin-btn' }) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    loadGoogleScript(() => {
      if (!window.google) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: onCredential });
      window.google.accounts.id.renderButton(
        document.getElementById(buttonId),
        { theme: 'outline', size: 'large', width: 360, text: 'continue_with', locale: 'fr' }
      );
    });
  }, [clientId, buttonId, onCredential]);

  if (!clientId) return null;

  return (
    <div className="flex justify-center">
      <div id={buttonId} />
    </div>
  );
}
