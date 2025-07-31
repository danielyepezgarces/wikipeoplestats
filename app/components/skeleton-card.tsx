import { Card, CardContent } from "@/components/ui/card"

export function SkeletonCard() {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="p-6 text-center">
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-2 animate-pulse" />
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2 animate-pulse" />
        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-2 animate-pulse" />
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 mx-auto animate-pulse" />
      </CardContent>
    </Card>
  )
}
