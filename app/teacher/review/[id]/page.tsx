'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BeforeAfterView } from '@/components/teacher/BeforeAfterView'
import { useChapter } from '@/hooks/useChapter'
import { approveChapter, updateChunkText } from '@/lib/api'
import { Toast } from '@/components/shared/Toast'

export default function ReviewPage({
    params,
}: {
    params: { id: string }
}) {
    const router = useRouter()
    const { chapter, loading, error } = useChapter(params.id)
    const [approving, setApproving] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    const handleApprove = async () => {
        if (!chapter) return

        try {
            setApproving(true)
            await approveChapter(chapter.chapter_id)
            setToast({ message: 'Chapter approved!', type: 'success' })
            setTimeout(() => {
                router.push('/teacher')
            }, 1500)
        } catch (err) {
            setToast({
                message: err instanceof Error ? err.message : 'Failed to approve',
                type: 'error',
            })
        } finally {
            setApproving(false)
        }
    }

    const handleChunkUpdate = async (chunkId: string, text: string) => {
        try {
            await updateChunkText(params.id, chunkId, text)
            setToast({ message: 'Chunk updated!', type: 'success' })
            // Refresh chapter data
            window.location.reload()
        } catch (err) {
            setToast({
                message: err instanceof Error ? err.message : 'Failed to update',
                type: 'error',
            })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple" />
            </div>
        )
    }

    if (error || !chapter) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <p className="text-error-red font-bold text-lg">Failed to load chapter</p>
                    <button
                        onClick={() => router.push('/teacher')}
                        className="px-6 py-2 bg-brand-purple text-white rounded-lg font-medium"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-dark-text">Review Chapter</h1>
                            <p className="text-gray-600 mt-1">
                                {chapter.title} • {chapter.subject} • Class {chapter.class_level}
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/teacher')}
                            className="text-brand-purple hover:text-brand-purple/80 font-medium"
                        >
                            ← Back
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Before After View */}
                <BeforeAfterView
                    chunks={chapter.chunks}
                    onChunkUpdate={handleChunkUpdate}
                />

                {/* Actions */}
                <div className="mt-8 flex gap-4 justify-end">
                    <button
                        onClick={() => router.push('/teacher')}
                        className="px-8 py-3 bg-gray-200 text-dark-text font-bold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={approving}
                        className="px-8 py-3 bg-accent-teal text-white font-bold rounded-lg hover:bg-accent-teal/90 disabled:opacity-50 transition-colors"
                    >
                        {approving ? 'Approving...' : '✓ Approve & Share'}
                    </button>
                </div>

                {/* Share Info */}
                {chapter.approved && (
                    <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="font-bold text-dark-text mb-3">Share with Students</h3>
                        <p className="text-gray-700 mb-4">
                            This chapter is approved and ready to share. Students can access it using the code below:
                        </p>
                        <div className="bg-white rounded-lg p-4 border border-green-300 inline-block">
                            <p className="font-mono text-2xl font-bold text-accent-teal">
                                {chapter.chapter_id.slice(0, 6).toUpperCase()}
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    duration={3000}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    )
}
