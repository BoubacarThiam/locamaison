import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function PageConnexion() {
  const { login, loginWithData } = useAuth();
  const nav      = useNavigate();
  const location = useLocation();
  const from     = location.state?.from?.pathname || null;

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Google — état pour le choix du rôle (nouvel utilisateur)
  const [googleLoading,    setGoogleLoading]    = useState(false);
  const [pendingCredential, setPendingCredential] = useState(null); // { credential, user, token }

  const redirectByRole = (role) => {
    if (from) { nav(from); return; }
    const map = { admin: '/admin', proprietaire: '/dashboard/proprietaire', locataire: '/dashboard/locataire' };
    nav(map[role] ?? '/');
  };

  // Connexion email/mot de passe
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      redirectByRole(user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  // Connexion Google
  const handleGoogleCredential = async (credentialResponse) => {
    const credential = credentialResponse?.credential;
    if (!credential) return;
    setGoogleLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/google', { credential, role: 'locataire' });
      if (data.data.is_new) {
        // Nouveau compte → demander le rôle avant de valider
        setPendingCredential({ credential, user: data.data.user, token: data.data.token });
      } else {
        loginWithData(data.data.token, data.data.user);
        redirectByRole(data.data.user.role);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur de connexion Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Confirmation du rôle pour les nouveaux utilisateurs Google
  const confirmRole = async (role) => {
    if (!pendingCredential) return;
    setGoogleLoading(true);
    try {
      // Recrée le compte avec le bon rôle
      const { data } = await api.post('/auth/google', {
        credential: pendingCredential.credential,
        role,
        forceRole: true,
      });
      loginWithData(data.data.token, data.data.user);
      setPendingCredential(null);
      redirectByRole(data.data.user.role);
    } catch (e) {
      // Utilise le token existant avec le rôle mis à jour localement
      const updatedUser = { ...pendingCredential.user, role };
      loginWithData(pendingCredential.token, updatedUser);
      setPendingCredential(null);
      redirectByRole(role);
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

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
            <p className="text-gray-500 mt-2">Accédez à votre espace LocaMaison</p>
          </div>

          {/* Bouton Google */}
          {googleLoading ? (
            <div className="flex justify-center py-3">
              <div className="w-6 h-6 border-2 border-[#1B5E20] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <GoogleAuthButton onCredential={handleGoogleCredential} buttonId="g-signin-btn" />
          )}

          {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">ou avec votre email</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
          )}

          {/* Formulaire email */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                     className="input" placeholder="votre@email.sn" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                     className="input" placeholder="••••••" required />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="#" className="text-sm text-[#1B5E20] hover:underline">Mot de passe oublié ?</a>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600 text-sm">
              Pas encore de compte ?{' '}
              <Link to="/inscription" className="text-[#1B5E20] font-semibold hover:underline">S'inscrire</Link>
            </p>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
            <p className="font-semibold mb-1">Comptes de test (mot de passe : <code>password</code>) :</p>
            <p>Admin : admin@locamaison.sn</p>
            <p>Propriétaire : oumar.diallo@test.sn</p>
            <p>Locataire : ibrahima.sow@test.sn</p>
          </div>
        </div>
      </div>

      {/* Modal choix de rôle — nouveaux utilisateurs Google */}
      {pendingCredential && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 text-center">
            <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👋</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Bienvenue, {pendingCredential.user.prenom} !
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Comment souhaitez-vous utiliser LocaMaison ?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => confirmRole('locataire')} disabled={googleLoading}
                      className="p-4 rounded-xl border-2 border-gray-200 hover:border-[#1B5E20] hover:bg-[#E8F5E9] transition-all disabled:opacity-50">
                <p className="text-2xl mb-1">🔍</p>
                <p className="font-semibold text-gray-900 text-sm">Je cherche un logement</p>
                <p className="text-xs text-gray-500 mt-0.5">Locataire</p>
              </button>
              <button onClick={() => confirmRole('proprietaire')} disabled={googleLoading}
                      className="p-4 rounded-xl border-2 border-gray-200 hover:border-[#1B5E20] hover:bg-[#E8F5E9] transition-all disabled:opacity-50">
                <p className="text-2xl mb-1">🔑</p>
                <p className="font-semibold text-gray-900 text-sm">Je loue mon bien</p>
                <p className="text-xs text-gray-500 mt-0.5">Propriétaire</p>
              </button>
            </div>
            {googleLoading && (
              <div className="mt-5 flex justify-center">
                <div className="w-5 h-5 border-2 border-[#1B5E20] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
