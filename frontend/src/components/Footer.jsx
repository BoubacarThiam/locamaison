import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-gray-800">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-[#1B5E20] rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-[#F9A825]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
              <span className="text-white font-bold text-xl" style={{fontFamily:"'Cinzel',serif"}}>LocaMaison</span>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              La première plateforme immobilière du Sénégal — 14 régions, des milliers de logements.
            </p>
            <div className="flex gap-3">
              {[
                { label:'Facebook', icon:<path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/> },
                { label:'Instagram', icon:<><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></> },
              ].map(s => (
                <a key={s.label} href="#" aria-label={s.label}
                   className="w-9 h-9 bg-gray-800 hover:bg-[#1B5E20] rounded-xl flex items-center justify-center transition-colors duration-200 cursor-pointer">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">{s.icon}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              {[['/', 'Accueil'],['/logements','Rechercher'],['/inscription?role=proprietaire','Publier annonce'],['/connexion','Mon compte']].map(([to,label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-[#4CAF50] transition-colors cursor-pointer">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Régions */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Régions</h3>
            <ul className="space-y-2.5 text-sm">
              {['Dakar','Thiès','Saint-Louis','Ziguinchor','Kaolack'].map(r => (
                <li key={r}>
                  <Link to={`/logements?region_nom=${r}`} className="hover:text-[#4CAF50] transition-colors cursor-pointer">{r}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#4CAF50] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contact@locamaison.sn
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#4CAF50] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +221 77 000 00 00
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-[#4CAF50] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Dakar, Sénégal
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs">
          <p>© 2024 LocaMaison — Tous droits réservés</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-[#4CAF50] transition-colors cursor-pointer">Conditions générales</a>
            <a href="#" className="hover:text-[#4CAF50] transition-colors cursor-pointer">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
