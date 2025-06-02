import { NextResponse } from "next/server"
import { config } from "./config"
import { NewsApiResponse } from "./types"

interface CacheItem {
  data: NewsApiResponse
  timestamp: number
}

interface RateLimitInfo {
  lastRequest: number
  requestsToday: number
  dayStarted: number
}

interface QueuedRequest {
  url: string
  options: RequestInit
  cacheKey?: string
  resolve: (value: any) => void
  reject: (error: Error) => void
}

const cache = new Map<string, CacheItem>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const MAX_RETRIES = 3
const REQUEST_QUEUE: QueuedRequest[] = []
let isProcessingQueue = false

// Rate limiting tracker
const rateLimit: RateLimitInfo = {
  lastRequest: 0,
  requestsToday: 0,
  dayStarted: Date.now()
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function resetRateLimitIfNeeded() {
  const now = Date.now()
  const oneDayInMs = 24 * 60 * 60 * 1000
  
  if (now - rateLimit.dayStarted >= oneDayInMs) {
    rateLimit.requestsToday = 0
    rateLimit.dayStarted = now
  }
}

async function checkRateLimit() {
  resetRateLimitIfNeeded()

  const now = Date.now()
  const timeSinceLastRequest = now - rateLimit.lastRequest
  
  // Ensure at least 1 second between requests
  if (timeSinceLastRequest < 1000) {
    await delay(1000 - timeSinceLastRequest)
  }

  if (rateLimit.requestsToday >= config.newsApi.rateLimit.requestsPerDay) {
    throw new Error("Daily API rate limit exceeded")
  }

  rateLimit.lastRequest = Date.now()
  rateLimit.requestsToday++
}

function validateApiResponse(data: any): NewsApiResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid API response format')
  }

  if (data.status === 'error') {
    throw new Error(data.message || 'API returned an error')
  }

  if (data.status !== 'ok') {
    throw new Error('Invalid API response status')
  }

  if (Array.isArray(data.articles)) {
    data.articles = data.articles.filter(article => 
      article &&
      typeof article.title === 'string' &&
      typeof article.description === 'string' &&
      article.title !== '[Removed]' &&
      article.description !== '[Removed]'
    )
  }

  return data as NewsApiResponse
}

async function makeRequest(url: string, options: RequestInit = {}, cacheKey?: string): Promise<NewsApiResponse> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // Add default headers
      const headers = {
        "User-Agent": "NewsHub/1.0",
        "X-Api-Key": config.newsApi.key,
        ...options.headers,
      }

      // Exponential backoff delay
      if (attempt > 0) {
        await delay(Math.pow(2, attempt) * 1000)
      }

      const response = await fetch(url, { ...options, headers })

      if (response.status === 429) {
        // Get retry-after header or use default backoff
        const retryAfter = parseInt(response.headers.get("retry-after") || "5", 10)
        await delay(retryAfter * 1000)
        continue
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const validatedData = validateApiResponse(data)

      // Cache successful response
      if (cacheKey) {
        cache.set(cacheKey, {
          data: validatedData,
          timestamp: Date.now()
        })
      }

      return validatedData
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred')
      if (attempt === MAX_RETRIES - 1) {
        throw lastError
      }
    }
  }

  throw lastError || new Error("Maximum retries exceeded")
}

async function processQueue() {
  if (isProcessingQueue || REQUEST_QUEUE.length === 0) return
  
  isProcessingQueue = true

  try {
    const request = REQUEST_QUEUE.shift()
    if (!request) return

    try {
      await checkRateLimit()
      const result = await makeRequest(request.url, request.options, request.cacheKey)
      request.resolve(result)
    } catch (error) {
      request.reject(error instanceof Error ? error : new Error('Unknown error occurred'))
    }
  } finally {
    isProcessingQueue = false
    // Process next request if queue not empty
    if (REQUEST_QUEUE.length > 0) {
      setTimeout(processQueue, 1100) // Ensure rate limit compliance
    }
  }
}

// Start queue processing
setInterval(() => {
  if (REQUEST_QUEUE.length > 0) {
    void processQueue()
  }
}, 1100)

export async function fetchWithRetry(url: string, options: RequestInit = {}, cacheKey?: string): Promise<NewsApiResponse> {
  // Check cache first
  if (cacheKey) {
    const cachedData = cache.get(cacheKey)
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.data
    }
  }

  // Add request to queue and wait for result
  return new Promise((resolve, reject) => {
    REQUEST_QUEUE.push({ url, options, cacheKey, resolve, reject })
    // Start processing if not already running
    if (!isProcessingQueue) {
      void processQueue()
    }
  })
}

export function handleApiError(error: any) {
  console.error("API Error:", error)

  if (error.message.includes("status: 429") || error.message.includes("rate limit exceeded")) {
    const retryAfter = Math.ceil((24 * 60 * 60 * 1000 - (Date.now() - rateLimit.dayStarted)) / 1000)
    return NextResponse.json(
      { 
        error: "Rate limit reached. Please try again later.",
        retryAfter
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString()
        }
      }
    )
  }

  if (error.message.includes("status: 401")) {
    console.error("Invalid API key. Please check your NewsAPI configuration.")
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    )
  }

  return NextResponse.json(
    { error: "An error occurred while fetching the data." },
    { status: 500 }
  )
}
