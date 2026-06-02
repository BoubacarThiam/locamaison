import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { formatFCFA } from '../utils/formatters';

export default function ModalPaiement({ montant, telephoneDefaut, reservationId, onSuccess, onClose }) {
  const [mode,      setMode]      = useState('wave');
  const [telephone, setTelephone] = useState(telephoneDefaut || '');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [polling,   setPolling]   = useState(false);
  const [ref,       setRef]       = useState('');
  const pollRef = useRef(null);

  useEffect(() => () => clearInterval(pollRef.current), []);

  const validTel = /^(\+221|00221)?[76]\d{8}$/.test(telephone);

  const handlePay = async () => {
    if (mode !== 'especes' && !validTel) {
      setError('Numéro sénégalais invalide (+221 7X XXX XX XX)');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/paiements/initier', {
        reservation_id: reservationId,
        mode,
        telephone,
      });
      const result = data.data;
      setRef(result.ref);

      if (mode === 'especes') {
        onSuccess(result.ref);
        return;
      }

      const url = result.checkout_url || result.payment_url;
      if (url) {
        // Démarre le polling avant la redirection
        startPolling(result.ref);
        window.location.href = url;
      } else {
        setError('Impossible d\'obtenir l\'URL de paiement. Réessayez.');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur réseau. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (payRef) => {
    setPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/paiements/verifier/${payRef}`);
        if (data.data?.paid || data.data?.statut === 'confirmee') {
          clearInterval(pollRef.current);
          setPolling(false);
          onSuccess(payRef);
        }
      } catch {}
    }, 5000);
    setTimeout(() => {
      clearInterval(pollRef.current);
      setPolling(false);
    }, 5 * 60 * 1000); // stop polling après 5 min
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Paiement sécurisé</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Montant */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-gray-500 text-sm">Montant total</p>
            <p className="text-3xl font-bold text-[#1B5E20] mt-1">{formatFCFA(montant)}</p>
          </div>

          {/* Téléphone */}
          {mode !== 'especes' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone Wave / Orange Money
              </label>
              <input
                type="tel"
                placeholder="+221 77 000 00 00"
                value={telephone}
                onChange={e => setTelephone(e.target.value)}
                className={`input ${telephone && !validTel ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {telephone && !validTel && (
                <p className="text-xs text-red-500 mt-1">Format : +221 7X XXX XX XX</p>
              )}
            </div>
          )}

          {/* Modes de paiement */}
          <div className="space-y-3">
            {/* Wave */}
            <button
              onClick={() => setMode('wave')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                ${mode === 'wave' ? 'border-[#1B96DC] bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
            >
              <div className="w-10 h-10 bg-[#1B96DC] rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">W</div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Payer avec Wave</p>
                <p className="text-xs text-gray-500">Rapide et sécurisé</p>
              </div>
              {mode === 'wave' && (
                <svg className="w-5 h-5 text-[#1B96DC] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Orange Money */}
            <button
              onClick={() => setMode('orange_money')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                ${mode === 'orange_money' ? 'border-[#FF6600] bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}
            >
              <div className="w-10 h-10 bg-[#FF6600] rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">OM</div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Payer avec Orange Money</p>
                <p className="text-xs text-gray-500">Réseau Orange Sénégal</p>
              </div>
              {mode === 'orange_money' && (
                <svg className="w-5 h-5 text-[#FF6600] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Espèces */}
            <button
              onClick={() => setMode('especes')}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                ${mode === 'especes' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-gray-400'}`}
            >
              <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">💵</div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Régler en espèces</p>
                <p className="text-xs text-gray-500">À confirmer avec le propriétaire</p>
              </div>
              {mode === 'especes' && (
                <svg className="w-5 h-5 text-gray-500 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Polling */}
          {polling && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Vérification du paiement en cours…
            </div>
          )}

          {/* Bouton confirmer */}
          <button
            onClick={handlePay}
            disabled={loading || polling || (mode !== 'especes' && !validTel)}
            className="btn-primary w-full text-center"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Traitement…
              </span>
            ) : `Confirmer le paiement — ${formatFCFA(montant)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
