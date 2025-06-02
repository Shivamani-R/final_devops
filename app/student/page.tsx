"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Loader2,
  GraduationCap,
  Brain,
  Code,
  Laptop,
  BookOpen,
  Briefcase,
  Search,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudentCard } from "@/components/student-card"

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
  category?: string
}

const studentCategories = [
  {
    name: "All",
    value: "all",
    icon: GraduationCap,
    color: "bg-gradient-to-r from-blue-500 to-purple-600",
    description: "All student tech content",
  },
  {
    name: "AI & ML",
    value: "ai",
    icon: Brain,
    color: "bg-gradient-to-r from-purple-500 to-pink-600",
    description: "Artificial Intelligence & Machine Learning",
  },
  {
    name: "Programming",
    value: "programming",
    icon: Code,
    color: "bg-gradient-to-r from-green-500 to-teal-600",
    description: "Coding, Development & Programming",
  },
  {
    name: "Tech News",
    value: "tech",
    icon: Laptop,
    color: "bg-gradient-to-r from-orange-500 to-red-600",
    description: "Latest Technology & Innovation",
  },
  {
    name: "Education",
    value: "education",
    icon: BookOpen,
    color: "bg-gradient-to-r from-indigo-500 to-blue-600",
    description: "Learning Resources & EdTech",
  },
  {
    name: "Career",
    value: "career",
    icon: Briefcase,
    color: "bg-gradient-to-r from-teal-500 to-cyan-600",
    description: "Jobs, Internships & Career Growth",
  },
]

export default function StudentPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("publishedAt")
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchStudentNews = async (category: string, pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true)
      else setLoadingMore(true)

      const response = await fetch(`/api/student-news?category=${category}&page=${pageNum}&pageSize=12`)

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
      console.error("Error fetching student news:", err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchStudentNews(selectedTab, 1, false)
  }, [selectedTab])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchStudentNews(selectedTab, nextPage, true)
  }

  const filteredArticles = articles.filter((article) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      article.title.toLowerCase().includes(query) ||
      article.description.toLowerCase().includes(query) ||
      article.source.name.toLowerCase().includes(query)
    )
  })

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case "publishedAt":
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      case "title":
        return a.title.localeCompare(b.title)
      case "source":
        return a.source.name.localeCompare(b.source.name)
      default:
        return 0
    }
  })

  const getCategoryStats = (categoryValue: string) => {
    if (categoryValue === "all") return articles.length
    return articles.filter((article) => {
      const title = article.title.toLowerCase()
      const description = article.description.toLowerCase()

      switch (categoryValue) {
        case "ai":
          return title.includes("ai") || title.includes("artificial intelligence") || title.includes("machine learning")
        case "programming":
          return title.includes("programming") || title.includes("coding") || title.includes("developer")
        case "tech":
          return title.includes("tech") || title.includes("technology") || title.includes("innovation")
        case "education":
          return title.includes("education") || title.includes("learning") || title.includes("course")
        case "career":
          return title.includes("job") || title.includes("career") || title.includes("salary")
        default:
          return false
      }
    }).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Student Tech Hub
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your ultimate destination for AI, programming, technology news, educational resources, and career
              opportunities
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles, sources, or topics..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publishedAt">Latest First</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="source">Source A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {studentCategories.map((category) => {
            const Icon = category.icon
            const count = getCategoryStats(category.value)
            return (
              <Card
                key={category.value}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedTab === category.value ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
                }`}
                onClick={() => setSelectedTab(category.value)}
              >
                <CardContent className="p-4 text-center">
                  <div
                    className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center mx-auto mb-2`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">{category.name}</p>
                  <p className="text-2xl font-bold text-primary">{count}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-1">
            {studentCategories.map((category) => {
              const Icon = category.icon
              return (
                <TabsTrigger
                  key={category.value}
                  value={category.value}
                  className="flex flex-col items-center space-y-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{category.name}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-lg font-medium">Loading amazing content for you...</p>
                  <p className="text-muted-foreground">
                    Fetching the latest {studentCategories.find((c) => c.value === selectedTab)?.name.toLowerCase()}{" "}
                    updates
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {studentCategories.find((c) => c.value === selectedTab)?.name}
                      {searchQuery && ` - "${searchQuery}"`}
                    </h2>
                    <p className="text-muted-foreground">
                      {studentCategories.find((c) => c.value === selectedTab)?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {sortedArticles.length} Articles
                    </Badge>
                  </div>
                </div>

                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {sortedArticles.map((article, index) => (
                    <StudentCard key={index} article={article} />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMore && !loading && sortedArticles.length > 0 && (
                  <div className="text-center">
                    <Button onClick={loadMore} variant="outline" size="lg" disabled={loadingMore} className="px-8 py-3">
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading More...
                        </>
                      ) : (
                        "Load More Articles"
                      )}
                    </Button>
                  </div>
                )}

                {/* No Results */}
                {sortedArticles.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No articles found</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchQuery
                          ? `No articles match "${searchQuery}" in ${studentCategories.find((c) => c.value === selectedTab)?.name}`
                          : `No ${studentCategories.find((c) => c.value === selectedTab)?.name.toLowerCase()} articles available at the moment`}
                      </p>
                      {searchQuery && (
                        <Button variant="outline" onClick={() => setSearchQuery("")}>
                          Clear Search
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
