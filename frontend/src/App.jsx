import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import PageAccueil           from './pages/PageAccueil';
import PageRecherche         from './pages/PageRecherche';
import PageDetailLogement    from './pages/PageDetailLogement';
import PageConnexion         from './pages/PageConnexion';
import PageInscription       from './pages/PageInscription';
import PageSuccesPaiement    from './pages/PageSuccesPaiement';
import PageEchecPaiement     from './pages/PageEchecPaiement';
import DashboardLocataire    from './pages/DashboardLocataire';
import DashboardProprietaire from './pages/DashboardProprietaire';
import FormulaireAnnonce     from './pages/FormulaireAnnonce';
import DashboardAdmin        from './pages/DashboardAdmin';

// Wrapper pour pages avec Navbar + Footer
function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Layout><PageAccueil /></Layout>} />
        <Route path="/logements"     element={<PageRecherche />} />
        <Route path="/logements/:id" element={<PageDetailLogement />} />
        <Route path="/connexion"     element={<PageConnexion />} />
        <Route path="/inscription"   element={<PageInscription />} />
        <Route path="/reservation/succes" element={<PageSuccesPaiement />} />
        <Route path="/reservation/echec"  element={<PageEchecPaiement />} />

        {/* Locataire */}
        <Route path="/dashboard/locataire" element={
          <ProtectedRoute roles={['locataire']}>
            <DashboardLocataire />
          </ProtectedRoute>
        } />

        {/* Propriétaire */}
        <Route path="/dashboard/proprietaire" element={
          <ProtectedRoute roles={['proprietaire']}>
            <DashboardProprietaire />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/proprietaire/annonce/nouvelle" element={
          <ProtectedRoute roles={['proprietaire']}>
            <FormulaireAnnonce />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/proprietaire/annonce/:id/edit" element={
          <ProtectedRoute roles={['proprietaire','admin']}>
            <FormulaireAnnonce />
          </ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <DashboardAdmin />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <p className="text-6xl font-bold text-[#1B5E20]">404</p>
              <p className="text-gray-500 mt-2">Page introuvable</p>
              <a href="/" className="btn-primary inline-block mt-4">Retour à l'accueil</a>
            </div>
          </div>
        } />
      </Routes>
    </AuthProvider>
  );
}
