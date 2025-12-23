
import React, { useState, useEffect } from 'react';
import { Bookmark, Category } from '../types';
import { X, Sparkles, Loader2, Save, Terminal, Layers, Plus, Trash2, FolderEdit, RefreshCw, ShieldCheck, Key, Download, Upload } from 'lucide-react';
import { getWebsiteMetadata } from '../geminiService';
import { exportData, importData } from '../services/api';

interface AdminPanelProps {
  categories: Category[];
  onClose: () => void;
  onAdd: (bookmark: Bookmark) => void;
  onAddCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  editingBookmark?: Bookmark;
  onUpdatePassword?: (password: string) => void;
  initialTab?: 'bookmarks' | 'categories' | 'settings';
  defaultCategory?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  categories, onClose, onAdd, onAddCategory, onDeleteCategory,
  editingBookmark, onUpdatePassword, initialTab = 'categories',
  defaultCategory
}) => {
  const [tab, setTab] = useState<'bookmarks' | 'categories' | 'settings'>(initialTab);

  // Bookmark state
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('tools');
  const [tags, setTags] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Circle');

  // Settings state
  const [newPassword, setNewPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState('');
  const [importFeedback, setImportFeedback] = useState('');

  // Load editing bookmark data or initialize with defaults
  useEffect(() => {
    if (editingBookmark) {
      setUrl(editingBookmark.url);
      setTitle(editingBookmark.title);
      setDescription(editingBookmark.description);
      setCategory(editingBookmark.category);
      setTags(editingBookmark.tags.join(', '));
      setTab('bookmarks');
    } else if (initialTab === 'bookmarks') {
      setUrl('');
      setTitle('');
      setDescription('');
      // 分类由用户选择：优先使用 defaultCategory，否则选择第一个非 'all' 的分类
      const firstNonAll = categories.find(c => c.id !== 'all')?.id || 'all';
      setCategory(defaultCategory || firstNonAll);
      setTags('');
    }
  }, [editingBookmark, initialTab, defaultCategory]);

  const handleAiFill = async () => {
    if (!url || !url.startsWith('http')) return;
    setIsAiLoading(true);
    const metadata = await getWebsiteMetadata(url);
    setIsAiLoading(false);
    if (metadata) {
      setTitle(metadata.title);
      setDescription(metadata.description);
      setTags(metadata.tags.join(', '));
      // 分类按用户当前选择为准，不随 AI 返回调整
    }
  };

  const handleBookmarkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !title) return;
    onAdd({
      id: editingBookmark?.id || Date.now().toString(),
      url, title, description, category,
      tags: tags.split(',').map(t => t.trim()).filter(t => t !== ''),
    });
    onClose();
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    onAddCategory({
      id: newCatName.toLowerCase().replace(/\s+/g, '-'),
      name: newCatName,
      icon: newCatIcon
    });
    setNewCatName('');
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !onUpdatePassword) return;
    onUpdatePassword(newPassword);
    setPasswordFeedback('访问凭据已重置');
    setNewPassword('');
    setTimeout(() => setPasswordFeedback(''), 3000);
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexus-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setImportFeedback('导出失败');
      setTimeout(() => setImportFeedback(''), 3000);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      await importData(json);
      setImportFeedback('导入成功，请关闭并重新打开面板查看');
      setTimeout(() => setImportFeedback(''), 4000);
    } catch (err) {
      setImportFeedback('导入失败：文件格式错误');
      setTimeout(() => setImportFeedback(''), 3000);
    } finally {
      e.target.value = '';
    }
  };

  const isEditing = !!editingBookmark;
  const isFormMode = tab === 'bookmarks';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-cyan-500/30 shadow-[0_0_50px_rgba(0,242,255,0.1)] overflow-hidden animate-in zoom-in duration-300">

        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30">
              {tab === 'settings' ? <ShieldCheck className="text-cyan-400" size={24} /> : isFormMode ? (isEditing ? <RefreshCw className="text-cyan-400" size={24} /> : <Plus className="text-cyan-400" size={24} />) : <Terminal className="text-cyan-400" size={24} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                {tab === 'settings' ? '系统安全策略' : isFormMode ? (isEditing ? '更新节点配置' : '部署新节点') : '核心注册表'}
              </h2>
              <div className="flex gap-4 mt-2">
                {!isFormMode ? (
                  <>
                    <button
                      onClick={() => setTab('categories')}
                      className={`mono text-[10px] tracking-widest uppercase pb-1 border-b-2 transition-all ${tab === 'categories' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-500'}`}
                    >
                      分类管理
                    </button>
                    <button
                      onClick={() => setTab('settings')}
                      className={`mono text-[10px] tracking-widest uppercase pb-1 border-b-2 transition-all ${tab === 'settings' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-500'}`}
                    >
                      安全中心
                    </button>
                  </>
                ) : (
                  <span className="mono text-[10px] text-cyan-500 uppercase tracking-[0.2em]">NODE_CONFIGURATION_FLOW</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center">
            <X size={24} />
          </button>
        </div>

        {tab === 'bookmarks' ? (
          <form onSubmit={handleBookmarkSubmit} className="p-8 space-y-6">
            <div className="relative group">
              <label className="block mono text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-[0.2em]">源链接</label>
              <div className="relative">
                <input
                  type="url" required value={url} onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 focus:outline-none focus:border-cyan-500 transition-all mono text-sm text-cyan-100"
                />
                <button
                  type="button" onClick={handleAiFill} disabled={isAiLoading || !url}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 rounded-xl text-xs font-black text-white flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all"
                >
                  {isAiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  智能填充
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mono text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-[0.2em]">标题</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 focus:outline-none focus:border-cyan-500 transition-all mono text-sm text-white" />
              </div>
              <div>
                <label className="block mono text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-[0.2em]">所属分类</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 focus:outline-none focus:border-cyan-500 transition-all mono text-sm text-white appearance-none">
                    {categories.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block mono text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-[0.2em]">描述</label>
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 focus:outline-none focus:border-cyan-500 transition-all mono text-sm text-white resize-none" placeholder="输入链接的元数据摘要..."></textarea>
            </div>

            <div>
              <label className="block mono text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-[0.2em]">安全标签</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="标签1, 标签2, 标签3" className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 focus:outline-none focus:border-cyan-500 transition-all mono text-sm text-white" />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className="w-full py-4 bg-cyan-600 text-white font-black hover:bg-cyan-500 rounded-2xl shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-3 transition-all mono uppercase tracking-widest text-xs">
                {isEditing ? <RefreshCw size={20} /> : <Save size={20} />}
                {isEditing ? '同步配置更改' : '部署至索引库'}
              </button>
            </div>
          </form>
        ) : tab === 'categories' ? (
          <div className="p-8 space-y-8">
            <form onSubmit={handleCategorySubmit} className="space-y-4 p-6 bg-slate-950/50 rounded-3xl border border-slate-800">
              <h3 className="mono text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Plus size={14} /> 初始化新分类
              </h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text" required value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="分类名称"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-cyan-500 transition-all mono text-xs text-white"
                  />
                </div>
                <div className="w-32">
                  <select
                    value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 focus:outline-none focus:border-cyan-500 transition-all mono text-xs text-white"
                  >
                    <option value="Circle">默认</option>
                    <option value="Code">开发</option>
                    <option value="Palette">设计</option>
                    <option value="Cpu">核心</option>
                    <option value="Globe">网络</option>
                    <option value="Zap">动力</option>
                  </select>
                </div>
                <button type="submit" className="px-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl transition-all">
                  <Plus size={20} />
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <h3 className="mono text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">分类注册表</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl group hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-900 text-slate-500 group-hover:text-cyan-400">
                        <FolderEdit size={16} />
                      </div>
                      <span className="mono text-xs uppercase text-slate-300">{cat.name}</span>
                    </div>
                    {cat.id !== 'all' && (
                      <button
                        onClick={() => onDeleteCategory(cat.id)}
                        className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <div className="p-8 bg-slate-950 rounded-[2rem] border border-slate-800 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl"></div>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <Key className="text-cyan-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">重置管理员密码</h3>
                  <p className="text-slate-500 text-xs mono uppercase tracking-wider">Access Credentials Reset</p>
                </div>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div>
                  <label className="block mono text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-[0.2em]">新访问密码</label>
                  <input
                    type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="输入新的安全密钥"
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 px-6 focus:outline-none focus:border-cyan-500 transition-all mono text-sm text-cyan-400"
                  />
                </div>

                {passwordFeedback && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-xs font-bold mono animate-in slide-in-from-top-2">
                    <ShieldCheck size={16} />
                    {passwordFeedback}
                  </div>
                )}

                <button type="submit" className="w-full py-4 bg-cyan-600 text-white font-black hover:bg-cyan-500 rounded-2xl shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-3 transition-all mono uppercase tracking-widest text-xs">
                  更新授权凭据
                </button>
              </form>

              <div className="mt-8 p-4 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                <p className="text-[10px] text-slate-600 leading-relaxed mono">
                  <span className="text-amber-500/50">警告：</span> 密码更改后将立即生效。请确保记住您的新安全密钥，否则可能需要清除浏览器存储以恢复默认设置。
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={handleExport} className="w-full py-3 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl hover:border-cyan-500/30 hover:text-cyan-300 transition flex items-center justify-center gap-2">
                  <Download size={16} /> 导出数据
                </button>
                <label className="w-full py-3 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl hover:border-cyan-500/30 hover:text-cyan-300 transition flex items-center justify-center gap-2 cursor-pointer">
                  <Upload size={16} /> 导入数据
                  <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
                </label>
              </div>

              {importFeedback && (
                <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-300 text-xs mono">
                  {importFeedback}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
