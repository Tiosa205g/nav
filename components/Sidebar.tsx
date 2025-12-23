
import React, { useState, useRef } from 'react';
import { Category } from '../types';
import * as Icons from 'lucide-react';

interface SidebarProps {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ categories, activeCategory, setActiveCategory }) => {
  return (
    <aside className="w-72 glass-panel border-r border-white/5 hidden lg:flex flex-col p-8 space-y-10 preserve-3d">
      <div>
        <h3 className="mono text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 px-4 flex items-center justify-between">
          <span>索引系统</span>
          <div className="h-[1px] w-12 bg-slate-800"></div>
        </h3>
        <div className="space-y-4 preserve-3d">
          {categories.map((cat) => (
            <CategoryItem 
              key={cat.id}
              cat={cat}
              isActive={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto">
        <div className="p-6 rounded-[2rem] bg-slate-950 border border-slate-800/80 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-cyan-400">
              <Icons.Zap size={18} className="animate-pulse" />
              <p className="mono text-[11px] font-bold uppercase tracking-[0.2em]">核心同步率</p>
            </div>
            <div className="space-y-3">
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 w-[84%] relative">
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const CategoryItem: React.FC<{ cat: Category; isActive: boolean; onClick: () => void }> = ({ cat, isActive, onClick }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const itemRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotate({
      x: (y - centerY) / 4,
      y: (centerX - x) / 4,
    });
  };

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  // @ts-ignore
  const IconComponent = Icons[cat.icon as keyof typeof Icons] || Icons.HelpCircle;

  return (
    <button
      ref={itemRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) ${isActive ? 'translateZ(20px)' : ''}`,
        transition: rotate.x === 0 ? 'transform 0.5s ease-out' : 'none',
      }}
      className={`group relative w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 preserve-3d ${
        isActive 
          ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/40 shadow-[0_10px_30px_rgba(0,242,255,0.15)]' 
          : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
      }`}
    >
      <div 
        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-all preserve-3d"
        style={{ transform: 'translateZ(10px)' }}
      >
        <IconComponent size={20} />
      </div>
      <span className="mono text-[13px] uppercase tracking-widest preserve-3d" style={{ transform: 'translateZ(5px)' }}>
        {cat.name}
      </span>
      {isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#00f2ff] animate-pulse"></div>
      )}
    </button>
  );
};

export default Sidebar;
