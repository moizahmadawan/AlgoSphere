import { useState, useEffect } from 'react';
import type { Route } from '@/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Landing } from '@/pages/Landing';
import { Dashboard } from '@/pages/Dashboard';
import { SortingLab } from '@/pages/SortingLab';
import { GraphLab } from '@/pages/GraphLab';
import { SchedulingLab } from '@/pages/SchedulingLab';
import { Exercises } from '@/pages/Exercises';

function App() {
  const [route, setRoute] = useState<Route>('home');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [route]);

  return (
    <div className="min-h-screen flex flex-col bg-ink-base">
      <Header current={route} onNavigate={setRoute} />
      <main className="flex-1">
        {route === 'home' && <Landing onNavigate={setRoute} />}
        {route === 'dashboard' && <Dashboard onNavigate={setRoute} />}
        {route === 'sorting' && <SortingLab />}
        {route === 'graphs' && <GraphLab />}
        {route === 'scheduling' && <SchedulingLab />}
        {route === 'exercises' && <Exercises />}
      </main>
      <Footer />
    </div>
  );
}

export default App;
