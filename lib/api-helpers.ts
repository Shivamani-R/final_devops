import { NewsQueryParams, NewsCategory, NewsSortBy } from "./types"
import { config } from "./config"

const { baseUrl, endpoints } = config.newsApi

export function buildApiUrl(endpoint: keyof typeof endpoints, params: NewsQueryParams): string {
  const searchParams = new URLSearchParams()
  
  // Add all valid params to the URL
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString())
    }
  })

  // Always append API key
  searchParams.append('apiKey', config.newsApi.key)

  return `${baseUrl}${endpoints[endpoint]}?${searchParams.toString()}`
}

export function formatNewsQueryParams(params: Partial<NewsQueryParams>): NewsQueryParams {
  return {
    ...config.newsApi.defaultParams,
    ...params,
    page: params.page?.toString() || "1",
    pageSize: params.pageSize?.toString() || "20"
  }
}

export function validateDate(date: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(date)) return false

  const parsedDate = new Date(date)
  return !isNaN(parsedDate.getTime())
}

export function validateCategory(category: string): boolean {
  return ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'].includes(category)
}

export function validateSortBy(sortBy: string): boolean {
  return ['relevancy', 'popularity', 'publishedAt'].includes(sortBy)
}

export function validateLanguage(language: string): boolean {
  return ['ar', 'de', 'en', 'es', 'fr', 'he', 'it', 'nl', 'no', 'pt', 'ru', 'sv', 'zh'].includes(language)
}

export function validatePageSize(size: number): boolean {
  return size >= 1 && size <= 100
}

export function validatePage(page: number): boolean {
  return page >= 1
}
