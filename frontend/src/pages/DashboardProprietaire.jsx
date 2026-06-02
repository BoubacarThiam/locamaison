import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { formatFCFA, formatDate, statutBadge } from '../utils/formatters';
import Navbar from '../components/Navbar';

const TABS = ['Tableau de bord', 'Mes annonces', 'Réservations', 'Messagerie'];

export default function DashboardProprietaire() {
  const { user } = useAuth();
  const [tab,          setTab]          = useState(0);
  const [stats,        setStats]        = useState(null);
  const [annonces,     setAnnonces]     = useState([]);
  const [reservations, setReservations] = useState([]);
  const [conversations, setConvs]       = useState([]);
  const [chatWith,     setChatWith]     = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [msgText,      setMsgText]      = useState('');
  const [loading,      setLoading]      = useState(true);

  const loadStats = () =>
    api.get('/proprietaire/dashboard').then(r => setStats(r.data.data));
  const loadAnnonces = () =>
    api.get('/proprietaire/annonces').then(r => setAnnonces(r.data.data || []));
  const loadReservations = () =>
    api.get('/proprietaire/reservations').then(r => setReservations(r.data.data || []));
  const loadConvs = () =>
    api.get('/proprietaire/messages').then(r => setConvs(r.data.data || []));

  useEffect(() => {
    Promise.all([loadStats(), loadAnnonces(), loadReservations(), loadConvs()])
           .finally(() => setLoading(false));
  }, []);

  const loadMessages = (uid) => {
    api.get(`/messages/${uid}`).then(r => setMessages(r.data.data || []));
    setChatWith(uid);
  };

  const sendMessage = async () => {
    if (!msgText.trim() || !chatWith) return;
    await api.post('/messages', { destinataire_id: chatWith, contenu: msgText });
    setMsgText('');
    loadMessages(chatWith);
  };

  const updateStatutRes = async (id, statut) => {
    await api.put(`/reservations/${id}/statut`, { statut });
    loadReservations();
  };

  const deleteAnnonce = async (id) => {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    await api.delete(`/logements/${id}`);
    loadAnnonces();
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Espace propriétaire</h1>
            <p className="text-gray-500">Bienvenue, {user?.prenom} {user?.nom}</p>
          </div>
          <Link to="/dashboard/proprietaire/annonce/nouvelle" className="btn-primary whitespace-nowrap">
            + Publier une annonce
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8 overflow-x-auto">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0
                      ${tab === i ? 'bg-white text-[#1B5E20] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-4 border-[#1B5E20] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* ── TABLEAU DE BORD ── */}
            {tab === 0 && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Revenus ce mois',     value: formatFCFA(stats.revenus_mois),        icon: '💰', color: 'text-[#1B5E20]' },
                    { label: 'Réservations actives', value: stats.reservations_actives,            icon: '📋', color: 'text-blue-600' },
                    { label: 'Annonces actives',     value: stats.annonces_actives,                icon: '🏠', color: 'text-purple-600' },
                    { label: 'Note moyenne',          value: `${parseFloat(stats.note_moyenne || 0).toFixed(1)}/5`, icon: '⭐', color: 'text-[#F9A825]' },
                  ].map(k => (
                    <div key={k.label} className="card p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-gray-500 text-sm">{k.label}</p>
                          <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
                        </div>
                        <span className="text-2xl">{k.icon}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* En attente */}
                {stats.en_attente > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <p className="font-semibold text-yellow-800">
                        {stats.en_attente} annonce{stats.en_attente > 1 ? 's' : ''} en attente de validation
                      </p>
                      <p className="text-yellow-700 text-sm">L'équipe LocaMaison vérifie votre annonce sous 48h.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── MES ANNONCES ── */}
            {tab === 1 && (
              <div>
                {annonces.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-5xl mb-4">🏠</p>
                    <p className="text-gray-500 mb-4">Vous n'avez pas encore d'annonce.</p>
                    <Link to="/dashboard/proprietaire/annonce/nouvelle" className="btn-primary">
                      Publier ma première annonce
                    </Link>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {['Logement','Ville','Prix/mois','Statut','Actions'].map(h => (
                            <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {annonces.map(a => {
                          const badgeMap = { actif: 'badge-actif', en_attente: 'badge-attente', inactif: 'badge-annule' };
                          const labelMap = { actif: 'Actif', en_attente: 'En attente', inactif: 'Inactif' };
                          return (
                            <tr key={a.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                    <img src={a.photo_principale || 'https://placehold.co/80/e2e8f0/94a3b8?text=P'}
                                         alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <span className="font-medium text-gray-900 line-clamp-1">{a.titre}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{a.ville_nom}</td>
                              <td className="px-4 py-3 font-medium text-[#1B5E20]">{formatFCFA(a.prix_par_mois)}</td>
                              <td className="px-4 py-3">
                                <span className={badgeMap[a.statut]}>{labelMap[a.statut]}</span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Link to={`/dashboard/proprietaire/annonce/${a.id}/edit`}
                                        className="text-[#1B5E20] hover:underline text-xs font-medium">
                                    Modifier
                                  </Link>
                                  <button onClick={() => deleteAnnonce(a.id)}
                                          className="text-red-500 hover:underline text-xs font-medium">
                                    Supprimer
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── RÉSERVATIONS ── */}
            {tab === 2 && (
              <div className="space-y-4">
                {reservations.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-5xl mb-4">📋</p>
                    <p className="text-gray-500">Aucune réservation pour le moment.</p>
                  </div>
                ) : reservations.map(res => {
                  const { label, cls } = statutBadge(res.statut);
                  return (
                    <div key={res.id} className="card p-5 flex flex-col sm:flex-row gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-11 h-11 bg-[#1B5E20] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {res.locataire_prenom?.[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900">{res.locataire_prenom} {res.locataire_nom}</p>
                          <p className="text-gray-500 text-sm truncate">{res.logement_titre}</p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            {formatDate(res.date_debut)} → {formatDate(res.date_fin)} · {formatFCFA(res.montant_total)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={cls}>{label}</span>
                        {res.statut === 'en_attente' && (
                          <>
                            <button onClick={() => updateStatutRes(res.id, 'confirmee')}
                                    className="text-xs bg-[#1B5E20] text-white px-3 py-1.5 rounded-lg hover:bg-[#2E7D32]">
                              Confirmer
                            </button>
                            <button onClick={() => updateStatutRes(res.id, 'annulee')}
                                    className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200">
                              Refuser
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── MESSAGERIE ── */}
            {tab === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-[500px]">
                {/* Liste conversations */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-semibold text-gray-800">Conversations</p>
                  </div>
                  {conversations.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm p-6">Aucune conversation</p>
                  ) : conversations.map(c => (
                    <button key={c.interlocuteur_id}
                            onClick={() => loadMessages(c.interlocuteur_id)}
                            className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors
                              ${chatWith === c.interlocuteur_id ? 'bg-[#E8F5E9]' : ''}`}>
                      <div className="w-9 h-9 bg-[#1B5E20] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {c.prenom?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{c.prenom} {c.nom}</p>
                        <p className="text-gray-500 text-xs truncate">{c.dernier_message}</p>
                      </div>
                      {c.non_lus > 0 && (
                        <span className="ml-auto bg-[#1B5E20] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {c.non_lus}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Fenêtre de chat */}
                <div className="sm:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                  {chatWith ? (
                    <>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map(m => (
                          <div key={m.id}
                               className={`flex ${m.expediteur_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm
                              ${m.expediteur_id === user?.id
                                ? 'bg-[#1B5E20] text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                              {m.contenu}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-100 p-3 flex gap-2">
                        <input value={msgText} onChange={e => setMsgText(e.target.value)}
                               onKeyDown={e => e.key === 'Enter' && sendMessage()}
                               className="input flex-1 py-2" placeholder="Écrire un message…" />
                        <button onClick={sendMessage} className="btn-primary px-4 py-2 text-sm">
                          Envoyer
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-gray-400">Sélectionnez une conversation</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
