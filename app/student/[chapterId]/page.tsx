'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useChapter } from '@/hooks/useChapter'
import { useReading } from '@/hooks/useReading'
import { useAccessibility } from '@/hooks/useAccessibility'
import { ChunkReveal } from '@/components/student/ChunkReveal'
import { ReadingRuler } from '@/components/student/ReadingRuler'
import { TTSControls } from '@/components/student/TTSControls'
import { GlossaryPanel } from '@/components/student/GlossaryPanel'
import { AccessibilityBar } from '@/components/student/AccessibilityBar'

export default function StudentReaderPage({
    params,
}: {
    params: { chapterId: string }
}) {
    const router = useRouter()
    const { chapter, loading, error } = useChapter(params.chapterId)
    const reading = useReading(params.chapterId, chapter?.chunks.length || 0)
    const accessibility = useAccessibility()
    const [glossaryOpen, setGlossaryOpen] = useState(false)

    useEffect(() => {
        if (chapter && reading.currentChunkIndex < chapter.chunks.length) {
            reading.markComplete(chapter.chunks[reading.currentChunkIndex].chunk_id)
        }
    }, [reading.currentChunkIndex, chapter, reading])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'ArrowRight') {
                if (reading.currentChunkIndex < (chapter?.chunks.length || 0) - 1) {
                    reading.nextChunk()
                }
            } else if (e.code === 'ArrowLeft') {
                if (reading.currentChunkIndex > 0) {
                    reading.prevChunk()
                }
            } else if (e.code === 'KeyG') {
                setGlossaryOpen(!glossaryOpen)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [reading, glossaryOpen, chapter?.chunks.length])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple" />
            </div>
        )
    }

    if (error || !chapter || !accessibility.mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream">
                <div className="text-center space-y-4">
                    <p className="text-error-red font-bold text-lg">
                        {error ? 'Failed to load chapter' : 'Chapter not found'}
                    </p>
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2 bg-brand-purple text-white rounded-lg font-medium"
                    >
                        Back Home
                    </button>
                </div>
            </div>
        )
    }

    const currentChunk = chapter.chunks[reading.currentChunkIndex]

    return (
        <div
            style={{
                backgroundColor: accessibility.prefs.background === 'cream'
                    ? '#FEF9F0'
                    : accessibility.prefs.background === 'white'
                        ? '#FFFFFF'
                        : accessibility.prefs.background === 'blue'
                            ? '#EFF6FF'
                            : '#1a1a1a',
            }}
        >
            {/* Reading Ruler */}
            <ReadingRuler enabled={accessibility.prefs.showRuler} />

            {/* Accessibility Bar */}
            {accessibility.mounted && (
                <AccessibilityBar
                    prefs={accessibility.prefs}
                    onUpdate={accessibility.updatePref}
                    onReset={accessibility.reset}
                />
            )}

            {/* Main Content */}
            <main className="min-h-screen py-12 pb-32">
                <div className="max-w-4xl mx-auto">
                    {/* Chapter Header */}
                    <div className="text-center mb-12 px-6">
                        <h1
                            className="text-4xl font-bold mb-3"
                            style={{ color: accessibility.prefs.background === 'dark' ? '#E8E8E8' : '#2C2416' }}
                        >
                            {chapter.title}
                        </h1>
                        <div className="flex justify-center gap-3 flex-wrap">
                            <span className="px-3 py-1 bg-brand-purple text-white rounded-full text-sm font-medium">
                                {chapter.subject}
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-dark-text rounded-full text-sm font-medium">
                                Class {chapter.class_level}
                            </span>
                        </div>

                        {/* Progress */}
                        <div className="mt-6 flex items-center justify-center gap-4">
                            <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden max-w-xs">
                                <div
                                    className="bg-brand-purple h-full transition-all duration-300"
                                    style={{
                                        width: `${reading.progressPercentage}%`,
                                    }}
                                />
                            </div>
                            <span
                                className="text-sm font-medium"
                                style={{ color: accessibility.prefs.background === 'dark' ? '#E8E8E8' : '#2C2416' }}
                            >
                                {reading.progressPercentage}%
                            </span>
                        </div>
                    </div>

                    {/* Reading Content */}
                    <div className="px-6">
                        <ChunkReveal
                            chunk={currentChunk}
                            onNext={reading.nextChunk}
                            onPrevious={reading.prevChunk}
                            canNext={reading.currentChunkIndex < chapter.chunks.length - 1}
                            canPrevious={reading.currentChunkIndex > 0}
                            activeWordIndex={reading.activeWordIndex}
                            fontSize={accessibility.prefs.fontSize}
                            lineHeight={accessibility.prefs.lineHeight}
                            letterSpacing={accessibility.prefs.letterSpacing}
                        />
                    </div>

                    {/* Glossary Button */}
                    <div className="fixed right-6 bottom-40 z-20">
                        <button
                            onClick={() => setGlossaryOpen(!glossaryOpen)}
                            className="w-14 h-14 rounded-full bg-brand-purple text-white shadow-lg hover:bg-brand-purple/90 transition-all flex items-center justify-center text-xl hover:scale-110"
                            title="Open glossary (G)"
                        >
                            📖
                        </button>
                    </div>
                </div>
            </main>

            {/* Glossary Panel */}
            <GlossaryPanel
                glossary={currentChunk.glossary}
                keyTerms={currentChunk.key_terms}
                isOpen={glossaryOpen}
                onClose={() => setGlossaryOpen(false)}
            />

            {/* TTS Controls */}
            <TTSControls
                text={currentChunk.simplified_text}
                onWordChange={reading.setActiveWord}
                speed={accessibility.prefs.ttsSpeed}
                autoPlay={accessibility.prefs.ttsAutoPlay}
            />
        </div>
    )
}
