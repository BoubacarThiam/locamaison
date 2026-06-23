import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { formatFCFA, formatDate, calcMontant, renderStars, equipementLabel } from '../utils/formatters';
import ModalPaiement from '../components/ModalPaiement';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function PageDetailLogement() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const nav = useNavigate();

  const [logement,      setLogement]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [dateDebut,     setDateDebut]     = useState('');
  const [dateFin,       setDateFin]       = useState('');
  const [typeSejour,    setTypeSejour]    = useState('longue_duree');
  const [showModal,     setShowModal]     = useState(false);
  const [resId,         setResId]         = useState(null);
  const [montant,       setMontant]       = useState(0);
  const [loadingRes,    setLoadingRes]    = useState(false);
  const [resError,      setResError]      = useState('');
  const [demandeOk,      setDemandeOk]      = useState(false);
  const [loadingDemande, setLoadingDemande] = useState(false);
  const [showContact,    setShowContact]    = useState(false);
  const [msgTexte,       setMsgTexte]       = useState('');
  const [msgOk,          setMsgOk]          = useState(false);
  const [msgLoading,     setMsgLoading]     = useState(false);

  useEffect(() => {
    api.get(`/logements/${id}`)
       .then(r => setLogement(r.data.data))
       .catch(() => nav('/logements'))
       .finally(() => setLoading(false));
  }, [id, nav]);

  useEffect(() => {
    if (logement && dateDebut && dateFin) {
      setMontant(calcMontant(logement, dateDebut, dateFin, typeSejour));
    }
  }, [logement, dateDebut, dateFin, typeSejour]);

  const handleDemande = async () => {
    if (!isAuthenticated) { nav('/connexion'); return; }
    setLoadingDemande(true);
    try {
      await api.post(`/logements/${id}/demande`, { message: 'Je suis intéressé par ce logement.' });
      setDemandeOk(true);
    } catch (e) {
      setResError(e.response?.data?.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoadingDemande(false);
    }
  };

  const handleEnvoyerMessage = async () => {
    if (!msgTexte.trim()) return;
    if (!isAuthenticated) { nav('/connexion'); return; }
    setMsgLoading(true);
    try {
      await api.post('/messages', {
        destinataire_id: logement.proprietaire_id,
        contenu: msgTexte.trim(),
      });
      setMsgOk(true);
      setMsgTexte('');
    } catch { /* silencieux */ }
    finally { setMsgLoading(false); }
  };

  const handleReserver = async () => {
    if (!isAuthenticated) { nav('/connexion'); return; }
    if (user?.role !== 'locataire') { setResError('Seuls les locataires peuvent réserver.'); return; }
    if (!dateDebut || !dateFin) { setResError('Sélectionnez les dates.'); return; }
    if (new Date(dateFin) <= new Date(dateDebut)) { setResError('Date de départ invalide.'); return; }

    setLoadingRes(true);
    setResError('');
    try {
      const { data } = await api.post('/reservations', {
        logement_id: id, date_debut: dateDebut, date_fin: dateFin,
        type_sejour: typeSejour, mode_paiement: 'wave',
      });
      setResId(data.data.id);
      setShowModal(true);
    } catch (e) {
      setResError(e.response?.data?.message || 'Erreur lors de la réservation');
    } finally {
      setLoadingRes(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#1B5E20] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </>
  );

  if (!logement) return null;

  const stars      = renderStars(logement.note_moyenne ?? 0);
  const photos     = logement.photos || [];
  const equipements = logement.equipements || [];
  const avis       = logement.avis || [];
  const lat        = parseFloat(logement.latitude)  || 14.6928;
  const lng        = parseFloat(logement.longitude) || -17.4467;
  const today      = new Date().toISOString().split('T')[0];

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Fil d'ariane ────────────────────────────────────── */}
        <nav className="text-sm text-gray-500 mb-4 flex gap-1 flex-wrap">
          <a href="/logements" className="hover:text-[#1B5E20]">Logements</a>
          <span>/</span>
          <span className="text-gray-700">{logement.region_nom}</span>
          <span>/</span>
          <span className="text-gray-700">{logement.ville_nom}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

            {/* ── Galerie ──────────────────────────────────────── */}
            <div>
              <div className="rounded-2xl overflow-hidden h-72 sm:h-96 bg-gray-200">
                <img
                  src={photos[selectedPhoto]?.url || 'https://placehold.co/800x500/e2e8f0/94a3b8?text=Photo'}
                  alt={logement.titre}
                  className="w-full h-full object-cover"
                />
              </div>
              {photos.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {photos.map((p, i) => (
                    <button key={p.id} onClick={() => setSelectedPhoto(i)}
                            className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all
                              ${i === selectedPhoto ? 'border-[#1B5E20]' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                      <img src={p.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Titre + badges ───────────────────────────────── */}
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{logement.titre}</h1>
                  <p className="text-gray-500 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4 text-[#1B5E20]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {logement.adresse}
                    {logement.quartier_nom && `, ${logement.quartier_nom}`}
                    {` — ${logement.ville_nom}, ${logement.region_nom}`}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {logement.is_verified == 1 && (
                    <span className="badge-actif flex items-center gap-1 text-sm px-3 py-1.5">
                      ✓ Vérifié
                    </span>
                  )}
                  <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full">
                    {logement.meuble ? 'Meublé' : 'Non meublé'}
                  </span>
                </div>
              </div>

              {/* Note + détails */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  {stars.map((s, i) => (
                    <svg key={i} className={`w-5 h-5 ${s !== 'empty' ? 'text-[#F9A825]' : 'text-gray-300'}`}
                         fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-gray-700 font-medium ml-1">
                    {parseFloat(logement.note_moyenne || 0).toFixed(1)}
                    <span className="text-gray-500 font-normal"> ({logement.nb_avis} avis)</span>
                  </span>
                </div>
                <span className="text-gray-400">·</span>
                <span className="text-gray-600">{logement.nb_chambres} chambre{logement.nb_chambres > 1 ? 's' : ''}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-600">{logement.nb_salles_bain} salle{logement.nb_salles_bain > 1 ? 's' : ''} de bain</span>
                {logement.superficie_m2 && (
                  <>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-600">{logement.superficie_m2} m²</span>
                  </>
                )}
              </div>
            </div>

            {/* ── Description ──────────────────────────────────── */}
            {logement.description && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{logement.description}</p>
              </div>
            )}

            {/* ── Équipements ──────────────────────────────────── */}
            {equipements.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Équipements</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {equipements.map(eq => (
                    <div key={eq} className="flex items-center gap-2 text-gray-700">
                      <span className="w-6 h-6 bg-[#E8F5E9] rounded-full flex items-center justify-center text-[#1B5E20] text-sm">✓</span>
                      {equipementLabel(eq)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Carte ────────────────────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Localisation</h2>
              <MapContainer center={[lat, lng]} zoom={14} style={{ height: '320px' }} className="rounded-xl shadow">
                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[lat, lng]} />
              </MapContainer>
            </div>

            {/* ── Propriétaire ─────────────────────────────────── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Votre propriétaire</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#1B5E20] rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {logement.proprio_prenom?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-lg">{logement.proprio_prenom} {logement.proprio_nom}</p>
                  <p className="text-gray-500 text-sm">
                    {logement.nb_reservations_proprio} location{logement.nb_reservations_proprio > 1 ? 's' : ''} effectuée{logement.nb_reservations_proprio > 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => { setShowContact(true); setMsgOk(false); setMsgTexte(''); }}
                  className="btn-primary py-2 px-5 text-sm flex-shrink-0">
                  Contacter
                </button>
              </div>

              {/* Infos de contact rapides */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {logement.proprio_telephone && (
                  <a href={`tel:${logement.proprio_telephone}`}
                     className="flex items-center gap-3 bg-gray-50 hover:bg-[#E8F5E9] rounded-xl p-3 transition-colors group">
                    <span className="w-9 h-9 bg-[#1B5E20] rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">📞</span>
                    <div>
                      <p className="text-xs text-gray-500">Téléphone</p>
                      <p className="font-medium text-gray-900 text-sm group-hover:text-[#1B5E20]">{logement.proprio_telephone}</p>
                    </div>
                  </a>
                )}
                {logement.proprio_email && (
                  <a href={`mailto:${logement.proprio_email}`}
                     className="flex items-center gap-3 bg-gray-50 hover:bg-[#E8F5E9] rounded-xl p-3 transition-colors group">
                    <span className="w-9 h-9 bg-[#1B5E20] rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">✉️</span>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-900 text-sm group-hover:text-[#1B5E20] truncate">{logement.proprio_email}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* ── Avis ─────────────────────────────────────────── */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Avis ({logement.nb_avis})
              </h2>
              {avis.length === 0 ? (
                <p className="text-gray-500">Aucun avis pour ce logement.</p>
              ) : (
                <div className="space-y-5">
                  {avis.map(a => (
                    <div key={a.id} className="border-b border-gray-100 pb-5 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-[#1B5E20] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {a.prenom?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{a.prenom} {a.nom}</p>
                            <span className="text-gray-400 text-xs">{formatDate(a.created_at)}</span>
                          </div>
                          <div className="flex mt-0.5">
                            {renderStars(a.note).map((s, i) => (
                              <svg key={i} className={`w-3.5 h-3.5 ${s !== 'empty' ? 'text-[#F9A825]' : 'text-gray-300'}`}
                                   fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{a.commentaire}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Formulaire réservation (sticky) ─────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">

            {/* Demande rapide */}
            <div className="bg-[#1B5E20] rounded-2xl p-5 text-white shadow-lg">
              <p className="font-bold text-lg mb-1">Intéressé par ce bien ?</p>
              <p className="text-[#A5D6A7] text-sm mb-4">Envoyez une demande directement au propriétaire — il sera alerté immédiatement.</p>
              {demandeOk ? (
                <div className="bg-[#2E7D32] rounded-xl p-3 text-center">
                  <p className="text-white font-semibold">✓ Demande envoyée !</p>
                  <p className="text-[#A5D6A7] text-xs mt-1">Le propriétaire a été alerté.</p>
                </div>
              ) : (
                <button onClick={handleDemande} disabled={loadingDemande}
                        className="w-full bg-[#F9A825] hover:bg-[#F57F17] text-[#1B5E20] font-bold py-3 rounded-xl transition-colors">
                  {loadingDemande ? 'Envoi…' : '📩 Demander à louer'}
                </button>
              )}
              {!isAuthenticated && (
                <p className="text-center text-xs text-[#A5D6A7] mt-2">
                  <a href="/connexion" className="underline text-white">Connectez-vous</a> pour envoyer une demande
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex gap-4 mb-5">
                {logement.prix_par_mois && (
                  <div>
                    <span className="text-2xl font-bold text-[#1B5E20]">{formatFCFA(logement.prix_par_mois)}</span>
                    <span className="text-gray-500 text-sm">/mois</span>
                  </div>
                )}
                {logement.prix_par_nuit && (
                  <div>
                    <span className="text-lg font-semibold text-gray-700">{formatFCFA(logement.prix_par_nuit)}</span>
                    <span className="text-gray-400 text-sm">/nuit</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Type de séjour</label>
                  <select value={typeSejour} onChange={e => setTypeSejour(e.target.value)} className="input">
                    <option value="longue_duree">Location mensuelle</option>
                    <option value="courte_duree">Courte durée (nuitées)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Arrivée</label>
                    <input type="date" min={today} value={dateDebut}
                           onChange={e => setDateDebut(e.target.value)} className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Départ</label>
                    <input type="date" min={dateDebut || today} value={dateFin}
                           onChange={e => setDateFin(e.target.value)} className="input" />
                  </div>
                </div>
              </div>

              {montant > 0 && (
                <div className="mt-4 p-3 bg-[#E8F5E9] rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-gray-700 text-sm">Montant total</span>
                    <span className="text-[#1B5E20] font-bold">{formatFCFA(montant)}</span>
                  </div>
                </div>
              )}

              {resError && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded-lg">{resError}</p>
              )}

              <button
                onClick={handleReserver}
                disabled={loadingRes || !dateDebut || !dateFin}
                className="btn-primary w-full mt-4"
              >
                {loadingRes ? 'Traitement…' : 'Réserver et payer'}
              </button>

              {!isAuthenticated && (
                <p className="text-center text-xs text-gray-500 mt-2">
                  <a href="/connexion" className="text-[#1B5E20] underline">Connectez-vous</a> pour réserver
                </p>
              )}
            </div>
            </div>{/* fin sticky wrapper */}
          </div>
        </div>
      </main>

      {/* ── Modal contact propriétaire ─────────────────────────── */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

            {/* Header */}
            <div className="bg-[#1B5E20] rounded-t-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {logement.proprio_prenom?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{logement.proprio_prenom} {logement.proprio_nom}</p>
                  <p className="text-[#A5D6A7] text-sm">Propriétaire</p>
                </div>
              </div>
              <button onClick={() => setShowContact(false)}
                      className="text-white/70 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="p-5 space-y-4">
              {/* Coordonnées */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Coordonnées</p>
                {logement.proprio_telephone && (
                  <a href={`tel:${logement.proprio_telephone}`}
                     className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-[#E8F5E9] transition-colors">
                    <span className="text-xl">📞</span>
                    <div>
                      <p className="text-xs text-gray-500">Téléphone / WhatsApp</p>
                      <p className="font-semibold text-gray-900">{logement.proprio_telephone}</p>
                    </div>
                    <span className="ml-auto text-[#1B5E20] text-sm font-medium">Appeler →</span>
                  </a>
                )}
                {logement.proprio_email && (
                  <a href={`mailto:${logement.proprio_email}?subject=Demande de location - ${logement.titre}`}
                     className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-[#E8F5E9] transition-colors">
                    <span className="text-xl">✉️</span>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-gray-900">{logement.proprio_email}</p>
                    </div>
                    <span className="ml-auto text-[#1B5E20] text-sm font-medium">Écrire →</span>
                  </a>
                )}
              </div>

              {/* Séparateur */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs text-gray-400">ou envoyer un message</span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Formulaire message */}
              {msgOk ? (
                <div className="bg-[#E8F5E9] rounded-xl p-4 text-center">
                  <p className="text-[#1B5E20] font-bold text-lg">✓ Message envoyé !</p>
                  <p className="text-[#2E7D32] text-sm mt-1">
                    {logement.proprio_prenom} recevra votre message et vous répondra bientôt.
                  </p>
                </div>
              ) : (
                <>
                  {!isAuthenticated && (
                    <div className="bg-yellow-50 rounded-xl p-3 text-sm text-yellow-800">
                      <a href="/connexion" className="font-semibold underline">Connectez-vous</a> pour envoyer un message.
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Votre message</label>
                    <textarea
                      rows={4}
                      value={msgTexte}
                      onChange={e => setMsgTexte(e.target.value)}
                      disabled={!isAuthenticated}
                      className="input resize-none"
                      placeholder={`Bonjour ${logement.proprio_prenom}, je suis intéressé(e) par votre ${logement.type} "${logement.titre}". Pouvez-vous me donner plus d'informations ?`}
                    />
                  </div>
                  <button
                    onClick={handleEnvoyerMessage}
                    disabled={msgLoading || !isAuthenticated || !msgTexte.trim()}
                    className="btn-primary w-full">
                    {msgLoading ? 'Envoi en cours…' : 'Envoyer le message'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <ModalPaiement
          montant={montant}
          telephoneDefaut={user?.telephone}
          reservationId={resId}
          onSuccess={ref => { setShowModal(false); nav(`/reservation/succes?ref=${ref}`); }}
          onClose={() => setShowModal(false)}
        />
      )}

      <Footer />
    </>
  );
}
