
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  icon?: string;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface WebsiteMetadata {
  title: string;
  description: string;
  tags: string[];
  // 分类不再由 AI 决定，按用户选择为准
  category?: string;
}
