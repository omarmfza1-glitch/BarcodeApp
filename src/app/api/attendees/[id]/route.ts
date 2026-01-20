import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const attendee = await prisma.attendee.findUnique({
        where: { id },
    })

    if (!attendee) {
        return NextResponse.json({ error: 'Attendee not found' }, { status: 404 })
    }

    return NextResponse.json(attendee)
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
        nationalId,
        firstName,
        secondName,
        thirdName,
        lastName,
        phone,
        computerNumber,
        jobTitle,
        workplace,
    } = body

    const attendee = await prisma.attendee.update({
        where: { id },
        data: {
            nationalId,
            firstName,
            secondName,
            thirdName,
            lastName,
            phone,
            computerNumber: computerNumber || null,
            jobTitle,
            workplace,
        },
    })

    return NextResponse.json(attendee)
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    await prisma.attendee.delete({
        where: { id },
    })

    return NextResponse.json({ message: 'Attendee deleted' })
}
