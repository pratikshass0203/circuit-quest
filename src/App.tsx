import { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Problem from './components/Problem';
import Solution from './components/Solution';
import CurriculumMap from './components/CurriculumMap';
import GameModules from './components/GameModules';
import WaveformShowcase from './components/WaveformShowcase';
import EngagementEngine from './components/EngagementEngine';
import Market from './components/Market';
import Competitive from './components/Competitive';
import Technology from './components/Technology';
import Pricing from './components/Pricing';
import Roadmap from './components/Roadmap';
import CTA from './components/CTA';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import InstallPrompt from './components/InstallPrompt';

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0a1628] text-white overflow-x-hidden">
        <Navbar onAuthClick={handleAuthClick} />
        <main>
          <Hero />
          <Problem />
          <Solution />
          <CurriculumMap />
          <GameModules />
          <WaveformShowcase />
          <EngagementEngine />
          <Market />
          <Competitive />
          <Technology />
          <Pricing />
          <Roadmap />
          <CTA />
        </main>
        <Footer />
        <InstallPrompt />
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} mode={authMode} />
      </div>
    </AuthProvider>
  );
}

export default App;
