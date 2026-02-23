import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Contact from './components/Contact';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import CallFloat from './components/CallFloat';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import Career from './components/Career';

const getCurrentRoute = () => {
  const hashRoute = window.location.hash.replace(/^#\/?/, '').replace(/\/$/, '');

  if (hashRoute) {
    return hashRoute;
  }

  return window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
};

function App() {
  const [currentRoute, setCurrentRoute] = useState(getCurrentRoute());

  useEffect(() => {
    const handleRouteChange = () => setCurrentRoute(getCurrentRoute());

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentRoute]);

  const isPrivacyPage = currentRoute === 'privacy-policy';
  const isTermsPage = currentRoute === 'terms-of-service';
  const isCareerPage = currentRoute === 'career';

  const isStandalonePage = isPrivacyPage || isTermsPage || isCareerPage;

  const renderPageContent = () => {
    if (isPrivacyPage) {
      return <PrivacyPolicy />;
    }

    if (isTermsPage) {
      return <TermsOfService />;
    }

    if (isCareerPage) {
      return <Career />;
    }

    return (
      <>
        <Hero />
        <About />
        <Services />
        <Portfolio />
        <Contact />
      </>
    );
  };

  return (
    <div className="App">
      <Navbar />
      <main>{renderPageContent()}</main>
      <Footer />
      {!isStandalonePage && <WhatsAppFloat />}
      {!isStandalonePage && <CallFloat />}
    </div>
  );
}

export default App;
