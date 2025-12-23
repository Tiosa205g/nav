
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Bookmark } from '../types';
import { ExternalLink, Trash2, Edit3, Cpu, Fingerprint, ChevronLeft, ChevronRight } from 'lucide-react';

interface BookmarkCardProps {
  bookmark: Bookmark;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDragStart?: (id: string) => void;
  onDrop?: (targetId: string, position: 'before' | 'after') => void;
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, isAdmin, onDelete, onEdit, onDragStart, onDrop }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  const hitBoxRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  
  // 检查滚动状态和溢出
  const updateScrollState = () => {
    if (tagsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tagsRef.current;
      const overflow = scrollWidth > clientWidth + 1;
      setHasOverflow(overflow);
      if (overflow) {
        setCanScrollLeft(scrollLeft > 5);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
      } else {
        setCanScrollLeft(false);
        setCanScrollRight(false);
      }
    }
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [bookmark.tags]);

  // 原生事件监听处理滚动拦截与转化
  useEffect(() => {
    const tagsEl = tagsRef.current;
    if (!tagsEl) return;

    const handleNativeWheel = (e: WheelEvent) => {
      if (hasOverflow) {
        // 阻止纵向滚动穿透到主页面
        e.preventDefault();
        e.stopPropagation();
        
        // 将垂直滚轮量应用到横向滚动
        tagsEl.scrollLeft += e.deltaY || e.detail;
        updateScrollState();
      }
    };

    const handleNativeScroll = () => {
      updateScrollState();
    };

    tagsEl.addEventListener('wheel', handleNativeWheel, { passive: false });
    tagsEl.addEventListener('scroll', handleNativeScroll);
    
    return () => {
      tagsEl.removeEventListener('wheel', handleNativeWheel);
      tagsEl.removeEventListener('scroll', handleNativeScroll);
    };
  }, [hasOverflow]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hitBoxRef.current || dropPosition || isDragging) return;
    const rect = hitBoxRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = (y - rect.height / 2) / 10;
    const rotateY = (rect.width / 2 - x) / 10;
    setRotate({ x: rotateX, y: rotateY });
  };

  const urlObj = useMemo(() => {
    try {
      return new URL(bookmark.url);
    } catch {
      return null;
    }
  }, [bookmark.url]);

  const [iconStage, setIconStage] = useState(0);
  const faviconCandidates = useMemo(() => {
    const list: string[] = [];
    if (urlObj) {
      list.push(`${urlObj.origin}/favicon.ico`);
      list.push(`https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`);
    }
    list.push(`https://ui-avatars.com/api/?name=${encodeURIComponent(bookmark.title)}&background=0d1117&color=00f2ff`);
    return list;
  }, [urlObj, bookmark.title]);
  const faviconUrl = faviconCandidates[Math.min(iconStage, faviconCandidates.length - 1)];

  const handleDragStartLocal = (e: React.DragEvent) => {
    if (!isAdmin || !onDragStart) return;
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', bookmark.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(bookmark.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAdmin || !hitBoxRef.current) return;
    e.preventDefault();
    const rect = hitBoxRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const threshold = rect.width / 2;
    const position = mouseX < threshold ? 'before' : 'after';
    if (dropPosition !== position) setDropPosition(position);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!hitBoxRef.current?.contains(e.relatedTarget as Node)) {
      setDropPosition(null);
    }
  };

  const handleDropLocal = (e: React.DragEvent) => {
    if (!isAdmin || !onDrop || !dropPosition) return;
    e.preventDefault();
    const pos = dropPosition;
    setDropPosition(null);
    onDrop(bookmark.id, pos);
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  // 动态计算遮罩样式
  const getDynamicMask = () => {
    if (!hasOverflow) return {};
    const leftColor = canScrollLeft ? 'transparent' : 'black';
    const rightColor = canScrollRight ? 'transparent' : 'black';
    const mask = `linear-gradient(to right, ${leftColor}, black 15%, black 85%, ${rightColor})`;
    return {
      maskImage: mask,
      WebkitMaskImage: mask
    };
  };

  return (
    <div
      ref={hitBoxRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropLocal}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      draggable={isAdmin}
      onDragStart={handleDragStartLocal}
      onDragEnd={handleDragEnd}
      className={`relative h-[320px] w-full ${isAdmin ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div
        style={{
          transform: `perspective(1200px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) ${
            dropPosition ? `translateX(${dropPosition === 'before' ? '12px' : '-12px'}) scale(0.97)` : (isHovered && !isDragging ? 'scale(1.02) translateZ(20px)' : 'scale(1)')
          }`,
          transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease, border-color 0.3s ease',
          opacity: isDragging ? 0.2 : 1,
          filter: isDragging ? 'blur(8px) grayscale(100%)' : 'none',
        }}
        className={`group relative h-full glass-panel rounded-[2.5rem] p-8 border transition-all preserve-3d overflow-hidden pointer-events-none ${
          dropPosition 
            ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_40px_rgba(0,242,255,0.2)]' 
            : 'border-white/5 hover:border-cyan-500/30 shadow-2xl'
        } ${isDragging ? 'border-dashed border-cyan-500/50' : ''}`}
      >
        <div className="absolute inset-0 pointer-events-none z-[100]">
           {dropPosition && (
            <div className={`absolute top-0 bottom-0 w-1.5 bg-cyan-400 shadow-[0_0_30px_#00f2ff] animate-pulse ${dropPosition === 'before' ? 'left-0' : 'right-0'}`}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border-2 border-cyan-400 p-1.5 rounded-full shadow-[0_0_15px_rgba(0,242,255,0.5)]">
                {dropPosition === 'before' ? <ChevronLeft size={12} className="text-cyan-400" /> : <ChevronRight size={12} className="text-cyan-400" />}
              </div>
            </div>
          )}
        </div>

        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(0,242,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,255,0.1)_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="h-full flex flex-col preserve-3d transition-all duration-500 pointer-events-auto">
          <div className="flex justify-between items-start mb-6 preserve-3d">
            <div 
              className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-3 transition-all duration-500 group-hover:border-cyan-400/50"
              style={{ transform: isHovered && !isDragging ? 'translateZ(60px)' : 'translateZ(10px)' }}
            >
              <img 
                src={faviconUrl}
                alt={bookmark.title}
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,242,255,0.3)]"
                onError={() => setIconStage(s => s + 1)}
              />
            </div>

            <div className="flex gap-2 preserve-3d" style={{ transform: 'translateZ(50px)' }}>
              {isAdmin && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(bookmark); }}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                      isHovered ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                    title="修改节点配置"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(bookmark.id); }}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-950/20 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
              <a 
                href={bookmark.url} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-lg"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          <div className="mt-auto preserve-3d" style={{ transform: isHovered && !isDragging ? 'translateZ(40px)' : 'translateZ(5px)' }}>
            <div className="flex items-center gap-2 mb-2">
               <Cpu size={12} className="text-cyan-500/40" />
               <span className="mono text-[9px] text-slate-600 font-bold tracking-widest uppercase">NODE::{bookmark.id.slice(0, 8)}</span>
            </div>
            
            <a 
              href={bookmark.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="block group/title"
            >
              <h3 className="text-xl font-black text-white group-hover:text-cyan-300 group-hover/title:underline decoration-cyan-500/30 underline-offset-4 transition-all tracking-tighter mb-2 line-clamp-1">
                {bookmark.title}
              </h3>
            </a>
            
            <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 h-9 group-hover:text-slate-200 transition-colors">
              {bookmark.description}
            </p>
          </div>

          <div 
            className="mt-4 pt-4 border-t border-white/5 relative preserve-3d" 
            style={{ transform: isHovered && !isDragging ? 'translateZ(20px)' : 'translateZ(0)' }}
          >
            <div 
              ref={tagsRef}
              style={getDynamicMask()}
              className="flex gap-2 overflow-x-auto pb-2 no-scrollbar transition-all scroll-smooth"
            >
              {bookmark.tags.map(tag => (
                <span 
                  key={tag} 
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 mono text-[9px] uppercase font-black flex items-center gap-1.5 shrink-0 transition-colors hover:text-cyan-400 hover:border-cyan-500/30"
                >
                  <Fingerprint size={10} className="text-cyan-900/40" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 scale-x-0 group-hover:scale-x-100"></div>
      </div>
    </div>
  );
};

export default BookmarkCard;
