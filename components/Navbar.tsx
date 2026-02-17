
import React from 'react';
import { Language, Role } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  lang: Language;
  role: Role;
  onToggleLang: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ lang, role, onToggleLang, onLogout, onToggleSidebar, isSidebarOpen }) => {
  const t = translations[lang];
  const isRtl = lang === 'ar';

  return (
    <header
      className={`fixed top-0 right-0 left-0 h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 z-30 transition-all duration-500 ${
        isSidebarOpen ? (isRtl ? 'md:pr-[280px]' : 'md:pl-[280px]') : ''
      }`}
    >
      <div className="h-full px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-2 md:space-x-4 gap-2">
          <button
            onClick={onToggleSidebar}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 border border-slate-100 transition-all duration-300"
          >
            <span className="text-xl">{isSidebarOpen ? '🪁' : '☰'}</span>
          </button>
          <div className="hidden sm:block">
            <h2 className="text-lg font-bold text-slate-800 capitalize leading-none mb-0.5">
              {role} Portal
            </h2>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
              Live Connection
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 md:space-x-6 gap-2">
          <button
            onClick={onToggleLang}
            className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md font-bold text-sm transition-all duration-300"
          >
            {t.changeLang}
          </button>

          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center space-x-2 md:space-x-3 gap-2">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-black text-slate-800 uppercase tracking-tighter leading-none">{role}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">Online Now</p>
            </div>
            <div className="h-10 w-10 md:h-11 md:w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-blue-500/20 border-2 border-white ring-1 ring-slate-100">
              {role?.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={onLogout}
              className="p-3 rounded-2xl hover:bg-red-50 text-red-500 hover:shadow-lg hover:shadow-red-200/50 transition-all duration-300"
              title={t.logout}
            >
              🚪
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
