
import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Suppliers } from './components/Suppliers';
import { Team } from './components/Team';
import { Expenses } from './components/Expenses';
import { Maintenance } from './components/Maintenance';
import { Reports } from './components/Reports';
import { Purchase } from './components/Purchase';
import { Showroom } from './components/Showroom';
import { POS } from './components/POS';
import { Inspection } from './components/Inspection';
import { Dashboard } from './components/Dashboard';
import { AIAnalysis } from './components/AIAnalysis';
import { Config } from './components/Config';
import { Billing } from './components/Billing';
import { Role, Language, PurchaseRecord } from './types';
import { translations } from './translations';
import { supabase } from './supabase';

const App: React.FC = () => {
  const [role, setRole] = useState<Role>(null);
  const [lang, setLang] = useState<Language>('fr');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [editingCar, setEditingCar] = useState<PurchaseRecord | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showroomConfig, setShowroomConfig] = useState<any>(null);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const fetchGlobalConfig = async () => {
    const { data } = await supabase.from('showroom_config').select('*').eq('id', 1).maybeSingle();
    if (data) setShowroomConfig(data);
  };

  useEffect(() => {
    fetchGlobalConfig();
    const checkAuth = async () => {
      try {
        const savedRole = localStorage.getItem('autolux_role');
        if (savedRole) {
          setRole(savedRole as Role);
          setIsInitializing(false);
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
          const userRole = (profile?.role as Role) || 'admin';
          setRole(userRole);
          localStorage.setItem('autolux_role', userRole);
        } else {
          setRole(null);
        }
      } catch (err) {
        setRole(null);
      } finally {
        setIsInitializing(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setRole(null);
    localStorage.removeItem('autolux_role');
    localStorage.removeItem('autolux_user_name');
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🏎️</div>
        </div>
      </div>
    );
  }

  if (!role) return <Login onLogin={(r) => { setRole(r); fetchGlobalConfig(); }} lang={lang} showroomLogo={showroomConfig?.logo_data} />;

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex">
      <Sidebar
        isOpen={isSidebarOpen}
        lang={lang}
        role={role}
        activeItem={activeItem}
        onSelectItem={(id) => setActiveItem(id)}
        onClose={() => setIsSidebarOpen(false)}
        showroomLogo={showroomConfig?.logo_data}
        showroomName={showroomConfig?.name}
      />

      <div className={`flex-grow flex flex-col transition-all duration-500 ${isSidebarOpen ? (lang === 'ar' ? 'md:mr-[280px]' : 'md:ml-[280px]') : ''}`}>
        <Navbar lang={lang} role={role} onToggleLang={() => setLang(l => l === 'fr' ? 'ar' : 'fr')} onLogout={handleLogout} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
        <main className="p-4 md:p-8 mt-20 h-[calc(100vh-80px)] overflow-hidden">
          <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-6 md:p-10 h-full overflow-y-auto custom-scrollbar">
            {activeItem === 'config' ? <Config lang={lang} onConfigUpdate={fetchGlobalConfig} /> : 
             activeItem === 'dashboard' ? <Dashboard lang={lang} /> :
             activeItem === 'showroom' ? <Showroom lang={lang} onNavigateToPurchase={() => setActiveItem('purchase')} onEdit={(c) => { setEditingCar(c); setActiveItem('purchase'); }} /> :
             activeItem === 'purchase' ? <Purchase lang={lang} initialEditRecord={editingCar} onClearEdit={() => setEditingCar(null)} /> :
             activeItem === 'pos' ? <POS lang={lang} /> :
             activeItem === 'checkin' ? <Inspection lang={lang} /> :
             activeItem === 'suppliers' ? <Suppliers lang={lang} /> :
             activeItem === 'team' ? <Team lang={lang} /> :
             activeItem === 'expenses' ? <Expenses lang={lang} /> :
             activeItem === 'reports' ? <Reports lang={lang} /> :
             activeItem === 'billing' ? <Billing lang={lang} /> :
             activeItem === 'ai' ? <AIAnalysis lang={lang} /> : null
            }
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
