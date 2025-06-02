"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Calendar, Clock, User, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Article {
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  source: {
    name: string
  }
  author: string
  content: string
}

const categories = [
  { name: "General", value: "general" },
  { name: "Technology", value: "technology" },
  { name: "Business", value: "business" },
  { name: "Sports", value: "sports" },
  { name: "Entertainment", value: "entertainment" },
  { name: "Science", value: "science" },
  { name: "Health", value: "health" },
]

export default function CategoryPage() {
  const params = useParams()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const categorySlug = params.slug as string
  const category = categories.find((c) => c.value === categorySlug)

  const fetchCategoryNews = async (pageNum = 1, append = false) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/news?category=${categorySlug}&page=${pageNum}&pageSize=12`)

      if (response.ok) {
        const data = await response.json()
        if (data.articles) {
          if (append) {
            setArticles((prev) => [...prev, ...data.articles])
          } else {
            setArticles(data.articles)
          }

          setHasMore(data.articles.length === 12)
        }
      }
    } catch (err) {
      console.error("Error fetching category news:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (categorySlug) {
      fetchCategoryNews(1, false)
      setPage(1)
    }
  }, [categorySlug])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchCategoryNews(nextPage, true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getReadTime = (content: string) => {
    const words = content?.split(" ").length || 0
    const readTime = Math.ceil(words / 200)
    return `${readTime} min read`
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Category not found</h1>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{category.name} News</h1>
              <p className="text-muted-foreground">Latest {category.name.toLowerCase()} news and updates</p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {articles.length} Articles
            </Badge>
          </div>
        </div>

        {/* Articles Grid */}
        {loading && articles.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading {category.name.toLowerCase()} news...</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {articles.map((article, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={article.urlToImage || "/placeholder.svg?height=200&width=300"}
                      alt={article.title}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=200&width=300"
                      }}
                    />
                    <Badge className="absolute top-3 left-3" variant="secondary">
                      {article.source.name}
                    </Badge>
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
                      {article.author && (
                        <>
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {article.author}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(article.publishedAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {getReadTime(article.content || article.description)}
                      </span>
                    </div>
                    <CardTitle className="text-lg mb-2 line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-3 mb-3">{article.description}</CardDescription>
                    <Button variant="outline" size="sm" asChild>
                      <a href={article.url} target="_blank" rel="noopener noreferrer">
                        Read More
                      </a>
                    </Button>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && !loading && (
              <div className="text-center">
                <Button onClick={loadMore} variant="outline" size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Articles"
                  )}
                </Button>
              </div>
            )}

            {/* No More Articles */}
            {!hasMore && articles.length > 0 && (
              <div className="text-center text-muted-foreground">
                <p>You've reached the end of {category.name.toLowerCase()} news</p>
              </div>
            )}
          </>
        )}

        {/* No Articles */}
        {!loading && articles.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground">No {category.name.toLowerCase()} news available at the moment</p>
          </div>
        )}
      </div>
    </div>
  )
}
