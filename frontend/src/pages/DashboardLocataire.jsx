import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { formatFCFA, formatDate, statutBadge } from '../utils/formatters';
import Navbar from '../components/Navbar';

export default function DashboardLocataire() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [avisForm,     setAvisForm]     = useState(null); // reservation en cours d'avis
  const [avisNote,     setAvisNote]     = useState(5);
  const [avisComm,     setAvisComm]     = useState('');
  const [avisLoading,  setAvisLoading]  = useState(false);

  const load = () => {
    api.get('/locataire/reservations')
       .then(r => setReservations(r.data.data || []))
       .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const submitAvis = async (res) => {
    setAvisLoading(true);
    try {
      await api.post('/avis', {
        logement_id: res.logement_id, reservation_id: res.id,
        note: avisNote, commentaire: avisComm,
      });
      setAvisForm(null);
      load();
    } catch (e) {
      alert(e.response?.data?.message || 'Erreur lors de l\'envoi de l\'avis');
    } finally {
      setAvisLoading(false);
    }
  };

  const total  = reservations.length;
  const actives = reservations.filter(r => r.statut === 'confirmee').length;

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bonjour, {user?.prenom} 👋</h1>
        <p className="text-gray-500 mb-8">Gérez vos locations depuis votre espace personnel.</p>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Réservations',      value: total,   icon: '📋' },
            { label: 'En cours',          value: actives, icon: '🟢' },
            { label: 'Régions visitées',  value: new Set(reservations.map(r => r.ville_nom)).size, icon: '📍' },
          ].map(k => (
            <div key={k.label} className="card p-5 text-center">
              <div className="text-2xl mb-1">{k.icon}</div>
              <div className="text-2xl font-bold text-[#1B5E20]">{k.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Réservations */}
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
                  {/* Photo */}
                  <div className="w-full sm:w-28 h-24 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    <img src={res.photo_logement || 'https://placehold.co/200x150/e2e8f0/94a3b8?text=Photo'}
                         alt="" className="w-full h-full object-cover" />
                  </div>
                  {/* Infos */}
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
                  {/* Actions */}
                  {res.statut === 'terminee' && !res.a_laisse_avis && (
                    <div className="flex-shrink-0">
                      {avisForm?.id === res.id ? (
                        <div className="bg-gray-50 rounded-xl p-4 min-w-[220px]">
                          <p className="text-sm font-medium text-gray-700 mb-2">Votre note</p>
                          <div className="flex gap-1 mb-2">
                            {[1,2,3,4,5].map(n => (
                              <button key={n} onClick={() => setAvisNote(n)}
                                      className={`text-xl ${n <= avisNote ? 'text-[#F9A825]' : 'text-gray-300'}`}>
                                ★
                              </button>
                            ))}
                          </div>
                          <textarea value={avisComm} onChange={e => setAvisComm(e.target.value)}
                                    className="input text-sm h-20 resize-none"
                                    placeholder="Partagez votre expérience…" />
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => submitAvis(res)} disabled={avisLoading}
                                    className="btn-primary py-1.5 px-3 text-sm flex-1">
                              Envoyer
                            </button>
                            <button onClick={() => setAvisForm(null)}
                                    className="text-gray-400 hover:text-gray-600 text-sm">
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setAvisForm(res)}
                                className="btn-outline py-2 px-4 text-sm whitespace-nowrap">
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
      </main>
    </>
  );
}
