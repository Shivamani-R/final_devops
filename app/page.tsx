"use client"

import { useState, useEffect } from "react"
import { Search, Menu, TrendingUp, Clock, User, Calendar, ChevronRight, Loader2, GraduationCap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SearchFilters, type SearchFilters as SearchFiltersType } from "@/components/search-filters"

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

interface NewsResponse {
  status: string
  totalResults: number
  articles: Article[]
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

export default function NewsHomepage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null)
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("general")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Article[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchFilters, setSearchFilters] = useState<SearchFiltersType>({
    sortBy: "publishedAt",
    language: "en",
    sources: "",
    domains: "",
    from: "",
    to: "",
  })

  const fetchNews = async (category = "general") => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/news?category=${category}&pageSize=20`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: NewsResponse = await response.json()

      if (data.status === "ok" && data.articles) {
        setArticles(data.articles.slice(1))
        setFeaturedArticle(data.articles[0] || null)
      } else if (data.error) {
        throw new Error(data.error)
      }
    } catch (err) {
      setError("Failed to fetch news. Please try again later.")
      console.error("Error fetching news:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrendingNews = async () => {
    try {
      const response = await fetch("/api/trending")

      if (response.ok) {
        const data: NewsResponse = await response.json()
        if (data.status === "ok" && data.articles) {
          setTrendingArticles(data.articles.slice(0, 5))
        }
      }
    } catch (err) {
      console.error("Error fetching trending news:", err)
    }
  }

  const searchNews = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      let url = `/api/news?q=${encodeURIComponent(query)}&pageSize=10`

      // Add filters to URL
      if (searchFilters.sortBy !== "publishedAt") url += `&sortBy=${searchFilters.sortBy}`
      if (searchFilters.language !== "en") url += `&language=${searchFilters.language}`
      if (searchFilters.sources) url += `&sources=${searchFilters.sources}`
      if (searchFilters.domains) url += `&domains=${searchFilters.domains}`
      if (searchFilters.from) url += `&from=${searchFilters.from}`
      if (searchFilters.to) url += `&to=${searchFilters.to}`

      const response = await fetch(url)

      if (response.ok) {
        const data: NewsResponse = await response.json()
        if (data.status === "ok" && data.articles) {
          setSearchResults(data.articles)
        }
      }
    } catch (err) {
      console.error("Error searching news:", err)
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    fetchNews(selectedCategory)
    fetchTrendingNews()
  }, [selectedCategory])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        searchNews(searchQuery)
      } else {
        setSearchResults([])
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery, searchFilters])

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

  const displayedArticles = searchResults.length > 0 ? searchResults : articles

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold text-primary">
                NewsHub
              </Link>
              <nav className="hidden md:flex space-x-6">
                {categories.slice(0, 6).map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setSelectedCategory(category.value)}
                    className={`text-sm font-medium transition-colors ${
                      selectedCategory === category.value
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
                <Link
                  href="/student"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1"
                >
                  <GraduationCap className="h-4 w-4" />
                  <span>Student</span>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search news..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                )}
              </div>
              <SearchFilters onFiltersChange={setSearchFilters} />
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search Results Header */}
            {searchResults.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Search Results</h2>
                <p className="text-muted-foreground">
                  Found {searchResults.length} articles for "{searchQuery}"
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSearchResults([])
                  }}
                  className="mt-2"
                >
                  Clear Search
                </Button>
              </div>
            )}

            {/* Featured Article */}
            {!searchResults.length && featuredArticle && !loading && (
              <section className="mb-12">
                <Card className="overflow-hidden">
                  <div className="relative">
                    <Image
                      src={featuredArticle.urlToImage || "/placeholder.svg?height=400&width=800"}
                      alt={featuredArticle.title}
                      width={800}
                      height={400}
                      className="w-full h-64 md:h-80 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=400&width=800"
                      }}
                    />
                    <Badge className="absolute top-4 left-4" variant="secondary">
                      Featured
                    </Badge>
                  </div>
                  <CardHeader className="p-6">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                      <Badge variant="outline">{featuredArticle.source.name}</Badge>
                      <span>•</span>
                      {featuredArticle.author && (
                        <>
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {featuredArticle.author}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(featuredArticle.publishedAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {getReadTime(featuredArticle.content || featuredArticle.description)}
                      </span>
                    </div>
                    <CardTitle className="text-2xl md:text-3xl mb-3">{featuredArticle.title}</CardTitle>
                    <CardDescription className="text-base">{featuredArticle.description}</CardDescription>
                    <div className="mt-4">
                      <Button asChild>
                        <a href={featuredArticle.url} target="_blank" rel="noopener noreferrer">
                          Read Full Article
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              </section>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading news...</span>
              </div>
            )}

            {/* Latest News */}
            {!loading && displayedArticles.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{searchResults.length > 0 ? "Search Results" : "Latest News"}</h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <Badge variant="outline">{categories.find((c) => c.value === selectedCategory)?.name}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {displayedArticles.map((article, index) => (
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
              </section>
            )}

            {/* No Results */}
            {!loading && displayedArticles.length === 0 && !error && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No articles found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try a different search term" : "No news available for this category"}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        onClick={() => setSelectedCategory(category.value)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategory === category.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                    <Link
                      href="/student"
                      className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200"
                    >
                      <GraduationCap className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-700">Student Hub</span>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Trending */}
              {trendingArticles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Trending Now
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {trendingArticles.map((article, index) => (
                      <div key={index}>
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl font-bold text-muted-foreground">
                            {(index + 1).toString().padStart(2, "0")}
                          </span>
                          <div className="flex-1">
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-sm leading-tight mb-1 hover:text-primary transition-colors line-clamp-2"
                            >
                              {article.title}
                            </a>
                            <p className="text-xs text-muted-foreground">
                              {getReadTime(article.content || article.description)}
                            </p>
                          </div>
                        </div>
                        {index < trendingArticles.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">NewsHub</h3>
              <p className="text-sm text-muted-foreground">
                Your trusted source for breaking news and in-depth analysis from around the world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-sm">
                {categories.slice(0, 4).map((category) => (
                  <li key={category.value}>
                    <button
                      onClick={() => setSelectedCategory(category.value)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
                <li>
                  <Link href="/student" className="text-muted-foreground hover:text-foreground">
                    Student Hub
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-sm text-muted-foreground">
            © 2024 NewsHub. All rights reserved. Powered by NewsAPI
          </div>
        </div>
      </footer>
    </div>
  )
}
