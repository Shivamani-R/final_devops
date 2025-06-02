import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { fetchWithRetry, handleApiError } from "@/lib/api-utils"
import { buildApiUrl } from "@/lib/api-helpers"
import type { NewsQueryParams, NewsArticle } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") ?? "all"
    const page = searchParams.get("page") ?? "1"
    const pageSize = searchParams.get("pageSize") ?? "12"

    // Get category-specific search queries
    const queries = getCategoryQueries(category)
    
    // Fetch articles for each query in parallel
    const responses = await Promise.all(
      queries.map(async (q) => {
        const params: NewsQueryParams = {
          q,
          language: "en",
          sortBy: "publishedAt",
          page,
          pageSize
        }

        const url = buildApiUrl("everything", params)
        return fetchWithRetry(url, {}, `student-${category}-${q}-${page}`)
      })
    )

    // Merge and deduplicate articles
    const articles = responses.flatMap(response => 
      response?.articles || []
    ).filter((article): article is NewsArticle => {
      if (!article) return false
      return (
        typeof article.title === 'string' &&
        typeof article.description === 'string' &&
        typeof article.urlToImage === 'string' &&
        article.title !== "[Removed]" &&
        article.description !== "[Removed]"
      )
    })

    // Remove duplicates based on title
    const uniqueArticles = Array.from(
      new Map(articles.map(article => [article.title, article]))
    ).map(([_, article]) => article)

    // Sort by date
    const sortedArticles = [...uniqueArticles].toSorted((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )

    // Paginate results
    const startIndex = (parseInt(page) - 1) * parseInt(pageSize)
    const endIndex = startIndex + parseInt(pageSize)
    const paginatedArticles = sortedArticles.slice(startIndex, endIndex)

    if (paginatedArticles.length === 0) {
      return NextResponse.json(
        { error: "No articles found for the given category" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: "ok",
      totalResults: sortedArticles.length,
      articles: paginatedArticles
    })
  } catch (error) {
    return handleApiError(error)
  }
}

function getCategoryQueries(category: string): string[] {
  switch (category) {
    case "ai":
      return [
        "artificial intelligence education",
        "machine learning students",
        "ChatGPT education",
        "AI learning tools",
        "generative AI education"
      ]
    case "programming":
      return [
        "programming education",
        "coding students",
        "web development learning",
        "software development education",
        "programming tools students"
      ]
    case "tech":
      return [
        "technology education",
        "tech innovation students",
        "digital learning",
        "edtech news",
        "technology students"
      ]
    case "science":
      return [
        "science education news",
        "scientific discoveries students",
        "science learning",
        "research education",
        "science innovations students"
      ]
    case "all":
    default:
      return [
        "education technology",
        "student innovation",
        "learning technology",
        "education news",
        "student technology"
      ]
  }
}
