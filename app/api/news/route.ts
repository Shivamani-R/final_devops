import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { fetchWithRetry, handleApiError } from "@/lib/api-utils"
import { buildApiUrl, formatNewsQueryParams, validateCategory, validateSortBy, validateLanguage, validateDate } from "@/lib/api-helpers"
import { config } from "@/lib/config"
import type { NewsQueryParams, NewsCategory, NewsSortBy } from "@/lib/types"

const { endpoints } = config.newsApi

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    
    // Get raw values from search params
    const categoryParam = searchParams.get("category")
    const sortByParam = searchParams.get("sortBy")
    
    // Validate and format params
    const params: Partial<NewsQueryParams> = {
      q: searchParams.get("q") || undefined,
      category: categoryParam ? (categoryParam as NewsCategory) : undefined,
      language: searchParams.get("language") || undefined,
      sortBy: sortByParam ? (sortByParam as NewsSortBy) : undefined,
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
      sources: searchParams.get("sources") || undefined,
      domains: searchParams.get("domains") || undefined,
      from: searchParams.get("from") || undefined,
      to: searchParams.get("to") || undefined
    }

    // Validate date formats if provided
    if (params.from && !validateDate(params.from)) {
      return NextResponse.json({ error: "Invalid 'from' date format. Use YYYY-MM-DD" }, { status: 400 })
    }
    if (params.to && !validateDate(params.to)) {
      return NextResponse.json({ error: "Invalid 'to' date format. Use YYYY-MM-DD" }, { status: 400 })
    }

    // Validate category if provided
    if (params.category && !validateCategory(params.category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    // Validate sortBy if provided
    if (params.sortBy && !validateSortBy(params.sortBy)) {
      return NextResponse.json({ error: "Invalid sortBy value" }, { status: 400 })
    }

    // Validate language if provided
    if (params.language && !validateLanguage(params.language)) {
      return NextResponse.json({ error: "Invalid language code" }, { status: 400 })
    }

    // Format and validate all parameters
    const formattedParams = formatNewsQueryParams(params)

    // Choose endpoint based on search query presence
    const endpoint = params.q ? 'everything' : 'topHeadlines'
    
    // Add country for top headlines if not searching
    if (!params.q) {
      formattedParams.country = "us"
    }

    // Build URL and make request
    const url = buildApiUrl(endpoint, formattedParams)
    const cacheKey = `news-${params.q || params.category || 'top'}-${formattedParams.page}-${formattedParams.pageSize}`
    
    const data = await fetchWithRetry(url, {}, cacheKey)
    return NextResponse.json(data)
  } catch (error) {
    return handleApiError(error)
  }
}
