import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            attendees: {
                orderBy: { createdAt: 'desc' },
            },
        },
    })

    if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Add default values for new fields if they don't exist
    const courseWithDefaults = {
        ...course,
        allowMultiplePerDevice: (course as Record<string, unknown>).allowMultiplePerDevice ?? false,
        maxPerDevice: (course as Record<string, unknown>).maxPerDevice ?? 1,
    }

    return NextResponse.json(courseWithDefaults)
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()

        const { name, startDate, duration, location, instructors, allowMultiplePerDevice, maxPerDevice } = body

        const course = await prisma.course.update({
            where: { id },
            data: {
                name,
                startDate: new Date(startDate),
                duration,
                location,
                instructors,
                allowMultiplePerDevice: allowMultiplePerDevice === true,
                maxPerDevice: maxPerDevice || 1,
            },
        })

        // Return with default values for new fields
        const courseWithDefaults = {
            ...course,
            allowMultiplePerDevice: (course as Record<string, unknown>).allowMultiplePerDevice ?? false,
            maxPerDevice: (course as Record<string, unknown>).maxPerDevice ?? 1,
        }

        return NextResponse.json(courseWithDefaults)
    } catch (error) {
        console.error('Error updating course:', error)
        return NextResponse.json(
            { error: 'خطأ في تحديث الدورة', details: String(error) },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        await prisma.course.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Course deleted' })
    } catch (error) {
        console.error('Error deleting course:', error)
        return NextResponse.json(
            { error: 'خطأ في حذف الدورة', details: String(error) },
            { status: 500 }
        )
    }
}
