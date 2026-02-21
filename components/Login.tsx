
import React, { useState } from 'react';
import { CustomButton } from './CustomButton';
import { Role, Language } from '../types';
import { translations } from '../translations';
import { supabase } from '../supabase';

interface LoginProps {
  onLogin: (role: Role) => void;
  lang: Language;
  showroomLogo?: string;
  showroomName?: string;
  showroomSlogan?: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, lang, showroomLogo, showroomName, showroomSlogan }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: workerData } = await supabase.from('workers').select('id, role, type, fullname, username').or(`username.eq."${identifier}",email.eq."${identifier}"`).eq('password', password).maybeSingle();
      if (workerData) {
        // Use role if available, otherwise fall back to type
        const userRole = (workerData.role || workerData.type || 'worker').toLowerCase();
        localStorage.setItem('autolux_role', userRole);
        localStorage.setItem('autolux_user_name', workerData.fullname || workerData.username);
        onLogin(userRole as Role);
        return;
      }

      let loginEmail = identifier;
      if (!identifier.includes('@')) {
        const { data: profileLookup } = await supabase.from('profiles').select('email, username').eq('username', identifier).maybeSingle();
        if (profileLookup?.email) loginEmail = profileLookup.email;
        else throw new Error("Identifiants invalides.");
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail, password: password });
      if (authError) throw new Error("Identifiants invalides.");

      if (data.user) {
        const { data: profileData } = await supabase.from('profiles').select('role, username').eq('id', data.user.id).maybeSingle();
        const role = (profileData?.role as Role) || 'admin';
        localStorage.setItem('autolux_role', role);
        localStorage.setItem('autolux_user_name', profileData?.username || identifier);
        onLogin(role);
      }
    } catch (err: any) {
      setError(err.message || "Erreur de connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
      <div className="w-full max-w-[440px] z-10 p-4">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[3rem] shadow-2xl p-12 space-y-10 animate-in zoom-in-95 duration-700">
          <div className="text-center">
            <div className="h-24 w-24 rounded-[2.5rem] bg-slate-900 mx-auto mb-6 flex items-center justify-center shadow-xl overflow-hidden">
              {showroomLogo ? <img src={showroomLogo} className="w-full h-full object-cover" /> : <span className="text-4xl">🏎️</span>}
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900">{showroomName || 'AutoLux'}</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">{showroomSlogan || 'Management Cloud'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-4 rounded-2xl text-[10px] font-black uppercase text-center bg-red-50 text-red-600">⚠️ {error}</div>}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.username}</label>
              <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full bg-slate-50 px-8 py-5 rounded-[2rem] border border-slate-100 outline-none focus:border-blue-500 transition-all font-bold" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{t.password}</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 px-8 py-5 rounded-[2rem] border border-slate-100 outline-none focus:border-blue-500 transition-all font-bold" required />
            </div>
            <button disabled={isLoading} className="w-full custom-gradient-btn py-6 rounded-[2rem] text-white font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all mt-4">{isLoading ? "Ouverture de session..." : t.loginBtn}</button>
          </form>
        </div>
      </div>
    </div>
  );
};
