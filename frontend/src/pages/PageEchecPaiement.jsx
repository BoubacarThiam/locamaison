import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function PageEchecPaiement() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const ref = params.get('ref');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Paiement échoué</h1>
        <p className="text-gray-600 mb-6">
          Votre paiement n'a pas pu être traité. Votre réservation est conservée en attente.
          Vous pouvez réessayer depuis vos réservations.
        </p>
        {ref && (
          <p className="text-sm text-gray-500 mb-6">
            Référence : <span className="font-mono font-medium text-gray-700">{ref}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => nav(-2)} className="btn-primary flex-1">
            Réessayer le paiement
          </button>
          <Link to="/dashboard/locataire" className="btn-outline flex-1 text-center">
            Mes réservations
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Besoin d'aide ? Contactez le support : support@locamaison.sn
        </p>
      </div>
    </div>
  );
}
