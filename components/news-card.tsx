"use client"

import type React from "react"

import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, User } from "lucide-react"

interface NewsArticle {
  source: {
    id: string | null
    name: string
  }
  author: string
  title: string
  description: string
  url: string
  urlToImage: string
  publishedAt: string
  content: string
}

interface NewsCardProps {
  article: NewsArticle
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
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

  return (
    <div className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <Link href={article.url} target="_blank" rel="noopener noreferrer">
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
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold line-clamp-2">{article.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3">{article.description}</p>
          <div className="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
            {article.author && (
              <span className="flex items-center">
                <User className="h-3 w-3 mr-1" />
                {article.author}
              </span>
            )}
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(article.publishedAt)}
            </span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {getReadTime(article.content || article.description)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{article.source.name}</p>
        </div>
      </Link>
    </div>
  )
}
