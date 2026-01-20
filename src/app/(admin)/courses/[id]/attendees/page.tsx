'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import styles from './attendees.module.css'

interface Attendee {
    id: string
    nationalId: string
    firstName: string
    secondName: string
    thirdName: string
    lastName: string
    phone: string
    computerNumber: string | null
    jobTitle: string
    workplace: string
    createdAt: string
}

interface Course {
    id: string
    name: string
    startDate: string
    duration: string
    location: string
    instructors: string
    allowMultiplePerDevice: boolean
    maxPerDevice: number
    attendees: Attendee[]
}

const emptyAttendee = {
    nationalId: '',
    firstName: '',
    secondName: '',
    thirdName: '',
    lastName: '',
    phone: '',
    computerNumber: '',
    jobTitle: '',
    workplace: '',
}

export default function AttendeesPage() {
    const params = useParams()
    const [course, setCourse] = useState<Course | null>(null)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingAttendee, setEditingAttendee] = useState<Attendee | null>(null)
    const [formData, setFormData] = useState(emptyAttendee)

    useEffect(() => {
        fetchCourse()
    }, [])

    const fetchCourse = async () => {
        try {
            const res = await fetch(`/api/courses/${params.id}`)
            const data = await res.json()
            setCourse(data)
        } catch (error) {
            console.error('Error fetching course:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            if (editingAttendee) {
                // Update existing
                await fetch(`/api/attendees/${editingAttendee.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                })
            } else {
                // Create new (manual registration)
                await fetch('/api/attendees', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        courseId: params.id,
                        deviceId: 'manual-admin-' + Date.now(),
                    }),
                })
            }

            fetchCourse()
            resetForm()
        } catch (error) {
            console.error('Error saving attendee:', error)
        }
    }

    const handleEdit = (attendee: Attendee) => {
        setEditingAttendee(attendee)
        setFormData({
            nationalId: attendee.nationalId,
            firstName: attendee.firstName,
            secondName: attendee.secondName,
            thirdName: attendee.thirdName,
            lastName: attendee.lastName,
            phone: attendee.phone,
            computerNumber: attendee.computerNumber || '',
            jobTitle: attendee.jobTitle,
            workplace: attendee.workplace,
        })
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الحضور؟')) return

        try {
            await fetch(`/api/attendees/${id}`, { method: 'DELETE' })
            fetchCourse()
        } catch (error) {
            console.error('Error deleting attendee:', error)
        }
    }

    const resetForm = () => {
        setShowForm(false)
        setEditingAttendee(null)
        setFormData(emptyAttendee)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const exportToCSV = () => {
        if (!course) return

        const headers = ['رقم الهوية', 'الاسم الأول', 'الاسم الثاني', 'الاسم الثالث', 'الاسم الأخير', 'رقم الجوال', 'رقم الحاسب', 'المسمى الوظيفي', 'مكان العمل', 'تاريخ التسجيل']
        const rows = course.attendees.map(a => [
            a.nationalId,
            a.firstName,
            a.secondName,
            a.thirdName,
            a.lastName,
            a.phone,
            a.computerNumber || '',
            a.jobTitle,
            a.workplace,
            formatDate(a.createdAt)
        ])

        const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.join(',')).join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `attendees-${course.name}.csv`
        link.click()
    }

    if (loading) {
        return <div className={styles.loading}>جاري التحميل...</div>
    }

    if (!course) {
        return <div className={styles.error}>الدورة غير موجودة</div>
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <a href="/courses" className={styles.backLink}>← العودة للدورات</a>
                    <h1 className={styles.title}>قائمة الحضور</h1>
                    <p className={styles.courseName}>{course.name}</p>
                </div>
                <div className={styles.headerActions}>
                    <button onClick={() => setShowForm(true)} className={styles.addBtn}>
                        ➕ إضافة يدوي
                    </button>
                    <button onClick={exportToCSV} className={styles.exportBtn} disabled={course.attendees.length === 0}>
                        📥 تصدير CSV
                    </button>
                </div>
            </div>

            <div className={styles.courseInfo}>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>التاريخ:</span>
                    <span>{formatDate(course.startDate)}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>المدة:</span>
                    <span>{course.duration}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>المكان:</span>
                    <span>{course.location}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>عدد الحضور:</span>
                    <span className={styles.count}>{course.attendees.length}</span>
                </div>
                <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>إعداد الجهاز:</span>
                    <span className={styles.deviceBadge}>
                        {course.allowMultiplePerDevice ? '♾️ غير محدود' : `📱 ${course.maxPerDevice} لكل جهاز`}
                    </span>
                </div>
            </div>

            {showForm && (
                <div className={styles.formCard}>
                    <h2>{editingAttendee ? 'تعديل بيانات الحضور' : 'إضافة حضور يدوياً'}</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label>رقم الهوية *</label>
                                <input
                                    type="text"
                                    value={formData.nationalId}
                                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>الاسم الأول *</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>الاسم الثاني *</label>
                                <input
                                    type="text"
                                    value={formData.secondName}
                                    onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>الاسم الثالث *</label>
                                <input
                                    type="text"
                                    value={formData.thirdName}
                                    onChange={(e) => setFormData({ ...formData, thirdName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>الاسم الأخير *</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>رقم الجوال *</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    dir="ltr"
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>رقم الحاسب</label>
                                <input
                                    type="text"
                                    value={formData.computerNumber}
                                    onChange={(e) => setFormData({ ...formData, computerNumber: e.target.value })}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>المسمى الوظيفي *</label>
                                <input
                                    type="text"
                                    value={formData.jobTitle}
                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup + ' ' + styles.fullWidth}>
                                <label>مكان العمل *</label>
                                <input
                                    type="text"
                                    value={formData.workplace}
                                    onChange={(e) => setFormData({ ...formData, workplace: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className={styles.formActions}>
                            <button type="submit" className={styles.submitBtn}>
                                {editingAttendee ? 'حفظ التعديلات' : 'إضافة'}
                            </button>
                            <button type="button" onClick={resetForm} className={styles.cancelBtn}>
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {course.attendees.length === 0 ? (
                <div className={styles.empty}>
                    <span>👥</span>
                    <p>لا يوجد حضور مسجلين حتى الآن</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>رقم الهوية</th>
                                <th>الاسم الكامل</th>
                                <th>رقم الجوال</th>
                                <th>رقم الحاسب</th>
                                <th>المسمى الوظيفي</th>
                                <th>مكان العمل</th>
                                <th>تاريخ التسجيل</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {course.attendees.map((attendee, index) => (
                                <tr key={attendee.id}>
                                    <td>{index + 1}</td>
                                    <td>{attendee.nationalId}</td>
                                    <td className={styles.name}>
                                        {attendee.firstName} {attendee.secondName} {attendee.thirdName} {attendee.lastName}
                                    </td>
                                    <td dir="ltr">{attendee.phone}</td>
                                    <td>{attendee.computerNumber || '-'}</td>
                                    <td>{attendee.jobTitle}</td>
                                    <td>{attendee.workplace}</td>
                                    <td>{formatDate(attendee.createdAt)}</td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button onClick={() => handleEdit(attendee)} className={styles.editBtn} title="تعديل">
                                                ✏️
                                            </button>
                                            <button onClick={() => handleDelete(attendee.id)} className={styles.deleteBtn} title="حذف">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
