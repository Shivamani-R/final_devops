"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Calendar, Clock, User, Share2, Bookmark, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

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

export default function ArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  const API_KEY = "0ea2bdb2e0714ed0a010339f866ae4b0"
  const BASE_URL = "https://newsapi.org/v2"

  useEffect(() => {
    // In a real app, you'd fetch the specific article by ID
    // For demo purposes, we'll fetch a random article
    fetchArticle()
  }, [])

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/news?pageSize=10`)

      if (response.ok) {
        const data = await response.json()
        if (data.articles && data.articles.length > 0) {
          const validArticles = data.articles.filter(
            (article: Article) => article.title && article.description && article.title !== "[Removed]",
          )
          setArticle(validArticles[0])
          setRelatedArticles(validArticles.slice(1, 4))
        }
      }
    } catch (err) {
      console.error("Error fetching article:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getReadTime = (content: string) => {
    const words = content?.split(" ").length || 0
    const readTime = Math.ceil(words / 200)
    return `${readTime} min read`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Article not found</h1>
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
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to News
          </Link>

          {/* Article Header */}
          <div className="mb-8">
            <Badge className="mb-4">{article.source.name}</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{article.description}</p>

            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {article.author && (
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {article.author}
                  </span>
                )}
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {getReadTime(article.content || article.description)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Article Image */}
          {article.urlToImage && (
            <div className="mb-8">
              <Image
                src={article.urlToImage || "/placeholder.svg"}
                alt={article.title}
                width={800}
                height={400}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=400&width=800"
                }}
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <p className="text-lg leading-relaxed">{article.content || article.description}</p>

            {article.content && article.content.length > 200 && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  This is a preview. Read the full article on the original source:
                </p>
                <Button asChild>
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    Read Full Article
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>

          <Separator className="my-8" />

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <Image
                        src={relatedArticle.urlToImage || "/placeholder.svg?height=150&width=300"}
                        alt={relatedArticle.title}
                        width={300}
                        height={150}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=150&width=300"
                        }}
                      />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm line-clamp-2 mb-2">{relatedArticle.title}</CardTitle>
                      <div className="text-xs text-muted-foreground">
                        {relatedArticle.source.name} • {formatDate(relatedArticle.publishedAt).split(",")[0]}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
