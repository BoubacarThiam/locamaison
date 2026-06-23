import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function PageInscription() {
  const [params]  = useSearchParams();
  const { loginWithData } = useAuth();
  const nav = useNavigate();

  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', telephone: '',
    password: '', confirm: '', role: params.get('role') || 'locataire',
  });
  const [error,         setError]         = useState('');
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const redirectByRole = (role) => {
    const map = { proprietaire: '/dashboard/proprietaire', locataire: '/dashboard/locataire' };
    nav(map[role] ?? '/');
  };

  // Inscription classique email/mot de passe
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (form.password.length < 6)       { setError('Mot de passe trop court (min. 6 caractères).'); return; }
    if (form.telephone && !/^(\+221|00221)?[76]\d{8}$/.test(form.telephone)) {
      setError('Numéro de téléphone sénégalais invalide.'); return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        nom: form.nom, prenom: form.prenom, email: form.email,
        telephone: form.telephone, password: form.password, role: form.role,
      });
      loginWithData(data.data.token, data.data.user);
      redirectByRole(data.data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  // Inscription / connexion via Google — utilise le rôle déjà sélectionné dans le formulaire
  const handleGoogleCredential = async (credentialResponse) => {
    const credential = credentialResponse?.credential;
    if (!credential) return;
    setGoogleLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/google', { credential, role: form.role });
      loginWithData(data.data.token, data.data.user);
      redirectByRole(data.data.user.role);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur de connexion Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-[#1B5E20] py-4 px-6">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-[#F9A825] rounded-lg flex items-center justify-center font-bold text-[#1B5E20]">L</div>
          <span className="text-white font-bold text-xl">LocaMaison</span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
            <p className="text-gray-500 mt-2">Rejoignez la communauté LocaMaison</p>
          </div>

          {/* Choix du rôle */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { val: 'locataire',    label: '🏠 Je cherche un logement', desc: 'Locataire' },
              { val: 'proprietaire', label: '🔑 Je loue mon bien',       desc: 'Propriétaire' },
            ].map(r => (
              <button key={r.val} type="button" onClick={() => set('role', r.val)}
                      className={`p-4 rounded-xl border-2 text-center transition-all
                        ${form.role === r.val ? 'border-[#1B5E20] bg-[#E8F5E9]' : 'border-gray-200 hover:border-gray-300'}`}>
                <p className="font-semibold text-gray-900 text-sm">{r.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>

          {/* Bouton Google */}
          {googleLoading ? (
            <div className="flex justify-center py-2">
              <div className="w-6 h-6 border-2 border-[#1B5E20] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <GoogleAuthButton onCredential={handleGoogleCredential} buttonId="g-signup-btn" />
          )}

          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">ou avec votre email</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
          )}

          {/* Formulaire classique */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input value={form.prenom} onChange={e => set('prenom', e.target.value)}
                       className="input" placeholder="Oumar" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input value={form.nom} onChange={e => set('nom', e.target.value)}
                       className="input" placeholder="Diallo" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                     className="input" placeholder="oumar@gmail.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone <span className="text-gray-400">(optionnel)</span>
              </label>
              <input type="tel" value={form.telephone} onChange={e => set('telephone', e.target.value)}
                     className="input" placeholder="+221 77 000 00 00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                     className="input" placeholder="Min. 6 caractères" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)}
                     className="input" placeholder="••••••" required />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Création du compte…' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600 text-sm">
              Déjà un compte ?{' '}
              <Link to="/connexion" className="text-[#1B5E20] font-semibold hover:underline">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
