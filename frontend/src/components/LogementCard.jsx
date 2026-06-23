import { Link } from 'react-router-dom';
import { formatFCFA, typeLabel } from '../utils/formatters';

const TYPE_COLORS = {
  appartement: 'bg-blue-500/90',
  villa:       'bg-purple-500/90',
  chambre:     'bg-orange-500/90',
  studio:      'bg-pink-500/90',
  maison:      'bg-teal-500/90',
};

export default function LogementCard({ logement, featured = false }) {
  const photo = logement.photo_principale
    || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop';
  const note = parseFloat(logement.note_moyenne || 0);
  const typeBg = TYPE_COLORS[logement.type] || 'bg-slate-500/90';

  return (
    <Link
      to={`/logements/${logement.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white focus:outline-none"
      style={{
        boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
        border: '1px solid rgba(226,232,240,1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(27,94,32,0.16), 0 2px 8px rgba(27,94,32,0.08)';
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.borderColor = 'rgba(27,94,32,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(226,232,240,1)';
      }}
      aria-label={`${logement.titre} — ${formatFCFA(logement.prix_par_mois)} par mois`}
    >
      {/* ── Photo ───────────────────────────────────────── */}
      <div className={`relative overflow-hidden flex-shrink-0 ${featured ? 'h-60' : 'h-52'}`}>
        <img
          src={photo}
          alt={logement.titre}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          style={{ transition: 'transform 0.7s cubic-bezier(0.16,1,0.3,1)' }}
        />

        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* ── Badges top-left ── */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`${typeBg} backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide`}>
            {typeLabel(logement.type)}
          </span>
          {logement.meuble == 1 && (
            <span className="bg-[#F9A825] text-gray-900 text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide">
              Meublé
            </span>
          )}
        </div>

        {/* ── Vérifié badge top-right ── */}
        {logement.is_verified == 1 && (
          <div className="absolute top-3 right-3 bg-[#1B5E20]/90 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Vérifié
          </div>
        )}

        {/* ── Prix + note au bas ── */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
          <div>
            {logement.prix_par_mois && (
              <div className="font-stat text-white font-bold text-xl leading-tight drop-shadow-sm">
                {formatFCFA(logement.prix_par_mois)}
                <span className="text-white/70 text-xs font-normal ml-0.5">/mois</span>
              </div>
            )}
            {logement.prix_par_nuit && (
              <div className="font-stat text-white/75 text-xs font-medium mt-0.5">
                {formatFCFA(logement.prix_par_nuit)}/nuit
              </div>
            )}
          </div>
          {note > 0 && (
            <div className="flex items-center gap-1.5 bg-black/35 backdrop-blur-sm rounded-full px-2.5 py-1.5">
              <svg className="w-3.5 h-3.5 text-[#F9A825]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="font-stat text-white text-xs font-semibold">{note.toFixed(1)}</span>
              {logement.nb_avis > 0 && (
                <span className="text-white/65 text-[10px]">({logement.nb_avis})</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Infos ───────────────────────────────────────── */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">

        {/* Titre */}
        <h3
          className="font-semibold text-slate-900 line-clamp-1 text-[15px] leading-snug"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            transition: 'color 0.2s',
          }}>
          {logement.titre}
        </h3>

        {/* Localisation */}
        <p className="text-slate-500 text-sm flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[#1B5E20] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate leading-tight">
            {logement.quartier_nom
              ? <>{logement.quartier_nom}, <span className="font-medium text-slate-600">{logement.ville_nom}</span></>
              : <span className="font-medium text-slate-600">{logement.ville_nom}</span>
            }
          </span>
        </p>

        {/* Séparateur + Détails */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-4">
          <DetailChip icon={
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          } label={`${logement.nb_chambres} ch.`} />
          {logement.nb_salles_bain > 0 && (
            <DetailChip icon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            } label={`${logement.nb_salles_bain} sdb`} />
          )}
          {logement.superficie_m2 && (
            <DetailChip icon={
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            } label={`${logement.superficie_m2}m²`} />
          )}
          {/* Proprio */}
          {logement.proprio_prenom && (
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#1B5E20] to-[#4CAF50] flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                {logement.proprio_prenom[0]?.toUpperCase()}
              </div>
              <span className="text-[11px] text-slate-400 font-medium truncate max-w-[60px]">
                {logement.proprio_prenom}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function DetailChip({ icon, label }) {
  return (
    <span className="flex items-center gap-1 text-slate-400 text-xs font-medium">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">{icon}</svg>
      {label}
    </span>
  );
}
