'use client'

import { useEffect, useState } from 'react'
import styles from './courses.module.css'

interface Course {
    id: string
    name: string
    startDate: string
    duration: string
    location: string
    instructors: string
    allowMultiplePerDevice: boolean
    maxPerDevice: number
    _count: { attendees: number }
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingCourse, setEditingCourse] = useState<Course | null>(null)
    const [qrModal, setQrModal] = useState<{ show: boolean; qrCode: string; url: string; courseName: string }>({
        show: false, qrCode: '', url: '', courseName: ''
    })
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        duration: '',
        location: '',
        instructors: '',
        allowMultiplePerDevice: false,
        maxPerDevice: 1,
    })

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/courses')
            const data = await res.json()
            setCourses(data)
        } catch (error) {
            console.error('Error fetching courses:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const method = editingCourse ? 'PUT' : 'POST'
        const url = editingCourse ? `/api/courses/${editingCourse.id}` : '/api/courses'

        console.log('Submitting form data:', formData)

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            console.log('Response status:', res.status)
            const data = await res.json()
            console.log('Response data:', data)

            if (res.ok) {
                fetchCourses()
                resetForm()
            } else {
                alert('خطأ في حفظ الدورة: ' + (data.error || 'حدث خطأ'))
            }
        } catch (error) {
            console.error('Error saving course:', error)
            alert('خطأ في الاتصال بالخادم')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الدورة؟')) return

        try {
            await fetch(`/api/courses/${id}`, { method: 'DELETE' })
            fetchCourses()
        } catch (error) {
            console.error('Error deleting course:', error)
        }
    }

    const handleEdit = (course: Course) => {
        setEditingCourse(course)
        setFormData({
            name: course.name,
            startDate: course.startDate.split('T')[0],
            duration: course.duration,
            location: course.location,
            instructors: course.instructors,
            allowMultiplePerDevice: course.allowMultiplePerDevice ?? false,
            maxPerDevice: course.maxPerDevice ?? 1,
        })
        setShowForm(true)
    }

    const handleGenerateQR = async (course: Course) => {
        try {
            const res = await fetch(`/api/courses/${course.id}/qr`, { method: 'POST' })
            const data = await res.json()
            setQrModal({
                show: true,
                qrCode: data.qrCode,
                url: data.registrationUrl,
                courseName: course.name
            })
        } catch (error) {
            console.error('Error generating QR:', error)
        }
    }

    const resetForm = () => {
        setShowForm(false)
        setEditingCourse(null)
        setFormData({
            name: '',
            startDate: '',
            duration: '',
            location: '',
            instructors: '',
            allowMultiplePerDevice: false,
            maxPerDevice: 1,
        })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>إدارة الدورات</h1>
                <button onClick={() => setShowForm(true)} className={styles.addBtn}>
                    ➕ إضافة دورة
                </button>
            </div>

            {showForm && (
                <div className={styles.formCard}>
                    <h2>{editingCourse ? 'تعديل الدورة' : 'إضافة دورة جديدة'}</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGrid}>
                            <div className={styles.inputGroup}>
                                <label>اسم الدورة</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>تاريخ البداية</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>المدة</label>
                                <input
                                    type="text"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="مثال: 3 أيام"
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>المكان</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup + ' ' + styles.fullWidth}>
                                <label>المحاضرون</label>
                                <input
                                    type="text"
                                    value={formData.instructors}
                                    onChange={(e) => setFormData({ ...formData, instructors: e.target.value })}
                                    placeholder="أسماء المحاضرين مفصولة بفاصلة"
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.settingsSection}>
                            <h3>⚙️ إعدادات التسجيل</h3>
                            <div className={styles.settingsGrid}>
                                <div className={styles.checkboxGroup}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={formData.allowMultiplePerDevice}
                                            onChange={(e) => setFormData({ ...formData, allowMultiplePerDevice: e.target.checked })}
                                        />
                                        <span>السماح بتسجيل أكثر من شخص من نفس الجهاز</span>
                                    </label>
                                </div>
                                {!formData.allowMultiplePerDevice && (
                                    <div className={styles.inputGroup}>
                                        <label>الحد الأقصى للتسجيل من كل جهاز</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={formData.maxPerDevice}
                                            onChange={(e) => setFormData({ ...formData, maxPerDevice: parseInt(e.target.value) || 1 })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            <button type="submit" className={styles.submitBtn}>
                                {editingCourse ? 'حفظ التعديلات' : 'إضافة الدورة'}
                            </button>
                            <button type="button" onClick={resetForm} className={styles.cancelBtn}>
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className={styles.loading}>جاري التحميل...</div>
            ) : courses.length === 0 ? (
                <div className={styles.empty}>
                    <span>📚</span>
                    <p>لا توجد دورات حالياً</p>
                </div>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>اسم الدورة</th>
                                <th>التاريخ</th>
                                <th>المدة</th>
                                <th>المكان</th>
                                <th>المحاضرون</th>
                                <th>إعدادات الجهاز</th>
                                <th>الحضور</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => (
                                <tr key={course.id}>
                                    <td className={styles.courseName}>{course.name}</td>
                                    <td>{formatDate(course.startDate)}</td>
                                    <td>{course.duration}</td>
                                    <td>{course.location}</td>
                                    <td>{course.instructors}</td>
                                    <td>
                                        <span className={styles.deviceBadge}>
                                            {course.allowMultiplePerDevice ? '♾️ غير محدود' : `📱 ${course.maxPerDevice ?? 1} لكل جهاز`}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.badge}>{course._count.attendees}</span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button onClick={() => handleGenerateQR(course)} className={styles.qrBtn} title="توليد باركود">
                                                📱
                                            </button>
                                            <a href={`/courses/${course.id}/attendees`} className={styles.viewBtn} title="عرض الحضور">
                                                👥
                                            </a>
                                            <button onClick={() => handleEdit(course)} className={styles.editBtn} title="تعديل">
                                                ✏️
                                            </button>
                                            <button onClick={() => handleDelete(course.id)} className={styles.deleteBtn} title="حذف">
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

            {qrModal.show && (
                <div className={styles.modal} onClick={() => setQrModal({ show: false, qrCode: '', url: '', courseName: '' })}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2>باركود الدورة</h2>
                        <p className={styles.modalCourseName}>{qrModal.courseName}</p>
                        <img src={qrModal.qrCode} alt="QR Code" className={styles.qrImage} />
                        <p className={styles.qrUrl}>{qrModal.url}</p>
                        <div className={styles.modalActions}>
                            <a href={qrModal.qrCode} download={`qr-${qrModal.courseName}.png`} className={styles.downloadBtn}>
                                ⬇️ تحميل الباركود
                            </a>
                            <button onClick={() => setQrModal({ show: false, qrCode: '', url: '', courseName: '' })} className={styles.closeBtn}>
                                إغلاق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
