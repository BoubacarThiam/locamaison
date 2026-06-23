import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import LogementCard from '../components/LogementCard';

const REGIONS_ICONS = {
  'Dakar': '🏙️', 'Thiès': '🏘️', 'Saint-Louis': '⛵', 'Ziguinchor': '🌿',
  'Kaolack': '🌾', 'Diourbel': '🕌', 'Louga': '🌵', 'Fatick': '🐚',
  'Kolda': '🌳', 'Matam': '🏔️', 'Tambacounda': '🦁', 'Kaffrine': '☀️',
  'Sédhiou': '🌊', 'Kédougou': '⛰️',
};

export default function PageAccueil() {
  const [regions,    setRegions]    = useState([]);
  const [populaires, setPopulaires] = useState([]);
  const [regionId,   setRegionId]   = useState('');
  const [villeId,    setVilleId]    = useState('');
  const [villes,     setVilles]     = useState([]);
  const [sejour,     setSejour]     = useState('longue_duree');
  const [regStats,   setRegStats]   = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api.get('/regions').then(r => setRegions(r.data.data || []));
    api.get('/logements?sort=note&limit=6').then(r => setPopulaires(r.data.data || []));
  }, []);

  useEffect(() => {
    if (regionId) {
      api.get(`/villes?region_id=${regionId}`).then(r => { setVilles(r.data.data || []); setVilleId(''); });
    }
  }, [regionId]);

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (regionId) p.set('region', regionId);
    if (villeId)  p.set('ville', villeId);
    p.set('sejour', sejour);
    nav(`/logements?${p}`);
  };

  return (
    <div className="overflow-x-hidden">
      {/* ═══════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1529408686214-b48b8532f72c?w=1800&auto=format&fit=crop&q=80"
            alt="Dakar vue aérienne"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A2E0D]/70 via-[#1B5E20]/50 to-[#0A2E0D]/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-medium px-4 py-2 rounded-full mb-6 animate-fade-in-up">
            <span className="w-2 h-2 bg-[#F9A825] rounded-full animate-pulse" />
            +1 200 logements dans 14 régions du Sénégal
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up"
              style={{fontFamily:"'Cinzel',serif", lineHeight: 1.15}}>
            Trouvez votre<br />
            <span className="text-[#F9A825]">logement idéal</span><br />
            au Sénégal
          </h1>
          <p className="text-white/80 text-lg sm:text-xl mb-10 max-w-2xl mx-auto animate-fade-in-up-delay leading-relaxed">
            De Dakar à Ziguinchor, découvrez des milliers d'appartements,<br className="hidden sm:block" />
            maisons et villas à louer partout au Sénégal.
          </p>

          {/* Search card */}
          <form onSubmit={handleSearch}
                className="glass-card p-4 sm:p-5 mx-auto max-w-3xl animate-fade-in-up-delay">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 mb-1 text-left">Région</label>
                <select value={regionId} onChange={e => setRegionId(e.target.value)} className="input py-2.5 text-sm">
                  <option value="">Toutes</option>
                  {regions.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 text-left">Ville</label>
                <select value={villeId} onChange={e => setVilleId(e.target.value)}
                        className="input py-2.5 text-sm" disabled={!villes.length}>
                  <option value="">Toutes</option>
                  {villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 text-left">Durée</label>
                <select value={sejour} onChange={e => setSejour(e.target.value)} className="input py-2.5 text-sm">
                  <option value="longue_duree">Au mois</option>
                  <option value="courte_duree">À la nuit</option>
                </select>
              </div>
              <div className="flex flex-col justify-end">
                <button type="submit" className="btn-accent w-full py-2.5 text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Rechercher
                </button>
              </div>
            </div>
          </form>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-10 animate-fade-in-up-delay">
            {[
              { value: '1 200+', label: 'Logements' },
              { value: '14',     label: 'Régions' },
              { value: '4 800+', label: 'Locataires' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white" style={{fontFamily:"'Cinzel',serif"}}>{s.value}</div>
                <div className="text-white/60 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-3 bg-white/70 rounded-full" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          EXPLORER PAR RÉGION
      ═══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-10">
          <p className="text-[#1B5E20] font-semibold text-sm uppercase tracking-widest mb-2">Destinations</p>
          <h2 className="section-title">Explorer par région</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {regions.map((r, i) => (
            <button
              key={r.id}
              onClick={() => nav(`/logements?region=${r.id}`)}
              className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-[#1B5E20]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              style={{animationDelay: `${i * 0.04}s`}}
            >
              <div className="w-11 h-11 bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] group-hover:from-[#1B5E20] group-hover:to-[#4CAF50] rounded-xl flex items-center justify-center transition-all duration-200">
                <svg className="w-5 h-5 text-[#1B5E20] group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-700 text-center leading-tight">{r.nom}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          LOGEMENTS POPULAIRES
      ═══════════════════════════════════════════════════ */}
      {populaires.length > 0 && (
        <section className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#1B5E20] font-semibold text-sm uppercase tracking-widest mb-2">Top logements</p>
                <h2 className="section-title">Les mieux notés</h2>
              </div>
              <button onClick={() => nav('/logements?sort=note')}
                      className="btn-ghost text-sm hidden sm:flex">
                Voir tout
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {populaires.map((l, i) => (
                <div key={l.id} className="animate-fade-in-up" style={{animationDelay: `${i * 0.08}s`}}>
                  <LogementCard logement={l} featured={i === 0} />
                </div>
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <button onClick={() => nav('/logements?sort=note')} className="btn-outline">
                Voir tous les logements
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          COMMENT ÇA MARCHE
      ═══════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <p className="text-[#1B5E20] font-semibold text-sm uppercase tracking-widest mb-2">Simple & Rapide</p>
          <h2 className="section-title">Comment ça marche ?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
          {/* Ligne connecteur desktop */}
          <div className="hidden sm:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-[#1B5E20]/20 via-[#1B5E20]/40 to-[#1B5E20]/20" />

          {[
            { num:'01', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />, title:'Chercher', desc:'Parcourez des centaines d\'annonces par région, ville et filtrez selon vos critères.' },
            { num:'02', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />, title:'Réserver', desc:'Sélectionnez vos dates, type de séjour et réservez en quelques secondes.' },
            { num:'03', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />, title:'Emménager', desc:'Payez via Wave ou Orange Money et emménagez en toute sécurité.' },
          ].map((step, i) => (
            <div key={step.num} className="relative flex flex-col items-center text-center p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="absolute -top-4 left-6 bg-[#1B5E20] text-white text-xs font-bold px-3 py-1 rounded-full">
                {step.num}
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-2xl flex items-center justify-center mb-4 mt-2">
                <svg className="w-8 h-8 text-[#1B5E20]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {step.icon}
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA PROPRIÉTAIRES
      ═══════════════════════════════════════════════════ */}
      <section className="mx-4 sm:mx-6 lg:mx-8 mb-16 max-w-7xl lg:mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#1B5E20] p-8 sm:p-12">
          {/* Décorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F9A825]/10 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <svg className="w-3.5 h-3.5 text-[#F9A825]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                4.8/5 sur 2 000+ propriétaires
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{fontFamily:"'Cinzel',serif"}}>
                Vous êtes propriétaire ?
              </h2>
              <p className="text-white/75 text-base leading-relaxed max-w-md">
                Publiez gratuitement vos annonces et touchez des milliers de locataires.
                Paiement sécurisé via Wave et Orange Money.
              </p>
            </div>
            <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3">
              <button onClick={() => nav('/inscription?role=proprietaire')}
                      className="bg-[#F9A825] hover:bg-[#FDD835] text-gray-900 font-bold px-7 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer whitespace-nowrap">
                Publier gratuitement
              </button>
              <button onClick={() => nav('/connexion')}
                      className="bg-white/15 hover:bg-white/25 text-white font-semibold px-7 py-3.5 rounded-xl border border-white/30 transition-all duration-200 cursor-pointer whitespace-nowrap">
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
