'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function CustomerDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console and monitoring service
    console.error('Customer Dashboard Error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })
  }, [error])

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto border-red-200 shadow-lg">
        <CardHeader className="border-b border-red-100 bg-red-50">
          <CardTitle className="flex items-center gap-3 text-red-700">
            <AlertCircle className="h-7 w-7" />
            Dashboard Error
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">
              Something went wrong loading your dashboard
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {error.message || 'An unexpected error occurred while loading your dashboard. Please try again.'}
            </p>
          </div>

          {error.digest && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Error ID:</span>{' '}
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {error.digest}
                </code>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Please include this ID if you contact support
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={reset}
              className="flex items-center gap-2"
              variant="default"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>

            <Button
              asChild
              variant="outline"
              className="flex items-center gap-2"
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && error.stack && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Technical Details (Development Only)
              </summary>
              <pre className="mt-2 p-4 bg-gray-900 text-gray-100 rounded-md overflow-x-auto text-xs">
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
