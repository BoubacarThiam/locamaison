import { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatFCFA, formatDate } from '../utils/formatters';
import Navbar from '../components/Navbar';

const TABS = ['Statistiques', 'Valider annonces', 'Utilisateurs', 'Avis', 'Stats régions'];

export default function DashboardAdmin() {
  const [tab,       setTab]       = useState(0);
  const [stats,     setStats]     = useState(null);
  const [logements, setLogements] = useState([]);
  const [users,     setUsers]     = useState([]);
  const [avis,      setAvis]      = useState([]);
  const [regions,   setRegions]   = useState([]);
  const [logPage,   setLogPage]   = useState(1);
  const [logTotal,  setLogTotal]  = useState(0);
  const [userRole,  setUserRole]  = useState('');
  const [rejectModal, setRejectModal] = useState(null);
  const [motifRejet,  setMotifRejet]  = useState('');
  const [loading,   setLoading]   = useState(false);

  const loadStats = () => api.get('/admin/stats').then(r => setStats(r.data.data));
  const loadLogements = (page = 1) => {
    api.get(`/admin/logements?statut=en_attente&page=${page}`)
       .then(r => { setLogements(r.data.data || []); setLogTotal(r.data.pagination?.total || 0); });
  };
  const loadUsers = (role = '') => {
    const q = role ? `?role=${role}` : '';
    api.get(`/admin/users${q}`).then(r => setUsers(r.data.data || []));
  };
  const loadAvis  = () => api.get('/admin/avis').then(r => setAvis(r.data.data || []));
  const loadStats2 = () => api.get('/admin/stats-regions').then(r => setRegions(r.data.data || []));

  useEffect(() => { loadStats(); }, []);
  useEffect(() => { if (tab === 1) loadLogements(logPage); }, [tab, logPage]);
  useEffect(() => { if (tab === 2) loadUsers(userRole); }, [tab, userRole]);
  useEffect(() => { if (tab === 3) loadAvis(); }, [tab]);
  useEffect(() => { if (tab === 4) loadStats2(); }, [tab]);

  const valider = async (id, statut, motif = null) => {
    setLoading(true);
    try {
      await api.put(`/admin/logements/${id}/valider`, { statut, motif_rejet: motif });
      setRejectModal(null);
      setMotifRejet('');
      loadLogements(logPage);
      loadStats();
    } finally { setLoading(false); }
  };

  const toggleUser = async (id, actif) => {
    await api.put(`/admin/users/${id}/statut`, { actif });
    loadUsers(userRole);
  };

  const verifyUser = async (id, verified) => {
    await api.put(`/admin/users/${id}/statut`, { is_verified: verified });
    loadUsers(userRole);
  };

  const deleteAvis = async (id) => {
    if (!window.confirm('Supprimer cet avis ?')) return;
    await api.delete(`/admin/avis/${id}`);
    loadAvis();
  };

  const exportCSV = () => {
    const headers = ['Région','Annonces actives','Réservations','Revenus total','Prix moyen'];
    const rows    = regions.map(r => [
      r.region, r.nb_annonces, r.nb_reservations,
      r.revenus_total, r.prix_moyen,
    ]);
    const csv     = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob    = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href = url; a.download = 'stats-regions-locamaison.csv'; a.click();
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Panneau d'administration</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 overflow-x-auto">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                      ${tab === i ? 'bg-white text-[#1B5E20] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              {t}
              {i === 1 && logTotal > 0 && (
                <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{logTotal}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── STATISTIQUES ── */}
        {tab === 0 && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Logements actifs',   value: stats.logements_actifs,       color: 'text-[#1B5E20]' },
                { label: 'En attente',          value: stats.logements_en_attente,   color: 'text-yellow-600' },
                { label: 'Réservations mois',   value: stats.total_reservations,     color: 'text-blue-600' },
                { label: 'Revenus ce mois',     value: formatFCFA(stats.revenus_mois), color: 'text-[#1B5E20]' },
                { label: 'Locataires inscrits', value: stats.nb_locataires,          color: 'text-purple-600' },
              ].map(k => (
                <div key={k.label} className="card p-5">
                  <p className="text-gray-500 text-xs">{k.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Top régions */}
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-4">Top régions par annonces</h2>
              <div className="space-y-3">
                {(stats.logements_par_region || []).slice(0, 5).map((r, i) => {
                  const max = stats.logements_par_region[0]?.nb_annonces || 1;
                  return (
                    <div key={r.id} className="flex items-center gap-3">
                      <span className="text-gray-500 text-sm w-4">{i + 1}</span>
                      <span className="text-gray-800 text-sm w-32 flex-shrink-0">{r.nom}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-[#1B5E20] h-2 rounded-full transition-all"
                             style={{ width: `${(r.nb_annonces / max) * 100}%` }} />
                      </div>
                      <span className="text-gray-600 text-sm w-8 text-right">{r.nb_annonces}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── VALIDER ANNONCES ── */}
        {tab === 1 && (
          <div>
            {logements.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <p className="text-4xl mb-4">✅</p>
                <p className="text-gray-500">Toutes les annonces ont été traitées.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Logement','Propriétaire','Ville','Type','Prix/mois','Date','Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logements.map(l => (
                      <tr key={l.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={l.photo_principale || 'https://placehold.co/80/e2e8f0/94a3b8?text=P'}
                                   alt="" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-medium text-gray-900 line-clamp-1 max-w-[160px]">{l.titre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{l.proprio_prenom} {l.proprio_nom}</td>
                        <td className="px-4 py-3 text-gray-600">{l.ville_nom}, {l.region_nom}</td>
                        <td className="px-4 py-3 text-gray-600 capitalize">{l.type}</td>
                        <td className="px-4 py-3 font-medium text-[#1B5E20]">{formatFCFA(l.prix_par_mois)}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(l.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => valider(l.id, 'actif')} disabled={loading}
                                    className="text-xs bg-[#1B5E20] text-white px-3 py-1.5 rounded-lg hover:bg-[#2E7D32]">
                              Valider
                            </button>
                            <button onClick={() => { setRejectModal(l); setMotifRejet(''); }}
                                    className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200">
                              Rejeter
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── UTILISATEURS ── */}
        {tab === 2 && (
          <div>
            <div className="flex gap-3 mb-4">
              {['', 'locataire', 'proprietaire'].map(r => (
                <button key={r} onClick={() => setUserRole(r)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                          ${userRole === r ? 'bg-[#1B5E20] text-white border-[#1B5E20]' : 'border-gray-200 text-gray-600 hover:border-[#1B5E20]'}`}>
                  {r === '' ? 'Tous' : r === 'locataire' ? 'Locataires' : 'Propriétaires'}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Utilisateur','Email','Rôle','Inscrit le','Statut','Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#1B5E20] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {u.prenom?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium">{u.prenom} {u.nom}</span>
                          {u.is_verified == 1 && <span className="text-green-600 text-xs">✓</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full
                          ${u.role === 'admin' ? 'bg-purple-100 text-purple-700'
                            : u.role === 'proprietaire' ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.created_at)}</td>
                      <td className="px-4 py-3">
                        <span className={u.is_active ? 'badge-actif' : 'badge-annule'}>
                          {u.is_active ? 'Actif' : 'Banni'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.role !== 'admin' && (
                          <div className="flex gap-2">
                            <button onClick={() => verifyUser(u.id, !u.is_verified)}
                                    className="text-xs text-[#1B5E20] hover:underline">
                              {u.is_verified ? 'Retirer vérif.' : 'Vérifier'}
                            </button>
                            <button onClick={() => toggleUser(u.id, !u.is_active)}
                                    className={`text-xs ${u.is_active ? 'text-red-500 hover:underline' : 'text-green-600 hover:underline'}`}>
                              {u.is_active ? 'Bannir' : 'Réactiver'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── AVIS ── */}
        {tab === 3 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Auteur','Logement','Note','Commentaire','Date','Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {avis.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{a.prenom} {a.nom}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{a.logement_titre}</td>
                    <td className="px-4 py-3 text-[#F9A825] font-bold">{'★'.repeat(a.note)}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{a.commentaire}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(a.created_at)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteAvis(a.id)}
                              className="text-xs text-red-500 hover:underline">
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── STATS RÉGIONS ── */}
        {tab === 4 && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={exportCSV} className="btn-outline py-2 px-4 text-sm">
                ⬇ Exporter CSV
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Région','Annonces actives','Réservations','Revenus total','Prix moyen'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {regions.map(r => (
                    <tr key={r.region} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{r.region}</td>
                      <td className="px-4 py-3 text-gray-600">{r.nb_annonces}</td>
                      <td className="px-4 py-3 text-gray-600">{r.nb_reservations}</td>
                      <td className="px-4 py-3 font-medium text-[#1B5E20]">{formatFCFA(r.revenus_total)}</td>
                      <td className="px-4 py-3 text-gray-600">{formatFCFA(Math.round(r.prix_moyen))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal rejet */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Motif de rejet</h3>
            <p className="text-sm text-gray-600 mb-3">
              <strong>{rejectModal.titre}</strong> — {rejectModal.proprio_prenom} {rejectModal.proprio_nom}
            </p>
            <textarea value={motifRejet} onChange={e => setMotifRejet(e.target.value)}
                      className="input h-24 resize-none"
                      placeholder="Expliquez pourquoi l'annonce est rejetée…" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => valider(rejectModal.id, 'inactif', motifRejet)}
                      disabled={!motifRejet.trim() || loading}
                      className="btn-primary flex-1">
                Confirmer le rejet
              </button>
              <button onClick={() => setRejectModal(null)}
                      className="btn-outline flex-1">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
