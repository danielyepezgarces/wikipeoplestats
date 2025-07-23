import { NextRequest, NextResponse } from 'next/server'

interface ChartData {
  year: string
  month: string
  total: number
  totalWomen: number
  totalMen: number
  otherGenders: number
}

// Mock chart data - replace with actual database queries
const mockChartData: { [key: string]: ChartData[] } = {
  "wikimedia-argentina": [
    { year: "2023", month: "01", total: 10, totalWomen: 3, totalMen: 6, otherGenders: 1 },
    { year: "2023", month: "02", total: 15, totalWomen: 5, totalMen: 9, otherGenders: 1 },
    { year: "2023", month: "03", total: 22, totalWomen: 8, totalMen: 12, otherGenders: 2 },
    { year: "2023", month: "04", total: 30, totalWomen: 12, totalMen: 16, otherGenders: 2 },
    { year: "2023", month: "05", total: 45, totalWomen: 18, totalMen: 24, otherGenders: 3 },
    { year: "2023", month: "06", total: 62, totalWomen: 24, totalMen: 33, otherGenders: 5 },
    { year: "2023", month: "07", total: 78, totalWomen: 30, totalMen: 42, otherGenders: 6 },
    { year: "2023", month: "08", total: 95, totalWomen: 37, totalMen: 51, otherGenders: 7 },
    { year: "2023", month: "09", total: 112, totalWomen: 43, totalMen: 61, otherGenders: 8 },
    { year: "2023", month: "10", total: 134, totalWomen: 52, totalMen: 73, otherGenders: 9 },
    { year: "2023", month: "11", total: 156, totalWomen: 60, totalMen: 86, otherGenders: 10 },
    { year: "2023", month: "12", total: 180, totalWomen: 69, totalMen: 99, otherGenders: 12 }
  ],
  "wikimedia-espana": [
    { year: "2023", month: "06", total: 8, totalWomen: 3, totalMen: 4, otherGenders: 1 },
    { year: "2023", month: "07", total: 18, totalWomen: 7, totalMen: 10, otherGenders: 1 },
    { year: "2023", month: "08", total: 28, totalWomen: 11, totalMen: 15, otherGenders: 2 },
    { year: "2023", month: "09", total: 42, totalWomen: 16, totalMen: 23, otherGenders: 3 },
    { year: "2023", month: "10", total: 58, totalWomen: 22, totalMen: 32, otherGenders: 4 },
    { year: "2023", month: "11", total: 76, totalWomen: 29, totalMen: 42, otherGenders: 5 },
    { year: "2023", month: "12", total: 95, totalWomen: 36, totalMen: 53, otherGenders: 6 }
  ]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // In a real application, you would fetch from your database
    // const chartData = await getChapterChartData(slug)
    
    const chartData = mockChartData[slug] || []
    
    return NextResponse.json({
      data: chartData,
      executionTime: 0.1
    })
  } catch (error) {
    console.error('Error fetching chart data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data', data: [] },
      { status: 500 }
    )
  }
}