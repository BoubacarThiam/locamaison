import { useSearchParams, Link } from 'react-router-dom';

export default function PageSuccesPaiement() {
  const [params] = useSearchParams();
  const ref      = params.get('ref');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-10 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#1B5E20]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Paiement confirmé !</h1>
        <p className="text-gray-600 mb-2">
          Votre réservation a été confirmée avec succès. Vous recevrez une confirmation sur votre numéro de téléphone.
        </p>
        {ref && (
          <p className="text-sm text-gray-500 mt-2">
            Référence : <span className="font-mono font-medium text-gray-700">{ref}</span>
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Link to="/dashboard/locataire" className="btn-primary flex-1 text-center">
            Mes réservations
          </Link>
          <Link to="/logements" className="btn-outline flex-1 text-center">
            Continuer à explorer
          </Link>
        </div>
      </div>
    </div>
  );
}
