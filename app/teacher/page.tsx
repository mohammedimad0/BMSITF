'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { UploadPanel } from '@/components/teacher/UploadPanel'
import { ProcessingStatus } from '@/components/teacher/ProcessingStatus'
import { ChapterCard } from '@/components/teacher/ChapterCard'
import { uploadAndProcess, listChapters, getProcessingStatus } from '@/lib/api'
import { UploadMetadata, ChapterData, ProcessingStatus as Status } from '@/lib/types'
import { Toast } from '@/components/shared/Toast'

import Link from 'next/link'

export default function TeacherPage() {
    const router = useRouter()
    const [chapters, setChapters] = useState<ChapterData[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [currentChapterId, setCurrentChapterId] = useState<string | null>(null)
    const [processingStatus, setProcessingStatus] = useState<Status>({
        stage: 'idle',
        progress: 0,
        message: '',
        chunk_current: 0,
        chunk_total: 0,
    })
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

    // Load chapters on mount
    useEffect(() => {
        const loadChapters = async () => {
            try {
                const data = await listChapters()
                setChapters(data)
            } catch (error) {
                console.error('Failed to load chapters:', error)
                setToast({ message: 'Failed to load chapters', type: 'error' })
            } finally {
                setLoading(false)
            }
        }

        loadChapters()
    }, [])

    // Poll processing status
    useEffect(() => {
        if (!processing || !currentChapterId) return

        const interval = setInterval(async () => {
            try {
                const status = await getProcessingStatus(currentChapterId)
                setProcessingStatus(status)

                if (status.stage === 'complete') {
                    setProcessing(false)
                    router.push(`/teacher/review/${currentChapterId}`)
                    setToast({ message: 'Chapter processed successfully!', type: 'success' })
                } else if (status.stage === 'error') {
                    setProcessing(false)
                    setToast({ message: `Processing error: ${status.message}`, type: 'error' })
                }
            } catch (error) {
                console.error('Failed to check status:', error)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [processing, currentChapterId, router])

    const handleUpload = async (metadata: UploadMetadata) => {
        try {
            setUploading(true)
            const result = await uploadAndProcess(metadata)
            setCurrentChapterId(result.chapter_id)
            setProcessing(true)
            setProcessingStatus({
                stage: 'extracting',
                progress: 5,
                message: 'Starting extraction...',
                chunk_current: 0,
                chunk_total: 0,
            })
        } catch (error) {
            console.error('Upload error:', error)
            setToast({
                message: error instanceof Error ? error.message : 'Upload failed',
                type: 'error',
            })
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-3 justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">👨‍🏫</span>
                            <h1 className="text-3xl font-bold text-dark-text">Teacher Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/teacher/analytics"
                                className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                            >
                                📊 Student Development Insights
                            </Link>
                            <a
                                href="/"
                                className="text-brand-purple hover:text-brand-purple/80 font-medium text-sm"
                            >
                                ← Back
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Upload Section */}
                {!processing && (
                    <div className="mb-12">
                        <UploadPanel onSubmit={handleUpload} isLoading={uploading} />
                    </div>
                )}

                {/* Processing Status */}
                {processing && (
                    <div className="mb-12">
                        <ProcessingStatus status={processingStatus} />
                    </div>
                )}

                {/* Chapters List */}
                {!loading && !processing && (
                    <div>
                        <h2 className="text-2xl font-bold text-dark-text mb-6">
                            Your Chapters ({chapters.length})
                        </h2>

                        {chapters.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {chapters.map((chapter) => (
                                    <ChapterCard
                                        key={chapter.chapter_id}
                                        chapter={chapter}
                                        shareCode={chapter.approved ? chapter.chapter_id.slice(0, 6) : undefined}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">No chapters yet. Upload your first NCERT chapter above!</p>
                            </div>
                        )}
                    </div>
                )}

                {loading && !processing && (
                    <div className="text-center py-12">
                        <div className="inline-block">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple" />
                        </div>
                    </div>
                )}
            </main>

            {/* Toast */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    )
}
