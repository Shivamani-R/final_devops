"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
}

export interface SearchFilters {
  sortBy: string
  language: string
  sources: string
  domains: string
  from: string
  to: string
}

const popularSources = [
  "techcrunch.com",
  "wired.com",
  "arstechnica.com",
  "theverge.com",
  "engadget.com",
  "mashable.com",
  "cnet.com",
  "venturebeat.com",
  "github.blog",
  "stackoverflow.blog",
]

export function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: "publishedAt",
    language: "en",
    sources: "",
    domains: "",
    from: "",
    to: "",
  })

  const [isOpen, setIsOpen] = useState(false)

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      sortBy: "publishedAt",
      language: "en",
      sources: "",
      domains: "",
      from: "",
      to: "",
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.sortBy !== "publishedAt") count++
    if (filters.language !== "en") count++
    if (filters.sources) count++
    if (filters.domains) count++
    if (filters.from) count++
    if (filters.to) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 text-xs bg-primary text-primary-foreground">{activeFiltersCount}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Advanced Search Filters</CardTitle>
              <div className="flex items-center space-x-2">
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sort By */}
            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publishedAt">Latest First</SelectItem>
                  <SelectItem value="relevancy">Most Relevant</SelectItem>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={filters.language} onValueChange={(value) => handleFilterChange("language", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                  <SelectItem value="it">Italian</SelectItem>
                  <SelectItem value="pt">Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Popular Sources */}
            <div className="space-y-2">
              <Label htmlFor="sources">Popular Tech Sources</Label>
              <Select value={filters.sources} onValueChange={(value) => handleFilterChange("sources", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {popularSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source.replace(".com", "").replace(".blog", "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="from" className="text-xs text-muted-foreground">
                    From
                  </Label>
                  <Input
                    id="from"
                    type="date"
                    value={filters.from}
                    onChange={(e) => handleFilterChange("from", e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="to" className="text-xs text-muted-foreground">
                    To
                  </Label>
                  <Input
                    id="to"
                    type="date"
                    value={filters.to}
                    onChange={(e) => handleFilterChange("to", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Custom Domains */}
            <div className="space-y-2">
              <Label htmlFor="domains">Custom Domains</Label>
              <Input
                id="domains"
                placeholder="e.g., github.com,stackoverflow.com"
                value={filters.domains}
                onChange={(e) => handleFilterChange("domains", e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">Separate multiple domains with commas</p>
            </div>

            {/* Active Filters Summary */}
            {activeFiltersCount > 0 && (
              <div className="pt-4 border-t">
                <Label className="text-sm font-medium">Active Filters:</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.sortBy !== "publishedAt" && (
                    <Badge variant="secondary" className="text-xs">
                      Sort: {filters.sortBy}
                    </Badge>
                  )}
                  {filters.language !== "en" && (
                    <Badge variant="secondary" className="text-xs">
                      Lang: {filters.language}
                    </Badge>
                  )}
                  {filters.sources && (
                    <Badge variant="secondary" className="text-xs">
                      Source: {filters.sources.replace(".com", "")}
                    </Badge>
                  )}
                  {filters.from && (
                    <Badge variant="secondary" className="text-xs">
                      From: {filters.from}
                    </Badge>
                  )}
                  {filters.to && (
                    <Badge variant="secondary" className="text-xs">
                      To: {filters.to}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
