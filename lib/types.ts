export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

export interface NewsApiResponse {
  status: 'ok' | 'error';
  totalResults?: number;
  articles?: NewsArticle[];
  code?: string;
  message?: string;
}

export interface NewsSource {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string;
  language: string;
  country: string;
}

export interface NewsSourcesResponse {
  status: 'ok' | 'error';
  sources?: NewsSource[];
  code?: string;
  message?: string;
}

export type NewsCategory = 
  | 'business'
  | 'entertainment'
  | 'general'
  | 'health'
  | 'science'
  | 'sports'
  | 'technology';

export type NewsSortBy = 
  | 'relevancy'
  | 'popularity'
  | 'publishedAt'

export interface NewsQueryParams {
  q?: string
  category?: NewsCategory
  country?: string
  language?: string
  sortBy?: NewsSortBy
  page?: string | number
  pageSize?: string | number
  sources?: string
  domains?: string
  from?: string
  to?: string
}
  | 'publishedAt';

export interface NewsQueryParams {
  q?: string;
  category?: NewsCategory;
  page?: number;
  pageSize?: number;
  sortBy?: NewsSortBy;
  language?: string;
  sources?: string;
  domains?: string;
  from?: string;
  to?: string;
}
