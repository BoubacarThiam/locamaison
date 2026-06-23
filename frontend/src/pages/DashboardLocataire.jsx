import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { formatFCFA, formatDate, statutBadge } from '../utils/formatters';
import Navbar from '../components/Navbar';

const TABS = ['Mes réservations', 'Messagerie'];

export default function DashboardLocataire() {
  const { user } = useAuth();
  const [tab,          setTab]         = useState(0);
  const [reservations, setReservations]= useState([]);
  const [loading,      setLoading]     = useState(true);
  const [avisForm,     setAvisForm]    = useState(null);
  const [avisNote,     setAvisNote]    = useState(5);
  const [avisComm,     setAvisComm]    = useState('');
  const [avisLoading,  setAvisLoading] = useState(false);

  // Messagerie
  const [conversations, setConvs]      = useState([]);
  const [chatWith,      setChatWith]   = useState(null);
  const [messages,      setMessages]   = useState([]);
  const [msgText,       setMsgText]    = useState('');
  const [convLoading,   setConvLoading]= useState(false);

  const loadReservations = () =>
    api.get('/locataire/reservations')
       .then(r => setReservations(r.data.data || []))
       .finally(() => setLoading(false));

  const loadConvs = () => {
    setConvLoading(true);
    api.get('/locataire/messages')
       .then(r => {
         // Regroupe par interlocuteur
         const map = {};
         (r.data.data || []).forEach(m => {
           const otherId = m.expediteur_id === user?.id ? m.destinataire_id : m.expediteur_id;
           if (!map[otherId]) map[otherId] = { interlocuteur_id: otherId, nom: m.nom, prenom: m.prenom, dernier_message: m.contenu, created_at: m.created_at, non_lus: 0 };
           if (!m.lu && m.destinataire_id === user?.id) map[otherId].non_lus++;
         });
         setConvs(Object.values(map));
       })
       .finally(() => setConvLoading(false));
  };

  useEffect(() => { loadReservations(); }, []);
  useEffect(() => { if (tab === 1) loadConvs(); }, [tab]);

  const loadMessages = (uid) => {
    api.get(`/messages/${uid}`).then(r => setMessages(r.data.data || []));
    api.put(`/messages/lu/${uid}`).catch(() => {});
    setChatWith(uid);
  };

  const sendMessage = async () => {
    if (!msgText.trim() || !chatWith) return;
    await api.post('/messages', { destinataire_id: chatWith, contenu: msgText });
    setMsgText('');
    loadMessages(chatWith);
  };

  const submitAvis = async (res) => {
    setAvisLoading(true);
    try {
      await api.post('/avis', {
        logement_id: res.logement_id, reservation_id: res.id,
        note: avisNote, commentaire: avisComm,
      });
      setAvisForm(null);
      loadReservations();
    } catch (e) {
      alert(e.response?.data?.message || 'Erreur lors de l\'envoi de l\'avis');
    } finally {
      setAvisLoading(false);
    }
  };

  const total   = reservations.length;
  const actives = reservations.filter(r => r.statut === 'confirmee').length;
  const unreadConvs = conversations.filter(c => c.non_lus > 0).length;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bonjour, {user?.prenom} 👋</h1>
        <p className="text-gray-500 mb-8">Gérez vos locations depuis votre espace personnel.</p>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Réservations',     value: total,   icon: '📋' },
            { label: 'En cours',         value: actives, icon: '🟢' },
            { label: 'Régions visitées', value: new Set(reservations.map(r => r.ville_nom)).size, icon: '📍' },
          ].map(k => (
            <div key={k.label} className="card p-5 text-center">
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className="text-2xl font-bold text-[#1B5E20]">{k.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8">
          {TABS.map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
                    className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-colors flex-1
                      ${tab === i ? 'bg-white text-[#1B5E20] shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
              {t}
              {i === 1 && unreadConvs > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadConvs}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB 0 : Réservations ── */}
        {tab === 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Mes réservations</h2>
              <Link to="/logements" className="text-sm text-[#1B5E20] hover:underline font-medium">
                + Nouvelle recherche
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div className="w-8 h-8 border-4 border-[#1B5E20] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                <p className="text-5xl mb-4">🏠</p>
                <p className="text-gray-500">Vous n'avez pas encore de réservation.</p>
                <Link to="/logements" className="btn-primary inline-block mt-4">Trouver un logement</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations.map(res => {
                  const { label, cls } = statutBadge(res.statut);
                  return (
                    <div key={res.id} className="card p-5 flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-28 h-24 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                        <img src={res.photo_logement || 'https://placehold.co/200x150/e2e8f0/94a3b8?text=Photo'}
                             alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-gray-900 truncate">{res.logement_titre}</h3>
                          <span className={cls}>{label}</span>
                        </div>
                        <p className="text-gray-500 text-sm mt-0.5">📍 {res.ville_nom}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                          <span>📅 {formatDate(res.date_debut)} → {formatDate(res.date_fin)}</span>
                          <span className="font-semibold text-[#1B5E20]">{formatFCFA(res.montant_total)}</span>
                        </div>
                      </div>
                      {res.statut === 'terminee' && !res.a_laisse_avis && (
                        <div className="flex-shrink-0">
                          {avisForm?.id === res.id ? (
                            <div className="bg-gray-50 rounded-xl p-4 min-w-[220px]">
                              <p className="text-sm font-medium text-gray-700 mb-2">Votre note</p>
                              <div className="flex gap-1 mb-2">
                                {[1,2,3,4,5].map(n => (
                                  <button key={n} onClick={() => setAvisNote(n)}
                                          className={`text-xl ${n <= avisNote ? 'text-[#F9A825]' : 'text-gray-300'}`}>★</button>
                                ))}
                              </div>
                              <textarea value={avisComm} onChange={e => setAvisComm(e.target.value)}
                                        className="input text-sm h-20 resize-none"
                                        placeholder="Partagez votre expérience…" />
                              <div className="flex gap-2 mt-2">
                                <button onClick={() => submitAvis(res)} disabled={avisLoading}
                                        className="btn-primary py-1.5 px-3 text-sm flex-1">Envoyer</button>
                                <button onClick={() => setAvisForm(null)} className="text-gray-400 hover:text-gray-600 text-sm">Annuler</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => setAvisForm(res)} className="btn-outline py-2 px-4 text-sm whitespace-nowrap">
                              ⭐ Laisser un avis
                            </button>
                          )}
                        </div>
                      )}
                      {res.statut === 'terminee' && res.a_laisse_avis == 1 && (
                        <span className="text-xs text-gray-400 self-end flex-shrink-0">Avis laissé ✓</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── TAB 1 : Messagerie ── */}
        {tab === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ height: '520px' }}>

            {/* Liste des conversations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <p className="font-semibold text-gray-800">Conversations</p>
                <p className="text-xs text-gray-400 mt-0.5">Vos échanges avec les propriétaires</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {convLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-[#1B5E20] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-3xl mb-2">💬</p>
                    <p className="text-gray-500 text-sm">Aucune conversation pour le moment.</p>
                    <p className="text-gray-400 text-xs mt-1">Contactez un propriétaire depuis la page d'un logement.</p>
                  </div>
                ) : conversations.map(c => (
                  <button key={c.interlocuteur_id}
                          onClick={() => loadMessages(c.interlocuteur_id)}
                          className={`w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 border-b border-gray-50 transition-colors
                            ${chatWith === c.interlocuteur_id ? 'bg-[#E8F5E9]' : ''}`}>
                    <div className="w-10 h-10 bg-[#1B5E20] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {c.prenom?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{c.prenom} {c.nom}</p>
                      <p className="text-gray-400 text-xs truncate">{c.dernier_message}</p>
                    </div>
                    {c.non_lus > 0 && (
                      <span className="bg-[#1B5E20] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 font-bold">
                        {c.non_lus}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Fenêtre de chat */}
            <div className="sm:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
              {chatWith ? (
                <>
                  {/* Header chat */}
                  <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="w-9 h-9 bg-[#1B5E20] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {conversations.find(c => c.interlocuteur_id === chatWith)?.prenom?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {conversations.find(c => c.interlocuteur_id === chatWith)?.prenom}{' '}
                        {conversations.find(c => c.interlocuteur_id === chatWith)?.nom}
                      </p>
                      <p className="text-xs text-gray-400">Propriétaire</p>
                    </div>
                  </div>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-8">Démarrez la conversation…</p>
                    ) : messages.map(m => (
                      <div key={m.id} className={`flex ${m.expediteur_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-sm rounded-2xl px-4 py-2.5 text-sm
                          ${m.expediteur_id === user?.id
                            ? 'bg-[#1B5E20] text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                          <p>{m.contenu}</p>
                          <p className={`text-xs mt-1 ${m.expediteur_id === user?.id ? 'text-white/60' : 'text-gray-400'}`}>
                            {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Input */}
                  <div className="border-t border-gray-100 p-3 flex gap-2">
                    <input
                      value={msgText}
                      onChange={e => setMsgText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      className="input flex-1 py-2"
                      placeholder="Écrire un message…"
                    />
                    <button onClick={sendMessage} disabled={!msgText.trim()}
                            className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
                      Envoyer
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <p className="text-5xl mb-3">💬</p>
                  <p className="font-medium text-gray-700">Sélectionnez une conversation</p>
                  <p className="text-gray-400 text-sm mt-1">ou contactez un propriétaire depuis une annonce</p>
                  <Link to="/logements" className="btn-primary mt-5 text-sm">Parcourir les annonces</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
