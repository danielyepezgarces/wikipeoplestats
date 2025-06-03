"use client"

import { useState, useEffect } from "react"

interface ProjectRotatorProps {
  projects: string[]
  template: string
}

export function ProjectRotator({ projects, template }: ProjectRotatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % projects.length)
    }, 1000)

    return () => clearInterval(interval)
  }, [projects.length])

  const currentProject = projects[currentIndex]
  const text = template.replace("%s", currentProject)

  return <span>{text}</span>
}
