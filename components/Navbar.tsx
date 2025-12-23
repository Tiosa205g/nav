
import React from 'react';
import { Search, Cpu, LogOut, Settings, Shield } from 'lucide-react';

interface NavbarProps {
  onSearch: (query: string) => void;
  isAdmin: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
  onAdminToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch, isAdmin, onLoginClick, onLogout, onAdminToggle }) => {
  return (
    <nav className="h-20 glass-panel border-b border-white/5 sticky top-0 z-50 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-1 bg-cyan-500 rounded-xl blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-12 h-12 bg-slate-900 border border-cyan-500/30 rounded-xl flex items-center justify-center">
            <Cpu className="text-cyan-400" size={26} />
          </div>
        </div>
        <div className="hidden sm:block">
          <span className="text-xl font-black text-white tracking-tighter">
            TIOSA<span className="text-cyan-400">NAV</span>
          </span>
          <div className="flex items-center gap-1.5">
            <span className="block h-1 w-1 rounded-full bg-emerald-500"></span>
            <span className="mono text-[9px] text-emerald-500 uppercase tracking-widest font-bold">系统在线</span>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-6">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="快速检索数据库..." 
              className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:border-cyan-500/50 transition-all mono text-sm placeholder:text-slate-600 text-cyan-50"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isAdmin ? (
          <>
            <button 
              onClick={onAdminToggle}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-900 transition-all hidden md:flex items-center gap-2"
            >
              <Settings size={18} />
              <span className="mono text-xs font-bold uppercase">控制台</span>
            </button>
            <button 
              onClick={onLogout}
              className="p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-500 hover:bg-red-950/40 transition-all"
              title="登出"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <button 
            onClick={onLoginClick}
            className="group relative flex items-center gap-2 py-2.5 px-6 rounded-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700"></div>
            <div className="absolute inset-0 bg-slate-950 opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <Shield className="relative text-white z-10" size={18} />
            <span className="relative text-white font-bold text-sm tracking-wide z-10">身份验证</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
