
import React, { useState, useEffect, useMemo } from 'react';
import { Bookmark, Category } from './types';
import { INITIAL_BOOKMARKS, INITIAL_CATEGORIES } from './constants';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BookmarkCard from './components/BookmarkCard';
import AdminPanel from './components/AdminPanel';
import LoginModal from './components/LoginModal';
import { Search, Terminal, Activity, Plus } from 'lucide-react';
import { getState, addOrUpdateBookmark as apiSaveBookmark, deleteBookmark as apiDeleteBookmark, addCategory as apiAddCategory, deleteCategory as apiDeleteCategory, updatePassword as apiUpdatePassword } from './services/api';

const App: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(INITIAL_BOOKMARKS);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [adminPassword, setAdminPassword] = useState<string>('admin');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [adminPanelTab, setAdminPanelTab] = useState<'bookmarks' | 'categories' | 'settings'>('categories');

  // Drag and Drop state
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // 初始化从服务端拉取数据
  useEffect(() => {
    (async () => {
      try {
        const state = await getState();
        setBookmarks(state.bookmarks as Bookmark[]);
        setCategories(state.categories as Category[]);
        setAdminPassword(state.adminPassword);
      } catch (e) {
        console.warn('服务端不可用，使用内置初始数据。', e);
      }
    })();
  }, []);

  const handleCategoryChange = (newCat: string) => {
    if (newCat === activeCategory) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveCategory(newCat);
      setIsTransitioning(false);
    }, 600);
  };

  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b => {
      const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = activeCategory === 'all' || b.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [bookmarks, searchQuery, activeCategory]);

  const handleAddOrUpdateBookmark = async (newBookmark: Bookmark) => {
    try {
      const res = await apiSaveBookmark(newBookmark);
      setBookmarks(res.bookmarks as Bookmark[]);
      setEditingBookmark(null);
    } catch (e) {
      console.error('保存书签失败', e);
    }
  };

  const handleDeleteBookmark = async (id: string) => {
    try {
      const res = await apiDeleteBookmark(id);
      setBookmarks(res.bookmarks as Bookmark[]);
      if (editingBookmark?.id === id) setEditingBookmark(null);
    } catch (e) {
      console.error('删除书签失败', e);
    }
  };

  const handleEditBookmark = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setAdminPanelTab('bookmarks');
    setShowAdminPanel(true);
  };

  const handleAddNewNode = () => {
    setEditingBookmark(null);
    setAdminPanelTab('bookmarks');
    setShowAdminPanel(true);
  };

  const handleOpenAdminPanel = () => {
    setAdminPanelTab('categories');
    setEditingBookmark(null);
    setShowAdminPanel(true);
  };

  const handleAddCategory = async (cat: Category) => {
    try {
      const res = await apiAddCategory(cat);
      setCategories(res.categories as Category[]);
    } catch (e) {
      console.error('新增分类失败', e);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (id === 'all') return;
    try {
      const res = await apiDeleteCategory(id);
      setCategories(res.categories as Category[]);
      setBookmarks(res.bookmarks as Bookmark[]);
      if (activeCategory === id) setActiveCategory('all');
    } catch (e) {
      console.error('删除分类失败', e);
    }
  };

  const handleCloseAdminPanel = () => {
    setShowAdminPanel(false);
    setEditingBookmark(null);
  };

  // Drag and drop handlers
  const handleDragStart = (id: string) => {
    if (!isAdmin) return;
    setDraggedItemId(id);
  };

  const handleDropOnCard = (targetId: string, position: 'before' | 'after') => {
    if (!isAdmin || !draggedItemId || draggedItemId === targetId) {
      setDraggedItemId(null);
      return;
    }

    setBookmarks(prev => {
      const newBookmarks = [...prev];
      const draggedIndex = newBookmarks.findIndex(b => b.id === draggedItemId);
      const [draggedItem] = newBookmarks.splice(draggedIndex, 1);

      const targetIndex = newBookmarks.findIndex(b => b.id === targetId);
      const insertionIndex = position === 'before' ? targetIndex : targetIndex + 1;

      newBookmarks.splice(insertionIndex, 0, draggedItem);
      return newBookmarks;
    });
    setDraggedItemId(null);
  };

  const handleDropOnGrid = (e: React.DragEvent) => {
    if (!isAdmin || !draggedItemId || e.defaultPrevented) return;

    setBookmarks(prev => {
      const newBookmarks = [...prev];
      const draggedIndex = newBookmarks.findIndex(b => b.id === draggedItemId);
      const [draggedItem] = newBookmarks.splice(draggedIndex, 1);
      newBookmarks.push(draggedItem);
      return newBookmarks;
    });
    setDraggedItemId(null);
  };

  return (
    <div className="h-screen w-screen text-slate-100 flex flex-col relative z-10 overflow-hidden preserve-3d">
      <Navbar
        onSearch={setSearchQuery}
        isAdmin={isAdmin}
        onLoginClick={() => setShowLogin(true)}
        onLogout={() => { setIsAdmin(false); setShowAdminPanel(false); }}
        onAdminToggle={handleOpenAdminPanel}
      />

      <div className="flex-1 flex overflow-hidden preserve-3d">
        <Sidebar
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={handleCategoryChange}
        />

        <main
          className="flex-1 overflow-y-auto overflow-x-hidden p-8 md:p-16 relative preserve-3d scroll-smooth custom-scrollbar"
          onDragOver={(e) => isAdmin && e.preventDefault()}
          onDrop={handleDropOnGrid}
        >
          <div className="scanner-line"></div>

          <div className="max-w-7xl mx-auto preserve-3d">
            <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8 preserve-3d pointer-events-none">
              <div style={{ transform: 'translateZ(50px)' }} className="pointer-events-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                    <Terminal size={20} className="text-cyan-400" />
                  </div>
                  <span className="mono text-xs uppercase tracking-[0.5em] text-cyan-400/50 font-black">TIOSA_CORE_V4</span>
                </div>
                <h1 className="text-6xl font-black text-white tracking-tighter flex items-center gap-6">
                  {categories.find(c => c.id === activeCategory)?.name || 'Tiosa 枢纽'}
                  <div className="flex gap-2">
                    <Activity size={24} className="text-cyan-500 animate-pulse" />
                  </div>
                </h1>
              </div>

              <div className="glass-panel p-8 rounded-[2rem] shadow-2xl flex gap-10 pointer-events-auto" style={{ transform: 'translateZ(30px)' }}>
                <div className="text-center">
                  <p className="mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">节点数</p>
                  <p className="text-4xl font-black text-cyan-400">{filteredBookmarks.length.toString().padStart(2, '0')}</p>
                </div>
                <div className="w-[1px] bg-white/10"></div>
                <div className="text-center">
                  <p className="mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">状态</p>
                  <p className="text-4xl font-black text-emerald-400">在线</p>
                </div>
              </div>
            </header>

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 preserve-3d transition-all duration-700 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {filteredBookmarks.map((bookmark, idx) => (
                <div
                  key={bookmark.id}
                  className={isTransitioning ? 'node-exit' : 'node-enter'}
                  style={{ animationDelay: `${idx * 50}ms`, transform: `translateZ(${idx * 5}px)` }}
                >
                  <BookmarkCard
                    bookmark={bookmark}
                    isAdmin={isAdmin}
                    onDelete={handleDeleteBookmark}
                    onEdit={handleEditBookmark}
                    onDragStart={handleDragStart}
                    onDrop={handleDropOnCard}
                  />
                </div>
              ))}

              {isAdmin && !isTransitioning && searchQuery === '' && (
                <div
                  className="node-enter"
                  style={{ animationDelay: `${filteredBookmarks.length * 50}ms` }}
                  onClick={handleAddNewNode}
                >
                  <AddBookmarkPlaceholder />
                </div>
              )}
            </div>

            {filteredBookmarks.length === 0 && !isAdmin && !isTransitioning && (
              <div className="py-40 text-center animate-pulse" style={{ transform: 'translateZ(100px)' }}>
                <div className="text-slate-800 text-9xl font-black opacity-20 mb-4 select-none">NULL</div>
                <p className="mono text-xl text-slate-500 uppercase tracking-[0.3em]">未检测到数据包</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {showLogin && (
        <LoginModal
          correctPassword={adminPassword}
          onClose={() => setShowLogin(false)}
          onSuccess={() => { setIsAdmin(true); setShowLogin(false); }}
        />
      )}

      {showAdminPanel && (
        <AdminPanel
          categories={categories}
          onClose={handleCloseAdminPanel}
          onAdd={handleAddOrUpdateBookmark}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          editingBookmark={editingBookmark || undefined}
          onUpdatePassword={async (pwd) => {
            try {
              const res = await apiUpdatePassword(pwd);
              setAdminPassword(res.adminPassword);
            } catch (e) {
              console.error('更新密码失败', e);
            }
          }}
          initialTab={adminPanelTab}
          defaultCategory={activeCategory !== 'all' ? activeCategory : undefined}
        />
      )}
    </div>
  );
};

const AddBookmarkPlaceholder: React.FC = () => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = React.useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRotate({
      x: (y - rect.height / 2) / 10,
      y: (rect.width / 2 - x) / 10,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRotate({ x: 0, y: 0 })}
      style={{
        transform: `perspective(1200px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}
      className="group relative h-[320px] w-full glass-panel rounded-[2.5rem] border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/50 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-cyan-500/5 preserve-3d"
    >
      <div className="w-20 h-20 rounded-full bg-slate-900 border border-cyan-500/30 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,242,255,0.2)] transition-all">
        <Plus size={40} className="text-cyan-400" />
      </div>
      <div className="text-center">
        <p className="text-white font-black tracking-widest uppercase text-sm">部署新节点</p>
        <p className="mono text-[10px] text-slate-500 uppercase tracking-widest mt-1">Deploy New Node</p>
      </div>
    </div>
  );
};

export default App;
