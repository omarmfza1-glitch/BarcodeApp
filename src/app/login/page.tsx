'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import styles from './login.module.css'

export default function LoginPage() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await signIn('credentials', {
            username,
            password,
            redirect: false,
        })

        if (result?.error) {
            setError('اسم المستخدم أو كلمة المرور غير صحيحة')
            setLoading(false)
        } else {
            router.push('/dashboard')
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <Image
                        src="/logo.png"
                        alt="وزارة الصحة"
                        width={120}
                        height={120}
                        className={styles.logo}
                        priority
                    />
                    <h1 className={styles.title}>نظام إدارة الدورات</h1>
                    <p className={styles.subtitle}>تسجيل دخول المسؤول</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.inputGroup}>
                        <label htmlFor="username">اسم المستخدم</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="أدخل اسم المستخدم"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label htmlFor="password">كلمة المرور</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="أدخل كلمة المرور"
                        />
                    </div>

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
                    </button>
                </form>
            </div>
        </div>
    )
}
