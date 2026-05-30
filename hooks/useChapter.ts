'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChapterData } from '@/lib/types'
import { getChapter } from '@/lib/api'
import { getCachedChapterData, cacheChapterData } from '@/lib/storage'

export function useChapter(chapterId: string) {
    const [chapter, setChapter] = useState<ChapterData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchChapter = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Check cache first
            const cached = getCachedChapterData(chapterId)
            if (cached) {
                setChapter(cached)
                setLoading(false)
                return
            }

            // Fetch from API
            const data = await getChapter(chapterId)
            cacheChapterData(chapterId, data)
            setChapter(data)
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch chapter')
            setError(error)
        } finally {
            setLoading(false)
        }
    }, [chapterId])

    useEffect(() => {
        fetchChapter()
    }, [fetchChapter])

    return {
        chapter,
        loading,
        error,
        refetch: fetchChapter,
    }
}
