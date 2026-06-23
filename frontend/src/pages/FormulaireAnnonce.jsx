import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../utils/api';
import Navbar from '../components/Navbar';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STEPS = ['Localisation', 'Détails', 'Tarifs', 'Photos', 'Résumé'];
const EQUIPEMENTS_LIST = [
  'wifi', 'climatisation', 'eau_chaude', 'parking', 'piscine',
  'jardin', 'securite', 'gardien', 'plage', 'ventilateur', 'terrasse', 'cour',
];
const EQUIPEMENTS_LABELS = {
  wifi:'WiFi', climatisation:'Climatisation', eau_chaude:'Eau chaude', parking:'Parking',
  piscine:'Piscine', jardin:'Jardin', securite:'Sécurité', gardien:'Gardien',
  plage:'Accès plage', ventilateur:'Ventilateur', terrasse:'Terrasse', cour:'Cour',
};

// Compresse une image avant upload (max 1200px, qualité 80%)
function compressImage(file) {
  return new Promise(resolve => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1200;
      const scale  = Math.min(MAX / img.width, MAX / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
  });
}

function MapPicker({ position, onChange }) {
  useMapEvents({
    click(e) { onChange([e.latlng.lat, e.latlng.lng]); },
  });
  return position ? <Marker position={position} /> : null;
}

