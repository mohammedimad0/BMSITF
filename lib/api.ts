import { ChapterData, ProcessingStatus, UploadMetadata } from './types'

const BACKEND_URL = 'http://localhost:8000'

export async function uploadAndProcess(metadata: UploadMetadata & { file?: File; text?: string }): Promise<{ chapter_id: string }> {
    const formData = new FormData()

    if (metadata.file) {
        formData.append('file', metadata.file)
    } else if (metadata.text) {
        formData.append('text', metadata.text)
    } else {
        throw new Error('Either file or text must be provided')
    }

    formData.append('class_level', metadata.class_level.toString())
    formData.append('subject', metadata.subject)
    formData.append('board', metadata.board)

    const response = await fetch('/api/process', {
        method: 'POST',
        body: formData,
    })

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
    }

    return response.json()
}

export async function getProcessingStatus(chapterId: string): Promise<ProcessingStatus> {
    const response = await fetch(`/api/processing-status/${chapterId}`)

    if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`)
    }

    return response.json()
}

export async function getChapter(chapterId: string): Promise<ChapterData> {
    const response = await fetch(`/api/chapters/${chapterId}`)

    if (!response.ok) {
        throw new Error(`Failed to fetch chapter: ${response.statusText}`)
    }

    return response.json()
}

export async function listChapters(): Promise<ChapterData[]> {
    const response = await fetch('/api/chapters')

    if (!response.ok) {
        throw new Error(`Failed to fetch chapters: ${response.statusText}`)
    }

    return response.json()
}

export async function approveChapter(chapterId: string): Promise<ChapterData> {
    const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
    })

    if (!response.ok) {
        throw new Error(`Failed to approve chapter: ${response.statusText}`)
    }

    return response.json()
}

export async function updateChunkText(
    chapterId: string,
    chunkId: string,
    simplifiedText: string
): Promise<void> {
    const response = await fetch(`/api/chapters/${chapterId}/chunks/${chunkId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simplified_text: simplifiedText }),
    })

    if (!response.ok) {
        throw new Error(`Failed to update chunk: ${response.statusText}`)
    }
}

export async function getChapterByCode(shareCode: string): Promise<ChapterData> {
    const response = await fetch(`/api/share/${shareCode}`)

    if (!response.ok) {
        throw new Error(`Chapter not found or not shared`)
    }

    return response.json()
}
