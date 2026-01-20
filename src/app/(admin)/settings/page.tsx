'use client'

import { useState, useEffect } from 'react'
import styles from './settings.module.css'

const fonts = [
    { id: 'cairo', name: 'Cairo', nameAr: 'القاهرة', desc: 'خط عصري ومقروء - الأكثر استخداماً' },
    { id: 'tajawal', name: 'Tajawal', nameAr: 'تجوّال', desc: 'خط أنيق ونظيف للتصاميم الحديثة' },
    { id: 'almarai', name: 'Almarai', nameAr: 'المراعي', desc: 'خط رسمي ومحترف للأعمال' },
    { id: 'changa', name: 'Changa', nameAr: 'تشانجا', desc: 'خط جريء ومميز للعناوين' },
    { id: 'elmessiri', name: 'El Messiri', nameAr: 'المسيري', desc: 'خط كلاسيكي بلمسة عصرية' },
    { id: 'amiri', name: 'Amiri', nameAr: 'أميري', desc: 'خط نسخي تقليدي - مستوحى من المطابع' },
    { id: 'lateef', name: 'Lateef', nameAr: 'لطيف', desc: 'خط نستعليق فارسي أنيق' },
    { id: 'scheherazade', name: 'Scheherazade', nameAr: 'شهرزاد', desc: 'خط نسخي كلاسيكي للنصوص الطويلة' },
]

export default function SettingsPage() {
    const [selectedFont, setSelectedFont] = useState('cairo')
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        const savedFont = localStorage.getItem('app-font') || 'cairo'
        setSelectedFont(savedFont)
        document.documentElement.className = `font-${savedFont}`
    }, [])

    const handleFontChange = (fontId: string) => {
        setSelectedFont(fontId)
        document.documentElement.className = `font-${fontId}`
    }

    const handleSave = () => {
        localStorage.setItem('app-font', selectedFont)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>الإعدادات</h1>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>🎨 الخطوط العربية</h2>
                <p className={styles.sectionDesc}>اختر الخط العربي المناسب للتطبيق - جميع الخطوط عربية أصيلة</p>

                <div className={styles.fontsGrid}>
                    {fonts.map((font) => (
                        <div
                            key={font.id}
                            className={`${styles.fontCard} ${selectedFont === font.id ? styles.selected : ''}`}
                            onClick={() => handleFontChange(font.id)}
                        >
                            <div className={styles.fontHeader}>
                                <span className={styles.fontName}>{font.nameAr}</span>
                                <span className={styles.fontNameEn}>{font.name}</span>
                            </div>
                            <p className={styles.fontSample} style={{ fontFamily: `'${font.name}', sans-serif` }}>
                                بسم الله الرحمن الرحيم
                            </p>
                            <p className={styles.fontSample2} style={{ fontFamily: `'${font.name}', sans-serif` }}>
                                نظام إدارة الدورات التدريبية ١٢٣
                            </p>
                            <p className={styles.fontDesc}>{font.desc}</p>
                            {selectedFont === font.id && (
                                <div className={styles.selectedBadge}>✓ مُختار</div>
                            )}
                        </div>
                    ))}
                </div>

                <div className={styles.actions}>
                    <button onClick={handleSave} className={styles.saveBtn}>
                        {saved ? '✓ تم الحفظ' : 'حفظ التغييرات'}
                    </button>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>ℹ️ معلومات النظام</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>الإصدار</span>
                        <span className={styles.infoValue}>1.0.0</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>بيانات الدخول</span>
                        <span className={styles.infoValue}>admin / admin123</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
