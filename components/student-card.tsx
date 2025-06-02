"use client"

import Image from "next/image"
import { Calendar, Clock, User, ExternalLink, BookmarkPlus, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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

interface StudentCardProps {
  article: Article
}

export function StudentCard({ article }: StudentCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`

    return date.toLocaleDateString("en-US", {
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

  // Enhanced category detection with better logic
  const getArticleCategory = () => {
    const title = article.title.toLowerCase()
    const description = article.description?.toLowerCase() || ""

    if (
      title.includes("ai") ||
      title.includes("artificial intelligence") ||
      title.includes("machine learning") ||
      title.includes("chatgpt") ||
      title.includes("claude") ||
      title.includes("perplexity") ||
      title.includes("openai") ||
      title.includes("neural") ||
      description.includes("artificial intelligence") ||
      description.includes("machine learning")
    ) {
      return { name: "AI", color: "bg-gradient-to-r from-purple-500 to-pink-500", textColor: "text-white" }
    } else if (
      title.includes("programming") ||
      title.includes("coding") ||
      title.includes("developer") ||
      title.includes("software") ||
      title.includes("javascript") ||
      title.includes("python") ||
      title.includes("react") ||
      title.includes("github") ||
      description.includes("programming") ||
      description.includes("coding")
    ) {
      return { name: "Code", color: "bg-gradient-to-r from-green-500 to-teal-500", textColor: "text-white" }
    } else if (
      title.includes("education") ||
      title.includes("learning") ||
      title.includes("course") ||
      title.includes("university") ||
      title.includes("student") ||
      title.includes("bootcamp") ||
      title.includes("tutorial") ||
      description.includes("education") ||
      description.includes("learning")
    ) {
      return { name: "Education", color: "bg-gradient-to-r from-indigo-500 to-blue-500", textColor: "text-white" }
    } else if (
      title.includes("job") ||
      title.includes("career") ||
      title.includes("salary") ||
      title.includes("interview") ||
      title.includes("hiring") ||
      title.includes("remote") ||
      title.includes("internship") ||
      description.includes("career") ||
      description.includes("job")
    ) {
      return { name: "Career", color: "bg-gradient-to-r from-teal-500 to-cyan-500", textColor: "text-white" }
    } else if (
      title.includes("tech") ||
      title.includes("technology") ||
      title.includes("startup") ||
      title.includes("innovation") ||
      title.includes("blockchain") ||
      title.includes("cybersecurity") ||
      description.includes("technology") ||
      description.includes("innovation")
    ) {
      return { name: "Tech", color: "bg-gradient-to-r from-orange-500 to-red-500", textColor: "text-white" }
    }

    return { name: "News", color: "bg-gradient-to-r from-gray-500 to-slate-500", textColor: "text-white" }
  }

  const category = getArticleCategory()

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.url,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(article.url)
    }
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-0 shadow-md bg-white/80 backdrop-blur-sm">
      <div className="relative overflow-hidden">
        <Image
          src={article.urlToImage || "/placeholder.svg?height=200&width=400"}
          alt={article.title}
          width={400}
          height={200}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.svg?height=200&width=400"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Source Badge */}
        <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800 hover:bg-white">{article.source.name}</Badge>

        {/* Category Badge */}
        <Badge className={`absolute top-3 right-3 ${category.color} ${category.textColor} border-0`}>
          {category.name}
        </Badge>

        {/* Action Buttons */}
        <div className="absolute bottom-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0" onClick={handleShare}>
            <Share2 className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
            <BookmarkPlus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-2">
          {article.author && (
            <>
              <span className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                <span className="truncate max-w-24">{article.author}</span>
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

        <CardTitle className="text-lg mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {article.title}
        </CardTitle>

        <CardDescription className="text-sm line-clamp-3 leading-relaxed">{article.description}</CardDescription>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <Button
          variant="default"
          size="sm"
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          asChild
        >
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
            Read Full Article
            <ExternalLink className="ml-2 h-3 w-3" />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
