'use client'

import Link from 'next/link'
import { ChapterData } from '@/lib/types'

interface ChapterCardProps {
    chapter: ChapterData
    shareCode?: string
}

export function ChapterCard({ chapter, shareCode }: ChapterCardProps) {
    const createdDate = new Date(chapter.created_at).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })

    const status = chapter.approved ? '✓ Approved' : '⏳ Pending Review'
    const statusColor = chapter.approved ? 'text-accent-teal' : 'text-orange-600'

    return (
        <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-lg text-dark-text line-clamp-2">
                            {chapter.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {chapter.subject} • Class {chapter.class_level}
                        </p>
                    </div>
                    <div className={`font-bold text-sm ${statusColor}`}>
                        {status}
                    </div>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-gray-600">Chunks</p>
                        <p className="font-bold text-dark-text text-lg">{chapter.chunks.length}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-gray-600">Created</p>
                        <p className="font-bold text-dark-text text-sm">{createdDate}</p>
                    </div>
                </div>

                {/* Share Code */}
                {shareCode && chapter.approved && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">Share Code</p>
                        <p className="font-mono font-bold text-lg text-accent-teal">
                            {shareCode}
                        </p>
                        <button
                            onClick={() => navigator.clipboard.writeText(shareCode)}
                            className="mt-2 text-xs text-accent-teal hover:underline font-medium"
                        >
                            Copy to clipboard
                        </button>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Link
                        href={`/teacher/review/${chapter.chapter_id}`}
                        className="flex-1 bg-brand-purple text-white py-2 rounded-lg font-medium hover:bg-brand-purple/90 text-center transition-colors text-sm"
                    >
                        Review
                    </Link>
                    {chapter.approved && (
                        <Link
                            href={`/student/${chapter.chapter_id}`}
                            className="flex-1 bg-gray-200 text-dark-text py-2 rounded-lg font-medium hover:bg-gray-300 text-center transition-colors text-sm"
                        >
                            Preview
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}
