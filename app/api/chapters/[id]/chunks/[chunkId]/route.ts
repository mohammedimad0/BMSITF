import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string; chunkId: string } }
) {
    try {
        const body = await request.json()

        const response = await fetch(
            `${BACKEND_URL}/chapters/${params.id}/chunks/${params.chunkId}`,
            {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            }
        )

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to update chunk' },
                { status: response.status }
            )
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Update chunk error:', error)
        return NextResponse.json(
            { error: 'Failed to update chunk' },
            { status: 500 }
        )
    }
}
