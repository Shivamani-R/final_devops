import { NextResponse } from "next/server"
import { fetchWithRetry, handleApiError } from "@/lib/api-utils"
import { buildApiUrl } from "@/lib/api-helpers"
import { config } from "@/lib/config"
import type { NewsArticle, NewsQueryParams, NewsCategory } from "@/lib/types"

export async function GET() {
  try {
    const params: NewsQueryParams = {
      country: "us",
      category: "general" as NewsCategory,
      pageSize: "10",
      language: "en"
    }

    const url = buildApiUrl("topHeadlines", params)
    const data = await fetchWithRetry(url, {}, "trending-news")

    // Validate response structure
    if (!data?.articles || !Array.isArray(data.articles)) {
      return NextResponse.json(
        { error: "Invalid API response format" },
        { status: 502 }
      )
    }

    // Filter and validate articles
    const validArticles = data.articles.filter((article: NewsArticle) =>
      article?.title &&
      article?.description &&
      article?.urlToImage &&
      article.title !== "[Removed]" &&
      article.description !== "[Removed]"
    )

    if (validArticles.length === 0) {
      return NextResponse.json(
        { error: "No valid articles found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ ...data, articles: validArticles })
  } catch (error) {
    return handleApiError(error)
  }
}
