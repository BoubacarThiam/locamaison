import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RechercheLogement from '../components/RechercheLogement';

export default function PageRecherche() {
  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Trouver un logement au Sénégal
        </h1>
        <RechercheLogement />
      </main>
      <Footer />
    </>
  );
}
