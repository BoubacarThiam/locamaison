import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{ background: 'linear-gradient(135deg, #0A1F0C 0%, #0F2D13 50%, #0A1F0C 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ background: 'linear-gradient(135deg, #1B5E20, #2E7D32)', boxShadow: '0 4px 12px rgba(27,94,32,0.4)' }}>
                <svg className="w-5 h-5 text-[#F9A825]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
              <span className="text-white font-bold text-xl" style={{ fontFamily: "'Cinzel',serif" }}>
                LocaMaison
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              La première plateforme immobilière du Sénégal. 14 régions, des milliers de logements.
            </p>
            {/* Paiements */}
            <div className="flex items-center gap-2 mb-5">
              {['Wave', 'OM', 'CB'].map(m => (
                <div key={m} className="px-2.5 py-1 rounded-lg text-xs font-bold text-white/60"
                     style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {m}
                </div>
              ))}
            </div>
            {/* Socials */}
            <div className="flex gap-2.5">
              {[
                { label: 'Facebook',  icon: <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/> },
                { label: 'Instagram', icon: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></> },
                { label: 'Twitter',   icon: <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/> },
              ].map(s => (
                <a key={s.label} href="#" aria-label={s.label}
                   className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer"
                   style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                   onMouseEnter={e => { e.currentTarget.style.background = 'rgba(27,94,32,0.5)'; e.currentTarget.style.borderColor = 'rgba(27,94,32,0.6)'; }}
                   onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                       style={{ color: 'rgba(255,255,255,0.55)' }}>{s.icon}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-5"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: '0.12em' }}>
              Navigation
            </h3>
            <ul className="space-y-3">
              {[
                ['/', 'Accueil'],
                ['/logements', 'Rechercher'],
                ['/inscription?role=proprietaire', 'Publier une annonce'],
                ['/connexion', 'Mon compte'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to}
                        className="text-sm transition-colors duration-200 cursor-pointer flex items-center gap-1.5 group"
                        style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                        onMouseEnter={e => e.currentTarget.style.color = '#4CAF50'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200 text-[#4CAF50]">→</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Régions */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-5"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: '0.12em' }}>
              Régions
            </h3>
            <ul className="space-y-3">
              {['Dakar', 'Thiès', 'Saint-Louis', 'Ziguinchor', 'Kaolack', 'Mbour'].map(r => (
                <li key={r}>
                  <Link to={`/logements`}
                        className="text-sm transition-colors duration-200 cursor-pointer flex items-center gap-1.5 group"
                        style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                        onMouseEnter={e => e.currentTarget.style.color = '#4CAF50'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                    <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-200 text-[#4CAF50]">→</span>
                    {r}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-5"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: '0.12em' }}>
              Contact
            </h3>
            <ul className="space-y-3.5">
              {[
                { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />, text: 'contact@locamaison.sn' },
                { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />, text: '+221 77 000 00 00' },
                { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />, text: 'Dakar, Sénégal' },
              ].map((c, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                       style={{ background: 'rgba(27,94,32,0.25)', border: '1px solid rgba(27,94,32,0.4)' }}>
                    <svg className="w-3.5 h-3.5 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {c.icon}
                    </svg>
                  </div>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                    {c.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            © 2026 LocaMaison — Plateforme immobilière du Sénégal
          </p>
          <div className="flex gap-6">
            {['Conditions générales', 'Confidentialité', 'Cookies'].map(l => (
              <a key={l} href="#"
                 className="text-xs transition-colors duration-200 cursor-pointer"
                 style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                 onMouseEnter={e => e.currentTarget.style.color = '#4CAF50'}
                 onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