export default function FormulaireAnnonce() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const [regions,   setRegions]   = useState([]);
  const [villes,    setVilles]    = useState([]);
  const [quartiers, setQuartiers] = useState([]);

  const [form, setForm] = useState({
    region_id: '', ville_id: '', quartier_id: '', adresse: '',
    latitude: '', longitude: '',
    type: 'appartement', nb_chambres: 1, nb_salles_bain: 1,
    superficie_m2: '', meuble: false, equipements: [], description: '', titre: '',
    prix_par_nuit: '', prix_par_mois: '',
  });
  const [photos,        setPhotos]        = useState([]);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [createdId,     setCreatedId]     = useState(null);
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleEq = (eq) => set('equipements', form.equipements.includes(eq)
    ? form.equipements.filter(e => e !== eq)
    : [...form.equipements, eq]);

  useEffect(() => {
    api.get('/regions').then(r => setRegions(r.data.data || []));
    if (isEdit) {
      api.get(`/logements/${id}`).then(r => {
        const l = r.data.data;
        setForm({
          region_id: l.region_id, ville_id: l.ville_id, quartier_id: l.quartier_id || '',
          adresse: l.adresse || '', latitude: l.latitude || '', longitude: l.longitude || '',
          type: l.type, nb_chambres: l.nb_chambres, nb_salles_bain: l.nb_salles_bain,
          superficie_m2: l.superficie_m2 || '', meuble: !!l.meuble,
          equipements: l.equipements || [], description: l.description || '', titre: l.titre,
          prix_par_nuit: l.prix_par_nuit || '', prix_par_mois: l.prix_par_mois || '',
        });
        setCreatedId(id);
      });
    }
  }, [id, isEdit]);

  useEffect(() => {
    if (form.region_id) {
      api.get(`/villes?region_id=${form.region_id}`).then(r => setVilles(r.data.data || []));
    }
  }, [form.region_id]);

  useEffect(() => {
    if (form.ville_id) {
      api.get(`/quartiers?ville_id=${form.ville_id}`).then(r => setQuartiers(r.data.data || []));
    }
  }, [form.ville_id]);

  const submitLogement = async () => {
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await api.put(`/logements/${id}`, form);
        setCreatedId(id);
      } else {
        const { data } = await api.post('/logements', form);
        setCreatedId(data.data.id);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de la sauvegarde');
      return false;
    } finally {
      setLoading(false);
    }
    return true;
  };

  const uploadPhotos = async () => {
    if (!photos.length && !isEdit) {
      setError('Ajoutez au moins une photo.');
      return false;
    }
    if (!photos.length) return true;

    setLoading(true);
    setError('');
    try {
      // Compresse les photos avant envoi
      const compressed = await Promise.all(photos.map(compressImage));
      const fd = new FormData();
      compressed.forEach(f => fd.append('photos[]', f));

      const { data } = await api.post(`/logements/${createdId}/photos`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedPhotos(data.data || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de l\'upload des photos');
      return false;
    } finally {
      setLoading(false);
    }
    return true;
  };

  const next = async () => {
    setError('');
    if (step === 0 && (!form.region_id || !form.ville_id)) {
      setError('Sélectionnez la région et la ville.'); return;
    }
    if (step === 1 && !form.titre) {
      setError('Ajoutez un titre pour l\'annonce.'); return;
    }
    if (step === 2) {
      if (!form.prix_par_mois && !form.prix_par_nuit) {
        setError('Saisissez au moins un prix.'); return;
      }
      const ok = await submitLogement();
      if (!ok) return;
    }
    if (step === 3) {
      const ok = await uploadPhotos();
      if (!ok) return;
    }
    setStep(s => s + 1);
  };

  const mapCenter = form.latitude && form.longitude
    ? [parseFloat(form.latitude), parseFloat(form.longitude)]
    : [14.6928, -17.4467];

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Modifier l\'annonce' : 'Publier une annonce'}
        </h1>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-8 overflow-x-auto">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 min-w-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                ${i < step ? 'bg-[#1B5E20] text-white' : i === step ? 'bg-[#F9A825] text-gray-900' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-xs ml-1.5 hidden sm:block ${i === step ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {s}
              </span>
              {i < STEPS.length - 1 && <div className={`h-0.5 flex-1 mx-2 ${i < step ? 'bg-[#1B5E20]' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

          {/* ÉTAPE 0 — Localisation */}
          {step === 0 && (
            <>
              <h2 className="text-lg font-bold text-gray-900">Localisation du logement</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Région *</label>
                  <select value={form.region_id} onChange={e => set('region_id', e.target.value)} className="input">
                    <option value="">Sélectionner</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                  <select value={form.ville_id} onChange={e => set('ville_id', e.target.value)} className="input" disabled={!villes.length}>
                    <option value="">Sélectionner</option>
                    {villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
                  <select value={form.quartier_id} onChange={e => set('quartier_id', e.target.value)} className="input" disabled={!quartiers.length}>
                    <option value="">Optionnel</option>
                    {quartiers.map(q => <option key={q.id} value={q.id}>{q.nom}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse précise</label>
                <input value={form.adresse} onChange={e => set('adresse', e.target.value)}
                       className="input" placeholder="Rue, numéro…" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliquez sur la carte pour placer le marqueur
                </label>
                <MapContainer center={mapCenter} zoom={13} style={{ height: '300px' }} className="rounded-xl">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapPicker
                    position={form.latitude ? [parseFloat(form.latitude), parseFloat(form.longitude)] : null}
                    onChange={([lat, lng]) => { set('latitude', lat.toFixed(6)); set('longitude', lng.toFixed(6)); }}
                  />
                </MapContainer>
                {form.latitude && (
                  <p className="text-xs text-gray-400 mt-1">
                    Coords : {form.latitude}, {form.longitude}
                  </p>
                )}
              </div>
            </>
          )}

          {/* ÉTAPE 1 — Détails */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold text-gray-900">Détails du logement</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'annonce *</label>
                <input value={form.titre} onChange={e => set('titre', e.target.value)}
                       className="input" placeholder="Ex : Bel appartement F3 meublé à Dakar-Plateau" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                          className="input h-28 resize-none" placeholder="Décrivez votre bien, le quartier, les transports…" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)} className="input">
                    {['appartement','maison','chambre','villa','studio'].map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chambres</label>
                  <input type="number" min="1" max="20" value={form.nb_chambres}
                         onChange={e => set('nb_chambres', e.target.value)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salles de bain</label>
                  <input type="number" min="1" max="10" value={form.nb_salles_bain}
                         onChange={e => set('nb_salles_bain', e.target.value)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Superficie (m²)</label>
                  <input type="number" min="5" value={form.superficie_m2}
                         onChange={e => set('superficie_m2', e.target.value)} className="input" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.meuble} onChange={e => set('meuble', e.target.checked)}
                         className="w-4 h-4 accent-[#1B5E20]" />
                  <span className="text-sm font-medium text-gray-700">Logement meublé</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Équipements</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {EQUIPEMENTS_LIST.map(eq => (
                    <label key={eq} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.equipements.includes(eq)}
                             onChange={() => toggleEq(eq)} className="accent-[#1B5E20]" />
                      <span className="text-sm text-gray-700">{EQUIPEMENTS_LABELS[eq]}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ÉTAPE 2 — Tarifs */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-bold text-gray-900">Tarification</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix par mois (FCFA)</label>
                  <input type="text" inputMode="numeric" value={form.prix_par_mois}
                         onChange={e => set('prix_par_mois', e.target.value)} className="input"
                         placeholder="Ex : 250000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prix par nuit (FCFA)</label>
                  <input type="text" inputMode="numeric" value={form.prix_par_nuit}
                         onChange={e => set('prix_par_nuit', e.target.value)} className="input"
                         placeholder="Ex : 15000" />
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                💡 Saisissez le prix mensuel pour la location longue durée et/ou le prix à la nuit pour la courte durée.
              </div>
            </>
          )}

          {/* ÉTAPE 3 — Photos */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-bold text-gray-900">Photos du logement</h2>
              <p className="text-sm text-gray-500">
                Ajoutez jusqu'à 10 photos. La première sera la photo principale.
                Les images seront compressées automatiquement.
              </p>

              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-[#1B5E20] rounded-xl p-8 text-center cursor-pointer hover:bg-[#E8F5E9] transition-colors"
              >
                <p className="text-4xl mb-2">📷</p>
                <p className="font-medium text-[#1B5E20]">
                  {photos.length > 0 ? `${photos.length} photo${photos.length > 1 ? 's' : ''} sélectionnée${photos.length > 1 ? 's' : ''} — cliquer pour en ajouter` : 'Cliquez pour sélectionner vos photos'}
                </p>
                <p className="text-gray-400 text-sm mt-1">JPG, PNG, WebP — max 5 Mo par photo</p>
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                       onChange={e => {
                         const newFiles = Array.from(e.target.files);
                         setPhotos(prev => [...prev, ...newFiles].slice(0, 10));
                         e.target.value = '';
                       }} />
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                  {photos.map((f, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img src={URL.createObjectURL(f)} alt=""
                           className="w-full h-full object-cover rounded-xl" />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 bg-[#1B5E20] text-white text-xs px-1.5 py-0.5 rounded-md font-medium">
                          Principale
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setPhotos(p => p.filter((_, j) => j !== i)); }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ÉTAPE 4 — Résumé */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {isEdit ? 'Annonce modifiée !' : 'Annonce soumise !'}
              </h2>
              <p className="text-gray-600 max-w-sm mx-auto">
                {isEdit
                  ? 'Vos modifications ont été enregistrées avec succès.'
                  : 'Votre annonce est publiée et visible par tous les utilisateurs immédiatement.'}
              </p>
              <button onClick={() => nav('/dashboard/proprietaire')}
                      className="btn-primary mt-6">
                Retour à mon espace
              </button>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Navigation */}
          {step < 4 && (
            <div className="flex justify-between pt-4">
              {step > 0 ? (
                <button onClick={() => setStep(s => s - 1)} className="btn-outline py-2 px-5">
                  ← Retour
                </button>
              ) : <div />}
              <button onClick={next} disabled={loading} className="btn-primary px-8">
                {loading ? 'Sauvegarde…' : step === STEPS.length - 2 ? 'Soumettre' : 'Suivant →'}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
