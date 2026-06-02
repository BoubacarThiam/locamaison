import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled,     setScrolled]     = useState(false);
  const nav = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => { logout(); nav('/'); };

  const dashLink = user?.role === 'admin'
    ? '/admin'
    : user?.role === 'proprietaire'
      ? '/dashboard/proprietaire'
      : '/dashboard/locataire';

  const navBg = isHome && !scrolled
    ? 'bg-transparent'
    : 'bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm';

  const textColor = isHome && !scrolled ? 'text-white' : 'text-gray-700';
  const logoColor = isHome && !scrolled ? 'text-white' : 'text-[#1B5E20]';

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-[#1B5E20] rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-5 h-5 text-[#F9A825]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <span className={`font-bold text-xl tracking-tight transition-colors duration-300 ${logoColor}`}
                  style={{fontFamily:"'Cinzel',serif"}}>
              LocaMaison
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/',         label: 'Accueil' },
              { to: '/logements', label: 'Rechercher' },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer
                      ${location.pathname === to
                        ? 'bg-[#1B5E20]/10 text-[#1B5E20]'
                        : `${textColor} hover:bg-white/20 hover:text-[#1B5E20]`}`}>
                {label}
              </Link>
            ))}
          </div>

          {/* Auth area */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(p => !p)}
                  aria-label="Menu utilisateur"
                  className="flex items-center gap-2.5 bg-white border border-gray-200 hover:border-[#1B5E20]/30 hover:shadow-md px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer">
                  <div className="w-7 h-7 bg-gradient-to-br from-[#1B5E20] to-[#4CAF50] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {user?.prenom?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium text-sm">{user?.prenom}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                       fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up"
                       style={{animationDuration:'0.15s'}}>
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="font-semibold text-gray-900 text-sm">{user?.prenom} {user?.nom}</p>
                      <p className="text-gray-400 text-xs capitalize">{user?.role}</p>
                    </div>
                    <Link to={dashLink}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50 text-sm cursor-pointer transition-colors">
                      <svg className="w-4 h-4 text-[#1B5E20]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Mon espace
                    </Link>
                    {user?.role === 'proprietaire' && (
                      <Link to="/dashboard/proprietaire/annonce/nouvelle"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-gray-700 hover:bg-gray-50 text-sm cursor-pointer transition-colors">
                        <svg className="w-4 h-4 text-[#F9A825]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Publier une annonce
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-red-500 hover:bg-red-50 text-sm cursor-pointer transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/connexion"
                      className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${textColor} hover:bg-white/20`}>
                  Connexion
                </Link>
                <Link to="/inscription"
                      className="btn-accent py-2 px-5 text-sm rounded-xl">
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger mobile */}
          <button
            aria-label="Menu"
            className={`md:hidden p-2 rounded-xl transition-colors duration-200 cursor-pointer ${isHome && !scrolled ? 'text-white hover:bg-white/20' : 'text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setMenuOpen(p => !p)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 shadow-lg">
          <Link to="/"           className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium cursor-pointer">Accueil</Link>
          <Link to="/logements"  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium cursor-pointer">Rechercher</Link>
          {isAuthenticated ? (
            <>
              <Link to={dashLink} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium cursor-pointer">Mon espace</Link>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium cursor-pointer">Déconnexion</button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/connexion"   className="btn-outline py-3 text-center w-full">Connexion</Link>
              <Link to="/inscription" className="btn-accent py-3 text-center w-full">S'inscrire</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
