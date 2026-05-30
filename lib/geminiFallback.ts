import { ChapterData, ChunkObject } from './types'

export async function generateChapterWithGemini(
    inputText: string,
    metadata: { title: string; subject: string; class_level: number; board: string; id: string }
): Promise<ChapterData> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        throw new Error('Gemini API key is not configured.')
    }

    const correctEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const systemPrompt = `You are an expert educational AI specialized in neurodivergent pedagogy.
Your task is to take the provided text and convert it into a highly structured, dyslexia-friendly, ADHD-friendly, and cognitive-accessible chapter.
Format the output strictly as a JSON object matching this TypeScript interface:
{
    "title": "Chapter Title",
    "subject": "Chapter Subject",
    "class_level": number,
    "board": "Board Name",
    "chunks": [
        {
            "chunk_id": "unique-chunk-id-1",
            "original_text": "Original paragraph/section text",
            "simplified_text": "Simplified, dyslexia-friendly version of the text using short, active sentences, clear fonts (OpenDyslexic friendly), and phonetic guides for difficult vocabulary (e.g. pho·to·syn·the·sis). Never use justified alignment descriptors.",
            "key_terms": ["Vocabulary1", "Vocabulary2"],
            "core_facts": ["Key fact or takeaway 1", "Key fact or takeaway 2"],
            "objective": "A simple 1-sentence learning objective for this section.",
            "glossary": {
                "Vocabulary1": "Simple, plain-language definition of Vocabulary1",
                "Vocabulary2": "Simple, plain-language definition of Vocabulary2"
            }
        }
    ]
}
Maintain educational accuracy while maximizing visual clarity and cognitive accessibility.`

    const prompt = `Metadata:
Title: ${metadata.title}
Subject: ${metadata.subject}
Class: ${metadata.class_level}
Board: ${metadata.board}

Text to process:
${inputText}

Response JSON:`

    const response = await fetch(correctEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [
                {
                    parts: [
                        {
                            text: `${systemPrompt}\n\nUser Content:\n${prompt}`
                        }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: 'application/json'
            }
        })
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini API call failed: ${errorText}`)
    }

    const data = await response.json()
    const jsonString = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!jsonString) {
        throw new Error('Gemini API returned an empty response.')
    }

    const generated = JSON.parse(jsonString)
    
    // Ensure all fields are properly structured and present
    const chunks: ChunkObject[] = (generated.chunks || []).map((c: any, idx: number) => {
        const simplified = c.simplified_text || c.original_text || 'No text content.'
        return {
            chunk_id: c.chunk_id || `chunk-${idx}`,
            original_text: c.original_text || simplified,
            simplified_text: simplified,
            key_terms: c.key_terms || [],
            syllable_map: c.syllable_map || {},
            phonetic_map: c.phonetic_map || {},
            core_facts: c.core_facts || [],
            objective: c.objective || 'Understand this section of the lesson.',
            numbers: c.numbers || [],
            numbers_plain: c.numbers_plain || [],
            glossary: c.glossary || {},
            word_count: simplified.split(/\s+/).filter(Boolean).length
        }
    })

    return {
        chapter_id: metadata.id,
        title: generated.title || metadata.title,
        subject: generated.subject || metadata.subject,
        class_level: Number(generated.class_level) || metadata.class_level,
        board: generated.board || metadata.board,
        chunks,
        created_at: new Date().toISOString(),
        approved: false
    }
}
