
import React, { useState } from 'react';
import { X, Lock, ShieldAlert, Zap } from 'lucide-react';

interface LoginModalProps {
  correctPassword: string;
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ correctPassword, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) onSuccess();
    else setError('认证失败：拒绝访问');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
      <div className="bg-slate-900 w-full max-w-md rounded-[3rem] border-2 border-slate-800 shadow-[0_0_100px_rgba(6,182,212,0.1)] p-10 relative overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
        {/* Glowing orb background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <button onClick={onClose} className="absolute right-8 top-8 text-slate-500 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="text-center relative z-10">
          <div className="w-20 h-20 bg-slate-950 border border-cyan-500/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-cyan-500/10">
            <Lock className="text-cyan-400" size={36} />
          </div>

          <h2 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">身份验证</h2>
          <p className="mono text-[10px] text-slate-500 uppercase tracking-[0.3em] mb-10">需要验证管理员权限</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500/5 blur-xl rounded-2xl"></div>
              <input 
                type="password" autoFocus required placeholder="••••••••"
                className={`relative w-full bg-slate-950 border-2 ${error ? 'border-red-500/50' : 'border-slate-800 focus:border-cyan-500/50'} rounded-2xl py-5 px-6 focus:outline-none transition-all mono text-center text-xl text-cyan-400 tracking-[0.5em] placeholder:tracking-normal placeholder:text-slate-700`}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
              />
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold mono bg-red-500/10 py-3 rounded-xl border border-red-500/20 animate-pulse">
                <ShieldAlert size={14} />
                {error}
              </div>
            )}

            <button type="submit" className="w-full py-5 px-6 rounded-2xl bg-cyan-600 text-white font-black hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-600/20 mono uppercase tracking-widest text-xs flex items-center justify-center gap-3 group">
              解密并进入系统
              <Zap size={16} className="group-hover:animate-pulse" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
