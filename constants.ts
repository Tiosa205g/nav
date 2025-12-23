
import { Bookmark, Category } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: '全部链接', icon: 'LayoutGrid' },
  { id: 'dev', name: '开发工具', icon: 'Code' },
  { id: 'design', name: '设计灵感', icon: 'Palette' },
  { id: 'ai', name: '人工智能', icon: 'Cpu' },
  { id: 'social', name: '社交媒体', icon: 'Share2' },
];

export const INITIAL_BOOKMARKS: Bookmark[] = [
  {
    id: '1',
    title: 'GitHub',
    url: 'https://github.com',
    description: '全球领先的软件开发和版本控制平台。',
    category: 'dev',
    tags: ['编程', '开源', '社区'],
  },
  {
    id: '2',
    title: 'Figma',
    url: 'https://figma.com',
    description: '跨平台的在线协作设计工具。',
    category: 'design',
    tags: ['设计', 'UI', 'UX'],
  },
  {
    id: '3',
    title: 'Gemini AI',
    url: 'https://gemini.google.com',
    description: 'Google 开发的新一代多模态大模型。',
    category: 'ai',
    tags: ['AI', 'LLM', '谷歌'],
  },
  {
    id: '4',
    title: 'Dribbble',
    url: 'https://dribbble.com',
    description: '发现全球顶尖的设计作品与创意灵感。',
    category: 'design',
    tags: ['视觉', '排版', '插画'],
  },
];
