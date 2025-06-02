export const config = {
  newsApi: {
    key: process.env.NEWS_API_KEY!,
    baseUrl: "https://newsapi.org/v2",
    endpoints: {
      everything: "/everything",
      topHeadlines: "/top-headlines",
      sources: "/top-headlines/sources"
    },
    defaultParams: {
      language: "en",
      pageSize: "20",
      sortBy: "publishedAt"
    },
    rateLimit: {
      requestsPerDay: 100, // Free tier limit
      requestsPerSecond: 1,
      maxRetries: 3,
      cacheDuration: 5 * 60 * 1000 // 5 minutes
    }
  }
} as const
