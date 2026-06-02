import { Link } from 'react-router-dom';
import { formatFCFA, renderStars, typeLabel } from '../utils/formatters';

export default function LogementCard({ logement, featured = false }) {
  const stars  = renderStars(logement.note_moyenne ?? 0);
  const photo  = logement.photo_principale
    || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop';

  return (
    <Link
      to={`/logements/${logement.id}`}
      className="card group flex flex-col overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/40"
      aria-label={`${logement.titre} — ${formatFCFA(logement.prix_par_mois)} par mois`}
    >
      {/* ── Photo ────────────────────────────────────────────── */}
      <div className={`relative overflow-hidden flex-shrink-0 ${featured ? 'h-56' : 'h-48'}`}>
        <img
          src={photo}
          alt={logement.titre}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-white/95 backdrop-blur-sm text-[#1B5E20] text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
            {typeLabel(logement.type)}
          </span>
          {logement.meuble == 1 && (
            <span className="bg-[#F9A825]/95 backdrop-blur-sm text-gray-900 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
              Meublé
            </span>
          )}
        </div>

        {/* Vérifié badge */}
        {logement.is_verified == 1 && (
          <div className="absolute top-3 right-3 bg-[#1B5E20] text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Vérifié
          </div>
        )}

        {/* Prix en bas de l'image */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-end justify-between">
            <div>
              {logement.prix_par_mois && (
                <div className="text-white font-bold text-lg drop-shadow-md leading-tight">
                  {formatFCFA(logement.prix_par_mois)}
                  <span className="text-white/80 text-xs font-normal">/mois</span>
                </div>
              )}
              {logement.prix_par_nuit && (
                <div className="text-white/80 text-xs">
                  {formatFCFA(logement.prix_par_nuit)}/nuit
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
              <svg className="w-3.5 h-3.5 text-[#F9A825]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="text-white text-xs font-semibold">
                {parseFloat(logement.note_moyenne || 0).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Infos ─────────────────────────────────────────────── */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-[#1B5E20] transition-colors duration-200 text-base">
          {logement.titre}
        </h3>

        <p className="text-gray-500 text-sm flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[#1B5E20] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">
            {logement.quartier_nom ? `${logement.quartier_nom}, ` : ''}{logement.ville_nom}
          </span>
        </p>

        {/* Détails */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-50">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {logement.nb_chambres} ch.
          </span>
          {logement.superficie_m2 && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              {logement.superficie_m2} m²
            </span>
          )}
          {logement.nb_avis > 0 && (
            <span className="ml-auto text-[#1B5E20] font-medium">
              {logement.nb_avis} avis
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
