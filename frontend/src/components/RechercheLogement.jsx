import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../utils/api';
import LogementCard from './LogementCard';
import { formatFCFA } from '../utils/formatters';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const TYPES = ['appartement','maison','chambre','villa','studio'];

export default function RechercheLogement() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [regions,   setRegions]   = useState([]);
  const [villes,    setVilles]    = useState([]);
  const [quartiers, setQuartiers] = useState([]);
  const [logements, setLogements] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [vueMap,    setVueMap]    = useState(false);
  const [open,      setOpen]      = useState(false);
  const [page,      setPage]      = useState(1);
  const [pages,     setPages]     = useState(1);

  const [f, setF] = useState({
    region_id:   searchParams.get('region')   || '',
    ville_id:    searchParams.get('ville')    || '',
    quartier_id: '',
    type_sejour: searchParams.get('sejour')   || 'longue_duree',
    type:        '',
    meuble:      '',
    nb_chambres: '',
    prix_max:    '',
    sort:        'recent',
  });
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  const debounceRef = useRef(null);

  useEffect(() => { api.get('/regions').then(r => setRegions(r.data.data || [])); }, []);

  useEffect(() => {
    if (f.region_id) {
      api.get(`/villes?region_id=${f.region_id}`)
         .then(r => { setVilles(r.data.data || []); set('ville_id', ''); set('quartier_id', ''); });
    } else { setVilles([]); }
  }, [f.region_id]);

  useEffect(() => {
    if (f.ville_id) {
      api.get(`/quartiers?ville_id=${f.ville_id}`)
         .then(r => { setQuartiers(r.data.data || []); set('quartier_id', ''); });
    } else { setQuartiers([]); }
  }, [f.ville_id]);

  const doSearch = useCallback(async (filters, pg) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, v); });
      p.set('page', pg); p.set('limit', '9');
      const { data } = await api.get(`/logements?${p}`);
      setLogements(data.data ?? []);
      setTotal(data.pagination?.total ?? 0);
      setPages(data.pagination?.pages ?? 1);
    } catch { setLogements([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      doSearch(f, 1);
      const p = new URLSearchParams();
      if (f.region_id) p.set('region', f.region_id);
      if (f.ville_id)  p.set('ville',  f.ville_id);
      setSearchParams(p, { replace: true });
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [f, doSearch, setSearchParams]);

  useEffect(() => { doSearch(f, page); }, [page]);

  const reset = () => setF({ region_id:'', ville_id:'', quartier_id:'', type_sejour:'longue_duree', type:'', meuble:'', nb_chambres:'', prix_max:'', sort:'recent' });

  const prixMax   = f.type_sejour === 'courte_duree' ? 50000 : 500000;
  const villeName = villes.find(v => v.id == f.ville_id)?.nom;
  const hasFilters = f.type || f.meuble || f.nb_chambres || f.prix_max;

  return (
    <div className="space-y-5">
      {/* ── Barre principale ──────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Région</label>
            <select value={f.region_id} onChange={e => set('region_id', e.target.value)} className="input py-2.5 text-sm">
              <option value="">Toutes</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Ville</label>
            <select value={f.ville_id} onChange={e => set('ville_id', e.target.value)}
                    className="input py-2.5 text-sm" disabled={!villes.length}>
              <option value="">Toutes</option>
              {villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Quartier</label>
            <select value={f.quartier_id} onChange={e => set('quartier_id', e.target.value)}
                    className="input py-2.5 text-sm" disabled={!quartiers.length}>
              <option value="">Tous</option>
              {quartiers.map(q => <option key={q.id} value={q.id}>{q.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Durée</label>
            <select value={f.type_sejour} onChange={e => set('type_sejour', e.target.value)} className="input py-2.5 text-sm">
              <option value="longue_duree">Au mois</option>
              <option value="courte_duree">À la nuit</option>
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1 flex flex-col justify-end">
            <button
              onClick={() => setOpen(p => !p)}
              className={`input py-2.5 text-sm flex items-center justify-between gap-2 cursor-pointer
                ${open ? 'border-[#1B5E20] ring-2 ring-[#1B5E20]/20' : ''}
                ${hasFilters ? 'border-[#1B5E20] text-[#1B5E20]' : 'text-gray-600'}`}>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filtres
                {hasFilters && <span className="bg-[#1B5E20] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>}
              </span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                   fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filtres avancés */}
        {open && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up" style={{animationDuration:'0.2s'}}>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Type</label>
              <div className="flex flex-wrap gap-1.5">
                {['', ...TYPES].map(t => (
                  <button key={t} onClick={() => set('type', t)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer
                            ${f.type === t ? 'bg-[#1B5E20] text-white border-[#1B5E20]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B5E20]/50'}`}>
                    {t === '' ? 'Tous' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">
                Prix max — {f.prix_max ? formatFCFA(f.prix_max) : 'Sans limite'}
              </label>
              <input type="range" min="0" max={prixMax}
                     step={f.type_sejour === 'courte_duree' ? 2500 : 25000}
                     value={f.prix_max || prixMax}
                     onChange={e => set('prix_max', e.target.value === String(prixMax) ? '' : e.target.value)}
                     className="w-full h-2 appearance-none rounded-full bg-gray-200 cursor-pointer"
                     style={{accentColor:'#1B5E20'}} />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0</span>
                <span>{formatFCFA(prixMax)}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Meublé</label>
              <div className="flex gap-1.5">
                {[['','Tous'],['1','Oui'],['0','Non']].map(([v,l]) => (
                  <button key={v} onClick={() => set('meuble', v)}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer
                            ${f.meuble === v ? 'bg-[#1B5E20] text-white border-[#1B5E20]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B5E20]/50'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2">Chambres</label>
              <div className="flex gap-1.5">
                {['','1','2','3','4'].map(n => (
                  <button key={n} onClick={() => set('nb_chambres', n)}
                          className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer
                            ${f.nb_chambres === n ? 'bg-[#1B5E20] text-white border-[#1B5E20]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1B5E20]/50'}`}>
                    {n === '' ? 'Tous' : n === '4' ? '4+' : n}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-full flex justify-end">
              <button onClick={reset} className="flex items-center gap-1.5 text-sm text-[#1B5E20] hover:underline cursor-pointer font-medium">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Réinitialiser
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Header résultats ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-gray-600 text-sm">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[#1B5E20] border-t-transparent rounded-full animate-spin" />
              Recherche…
            </span>
          ) : (
            <>
              <span className="font-bold text-[#1B5E20] text-base">{total}</span>
              {' '}logement{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
              {villeName && <> à <span className="font-semibold">{villeName}</span></>}
            </>
          )}
        </p>
        <div className="flex items-center gap-2">
          <select value={f.sort} onChange={e => set('sort', e.target.value)}
                  className="input py-2 text-sm max-w-[180px]">
            <option value="recent">Récents</option>
            <option value="prix_asc">Prix croissant</option>
            <option value="prix_desc">Prix décroissant</option>
            <option value="note">Mieux notés</option>
          </select>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
            <button onClick={() => setVueMap(false)} aria-label="Vue liste"
                    className={`px-3 py-2 transition-colors cursor-pointer ${!vueMap ? 'bg-[#1B5E20] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button onClick={() => setVueMap(true)} aria-label="Vue carte"
                    className={`px-3 py-2 transition-colors cursor-pointer ${vueMap ? 'bg-[#1B5E20] text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Vue liste ─────────────────────────────────────────── */}
      {!vueMap && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({length: 6}).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <div className="skeleton h-48 rounded-none" />
                  <div className="p-4 space-y-3">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : logements.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">Aucun logement trouvé</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">Essayez d'élargir votre recherche ou choisissez une autre ville.</p>
              <button onClick={reset} className="btn-outline mt-4 text-sm py-2 px-4">Effacer les filtres</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {logements.map(l => <LogementCard key={l.id} logement={l} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {Array.from({length: Math.min(pages, 7)}, (_, i) => i+1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-colors cursor-pointer
                          ${p === page ? 'bg-[#1B5E20] text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 cursor-pointer transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Vue carte ────────────────────────────────────────── */}
      {vueMap && (
        <MapContainer center={[14.692778, -17.446667]} zoom={7}
                      style={{ height: '560px', width: '100%' }} className="rounded-2xl shadow-sm border border-gray-100">
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {logements.filter(l => l.latitude && l.longitude).map(l => (
            <Marker key={l.id} position={[parseFloat(l.latitude), parseFloat(l.longitude)]}>
              <Popup>
                <div className="min-w-[200px]">
                  <p className="font-semibold text-sm text-gray-900 mb-1">{l.titre}</p>
                  <p className="text-xs text-gray-500 mb-2">{l.ville_nom}</p>
                  <p className="text-[#1B5E20] font-bold text-sm">{formatFCFA(l.prix_par_mois)}/mois</p>
                  <a href={`/logements/${l.id}`}
                     className="block mt-2 text-center text-xs bg-[#1B5E20] text-white py-1.5 px-3 rounded-lg hover:bg-[#2E7D32] transition-colors">
                    Voir le logement
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}
