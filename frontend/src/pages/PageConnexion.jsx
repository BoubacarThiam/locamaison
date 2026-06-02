import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PageConnexion() {
  const { login } = useAuth();
  const nav      = useNavigate();
  const location = useLocation();
  const from     = location.state?.from?.pathname || null;

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const redirectByRole = (role) => {
    if (from) { nav(from); return; }
    const map = { admin: '/admin', proprietaire: '/dashboard/proprietaire', locataire: '/dashboard/locataire' };
    nav(map[role] ?? '/');
  };

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header simplifié */}
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
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                {error}
              </div>
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
              <Link to="/inscription" className="text-[#1B5E20] font-semibold hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>

          {/* Comptes test */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500">
            <p className="font-semibold mb-1">Comptes de test (mot de passe : <code>password</code>) :</p>
            <p>Admin : admin@locamaison.sn</p>
            <p>Propriétaire : oumar.diallo@test.sn</p>
            <p>Locataire : ibrahima.sow@test.sn</p>
          </div>
        </div>
      </div>
    </div>
  );
}
