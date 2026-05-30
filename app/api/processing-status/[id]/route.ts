import { NextRequest, NextResponse } from 'next/server'
import { getJob, saveJob, saveChapter } from '@/lib/serverDb'
import { generateChapterWithGemini } from '@/lib/geminiFallback'
import { ProcessingStatus } from '@/lib/types'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://e7e2-118-95-65-182.ngrok-free.app'

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const jobId = params.id
        
        // 1. Check if it's a local Gemini fallback job
        const localJob = getJob(jobId)
        if (localJob && localJob.fallback) {
            return NextResponse.json(localJob.status)
        }

        // 2. Query the backend status
        console.log(`Polling backend status for Job ID: ${jobId} at ${BACKEND_URL}/status/${jobId}`)
        
        const response = await fetch(`${BACKEND_URL}/status/${jobId}`, {
            method: 'GET',
            cache: 'no-store',
            signal: AbortSignal.timeout(6000)
        })

        if (!response.ok) {
            console.warn(`Backend status returned status ${response.status}. Falling back to checking local database.`)
            
            // If local status is already complete, return it
            if (localJob && localJob.status.stage === 'complete') {
                return NextResponse.json(localJob.status)
            }
            throw new Error(`Backend status query failed: ${response.statusText}`)
        }

        const data = await response.json()
        console.log(`Backend status response:`, data)

        // The status data from backend could be { "status": "processing" } or similar.
        // Let's normalize it to our frontend format
        const backendStatus = (data.status || data.stage || 'processing').toLowerCase()
        
        let normalizedStatus: ProcessingStatus = {
            stage: 'simplifying',
            progress: 50,
            message: 'Model is rewriting textbook content...',
            chunk_current: 0,
            chunk_total: 0
        }

        if (backendStatus === 'completed' || backendStatus === 'complete' || backendStatus === 'success') {
            normalizedStatus = {
                stage: 'complete',
                progress: 100,
                message: 'Processing complete on backend!',
                chunk_current: 1,
                chunk_total: 1
            }
            
            // Save complete status locally
            if (localJob) {
                saveJob(jobId, normalizedStatus, localJob.metadata, false)
            }
        } else if (backendStatus === 'failed' || backendStatus === 'error') {
            // Backend failed during processing! Let's trigger a dynamic Gemini fallback right now!
            console.warn(`Job ${jobId} failed on backend. Dynamically starting Gemini fallback...`)
            
            if (localJob && !localJob.fallback) {
                // Change job type to fallback and trigger processing
                const updatedStatus: ProcessingStatus = {
                    stage: 'simplifying',
                    progress: 30,
                    message: 'Backend failed. Initiating Gemini AI recovery pipeline...',
                    chunk_current: 0,
                    chunk_total: 0
                }
                saveJob(jobId, updatedStatus, localJob.metadata, true)

                // Start Gemini recovery task
                const recoverWithGemini = async () => {
                    try {
                        const placeholderText = `Please write a comprehensive study guide about "${localJob.metadata.title}" suitable for Class ${localJob.metadata.class_level} ${localJob.metadata.subject.toUpperCase()} students under the ${localJob.metadata.board.toUpperCase()} board.`
                        const chapterData = await generateChapterWithGemini(placeholderText, {
                            title: localJob.metadata.title,
                            subject: localJob.metadata.subject,
                            class_level: localJob.metadata.class_level,
                            board: localJob.metadata.board,
                            id: jobId
                        })
                        saveChapter(chapterData)
                        saveJob(jobId, {
                            stage: 'complete',
                            progress: 100,
                            message: 'Chapter recovered and processed successfully via Gemini AI!',
                            chunk_current: 1,
                            chunk_total: 1
                        }, localJob.metadata, true)
                    } catch (e) {
                        saveJob(jobId, {
                            stage: 'error',
                            progress: 0,
                            message: `Fallback failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
                            chunk_current: 0,
                            chunk_total: 0
                        }, localJob.metadata, true)
                    }
                }
                recoverWithGemini()
                
                return NextResponse.json(updatedStatus)
            }
            
            normalizedStatus = {
                stage: 'error',
                progress: 0,
                message: data.message || 'Processing failed on backend.',
                chunk_current: 0,
                chunk_total: 0
            }
        } else {
            // Running/pending status: increment progress over time
            const currentProgress = localJob ? Math.min(localJob.status.progress + 5, 90) : 30
            normalizedStatus = {
                stage: 'simplifying',
                progress: currentProgress,
                message: `Rewriting text: ${data.message || 'Processing in progress...'}`,
                chunk_current: 0,
                chunk_total: 0
            }
            if (localJob) {
                saveJob(jobId, normalizedStatus, localJob.metadata, false)
            }
        }

        return NextResponse.json(normalizedStatus)

    } catch (error) {
        console.error('Processing status route error:', error)
        
        // If we fail to poll backend, check if we can recovery-run with Gemini
        const jobId = params.id
        const localJob = getJob(jobId)
        
        if (localJob) {
            if (localJob.status.stage === 'complete') {
                return NextResponse.json(localJob.status)
            }
            
            // Dynamic Gemini Fallback on Poll Timeout/Network loss
            if (!localJob.fallback) {
                console.warn(`Connection to backend lost for Job ${jobId}. Transitioning to Gemini AI fallback...`)
                const updatedStatus: ProcessingStatus = {
                    stage: 'simplifying',
                    progress: 40,
                    message: 'Backend connection lost. Moving workload to Gemini AI...',
                    chunk_current: 0,
                    chunk_total: 0
                }
                saveJob(jobId, updatedStatus, localJob.metadata, true)

                const recoverWithGemini = async () => {
                    try {
                        const placeholderText = `Please write a comprehensive study guide about "${localJob.metadata.title}" suitable for Class ${localJob.metadata.class_level} ${localJob.metadata.subject.toUpperCase()} students under the ${localJob.metadata.board.toUpperCase()} board.`
                        const chapterData = await generateChapterWithGemini(placeholderText, {
                            title: localJob.metadata.title,
                            subject: localJob.metadata.subject,
                            class_level: localJob.metadata.class_level,
                            board: localJob.metadata.board,
                            id: jobId
                        })
                        saveChapter(chapterData)
                        saveJob(jobId, {
                            stage: 'complete',
                            progress: 100,
                            message: 'Chapter recovered and processed successfully via Gemini AI!',
                            chunk_current: 1,
                            chunk_total: 1
                        }, localJob.metadata, true)
                    } catch (e) {
                        saveJob(jobId, {
                            stage: 'error',
                            progress: 0,
                            message: `Fallback failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
                            chunk_current: 0,
                            chunk_total: 0
                        }, localJob.metadata, true)
                    }
                }
                recoverWithGemini()

                return NextResponse.json(updatedStatus)
            }
            
            return NextResponse.json(localJob.status)
        }

        return NextResponse.json(
            { error: 'Failed to fetch status' },
            { status: 500 }
        )
    }
}
