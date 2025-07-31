"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, HelpCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface WikiSuggestion {
  wiki: string
  domain: string
  creation_date: string
}

interface ProjectAutocompleteProps {
  value: string
  onChange: (value: string, creationDate?: string) => void
  label: string
  placeholder?: string
  required?: boolean
}

export function ProjectAutocomplete({
  value,
  onChange,
  label,
  placeholder,
  required = false,
}: ProjectAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<WikiSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const fetchSuggestions = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `https://api.wikipeoplestats.org/v1/search/genders?query=${encodeURIComponent(query)}`,
      )
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.wikis || [])
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    fetchSuggestions(newValue)
  }

  const handleSuggestionClick = (suggestion: WikiSuggestion) => {
    onChange(suggestion.wiki, suggestion.creation_date)
    setShowSuggestions(false)
  }

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Label htmlFor="project" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Label>
        <HelpCircle
          className="h-4 w-4 text-gray-500 dark:text-gray-400 cursor-help"
          title="Provide the name of the project"
        />
      </div>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={inputRef}
            id="project"
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            required={required}
            className="pl-10 h-10"
          />
        </div>

        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg max-h-60 overflow-y-auto mt-1"
          >
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-3 cursor-pointer hover:bg-blue-500 hover:text-white dark:hover:bg-blue-400 dark:hover:text-gray-900 transition duration-200 text-sm border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div className="font-medium">{suggestion.wiki}</div>
                  <div className="text-xs opacity-75">{suggestion.domain}</div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No projects found</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
