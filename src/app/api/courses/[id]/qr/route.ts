import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const course = await prisma.course.findUnique({
        where: { id },
    })

    if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Generate registration URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const registrationUrl = `${baseUrl}/register/${id}`

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(registrationUrl, {
        width: 300,
        margin: 2,
        color: {
            dark: '#000000',
            light: '#ffffff',
        },
    })

    return NextResponse.json({
        qrCode: qrCodeDataUrl,
        registrationUrl
    })
}
