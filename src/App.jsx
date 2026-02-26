import { useEffect, useState } from 'react';
import AOS from 'aos';
import useSEO from './hooks/useSEO';
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
import OurTeam from './components/OurTeam';

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

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
    });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [currentRoute]);

  const isPrivacyPage     = currentRoute === 'privacy-policy';
  const isTermsPage       = currentRoute === 'terms-of-service';
  const isCareerPage      = currentRoute === 'career';
  const isOurTeamPage     = currentRoute === 'our-team';
  const isStandalonePage  = isPrivacyPage || isTermsPage || isCareerPage || isOurTeamPage;

  // ── Per-route SEO ──────────────────────────────────────────────────────
  const seoMap = {
    'privacy-policy': {
      title:       'Privacy Policy',
      description: 'Read the DigitalTechSolution privacy policy to understand how we collect, use and protect your personal data.',
      path:        '/privacy-policy',
    },
    'terms-of-service': {
      title:       'Terms of Service',
      description: 'Review the terms and conditions governing the use of DigitalTechSolution services and our website.',
      path:        '/terms-of-service',
    },
    career: {
      title:       'Careers',
      description: 'Join the DigitalTechSolution team. Explore open roles in web development, app development, and digital marketing.',
      path:        '/career',
    },
    'our-team': {
      title:       'Our Team',
      description: 'Meet the passionate designers, developers, and strategists behind DigitalTechSolution.',
      path:        '/our-team',
    },
    default: {
      title:       'Professional Web, App & Software Development',
      description: 'DigitalTechSolution builds fast, SEO-ready websites, mobile apps, and custom software that grow your business. Get a free consultation today.',
      path:        '/',
    },
  };

  const currentSEO = seoMap[currentRoute] ?? seoMap.default;
  useSEO(currentSEO);

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

    if (isOurTeamPage) {
      return <OurTeam />;
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
