import { NextRequest, NextResponse } from 'next/server'
import { saveJob, saveChapter } from '@/lib/serverDb'
import { generateChapterWithGemini } from '@/lib/geminiFallback'
import { ProcessingStatus } from '@/lib/types'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://e7e2-118-95-65-182.ngrok-free.app'

// Simple helper to scan PDF binary streams for readable text strings
async function extractTextFromPdf(file: File): Promise<string> {
    try {
        const arrayBuffer = await file.arrayBuffer()
        const uint8 = new Uint8Array(arrayBuffer)
        const decoder = new TextDecoder('utf-8')
        const fullString = decoder.decode(uint8)
        
        let text = ''
        const regexTj = /\(([^)]+)\)\s*Tj/g
        let match
        let count = 0
        while ((match = regexTj.exec(fullString)) !== null && count < 1000) {
            text += match[1] + ' '
            count++
        }
        
        const regexTJ = /\[([^\]]+)\]\s*TJ/g
        while ((match = regexTJ.exec(fullString)) !== null && count < 2000) {
            const parts = match[1].match(/\(([^)]+)\)/g)
            if (parts) {
                text += parts.map(p => p.slice(1, -1)).join('') + ' '
            }
            count++
        }
        
        text = text.replace(/\\([0-7]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
        text = text.replace(/\\(.)/g, '$1')
        
        return text.trim()
    } catch (e) {
        console.error('PDF text extraction heuristic failed:', e)
        return ''
    }
}

export async function POST(request: NextRequest) {
    let file: File | null = null
    let textContent = ''
    let classLevel = 6
    let subject = 'science'
    let board = 'ncert'
    let title = 'New Chapter'

    try {
        const formData = await request.formData()
        file = formData.get('file') as File | null
        textContent = (formData.get('text') as string) || ''
        classLevel = Number(formData.get('class_level')) || 6
        subject = (formData.get('subject') as string) || 'science'
        board = (formData.get('board') as string) || 'ncert'
        title = file ? file.name.replace(/\.[^/.]+$/, "") : (textContent.slice(0, 30) || 'Paste Study Chapter')

        // Try the backend ngrok endpoint first
        console.log(`Attempting to upload to backend: ${BACKEND_URL}/upload`)
        
        // Prepare FormData for the backend
        const backendFormData = new FormData()
        if (file) {
            backendFormData.append('file', file)
        } else if (textContent) {
            backendFormData.append('text', textContent)
        }

        const backendResponse = await fetch(`${BACKEND_URL}/upload`, {
            method: 'POST',
            body: backendFormData,
            // Keep timeout short to trigger fallback quickly if server is offline
            signal: AbortSignal.timeout(12000)
        })

        if (backendResponse.ok) {
            const responseData = await backendResponse.json()
            const jobId = responseData.job_id || responseData.id || `job-${Date.now()}`
            
            console.log(`Backend upload succeeded. Received Job ID: ${jobId}`)
            
            // Save job in our local tracking database
            const initialStatus: ProcessingStatus = {
                stage: 'extracting',
                progress: 10,
                message: 'Processing started on backend...',
                chunk_current: 0,
                chunk_total: 0
            }
            saveJob(jobId, initialStatus, { title, subject, class_level: classLevel, board })
            
            return NextResponse.json({ chapter_id: jobId, job_id: jobId })
        } else {
            console.warn(`Backend upload returned status ${backendResponse.status}, falling back to Gemini...`)
            throw new Error(`Backend failed with status ${backendResponse.status}`)
        }

    } catch (error) {
        console.warn('Backend upload failed or timed out. Triggering Gemini AI fallback...', error)
        
        // Use Gemini API fallback!
        const jobId = `gemini-job-${Date.now()}`
        
        // Initialize status as processing
        const initialStatus: ProcessingStatus = {
            stage: 'simplifying',
            progress: 25,
            message: 'Using Gemini AI to process and condense text...',
            chunk_current: 0,
            chunk_total: 0
        }
        
        const metadata = { title, subject, class_level: classLevel, board }
        saveJob(jobId, initialStatus, metadata, true)

        // Process in the background to avoid blocking the client
        const processWithGemini = async () => {
            try {
                let textToProcess = textContent
                if (file && !textToProcess) {
                    textToProcess = await extractTextFromPdf(file)
                    if (!textToProcess) {
                        textToProcess = `Please write a comprehensive study guide about "${title}" suitable for Class ${classLevel} ${subject.toUpperCase()} students under the ${board.toUpperCase()} board.`
                    }
                }

                // Update job status to parsing/simplifying
                saveJob(jobId, {
                    stage: 'simplifying',
                    progress: 50,
                    message: 'Synthesizing dyslexia-friendly chapters...',
                    chunk_current: 1,
                    chunk_total: 1
                }, metadata, true)

                // Call Gemini to generate the full structured lesson
                const chapterData = await generateChapterWithGemini(textToProcess, {
                    title,
                    subject,
                    class_level: classLevel,
                    board,
                    id: jobId
                })

                // Save chapter data in database
                saveChapter(chapterData)

                // Update status to complete
                saveJob(jobId, {
                    stage: 'complete',
                    progress: 100,
                    message: 'Chapter processed successfully via Gemini AI!',
                    chunk_current: 1,
                    chunk_total: 1
                }, metadata, true)

                console.log(`Gemini Fallback processing complete for Job ID: ${jobId}`)

            } catch (fallbackError) {
                console.error('Gemini fallback processing failed:', fallbackError)
                saveJob(jobId, {
                    stage: 'error',
                    progress: 0,
                    message: `Processing failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`,
                    chunk_current: 0,
                    chunk_total: 0
                }, metadata, true)
            }
        }

        // Trigger asynchronous task
        processWithGemini()

        return NextResponse.json({ chapter_id: jobId, job_id: jobId })
    }
}
