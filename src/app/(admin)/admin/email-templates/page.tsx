'use client'

import { useState, useEffect } from 'react'
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EnvelopeIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface EmailTemplate {
    id: string
    name: string
    subject: string
    content: string
    variables: string | null
    isActive: boolean
    updatedAt: string
}

const defaultTemplates = [
    { name: 'booking_confirmation', label: 'Xác nhận đặt lịch (đã cọc)' },
    { name: 'booking_pending', label: 'Tiếp nhận đặt lịch (chờ cọc)' },
    { name: 'password_reset', label: 'Đặt lại mật khẩu' },
    { name: 'booking_cancelled', label: 'Hủy đặt lịch' },
    { name: 'checkin_reminder', label: 'Nhắc check-in' },
]

// SVG Icons for Prebuilt Templates
const PREBUILT_ICONS = {
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    clock: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    mapPin: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9B7850" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    bell: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>'
}

const getBaseTemplateString = (content: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #FAF5EB; margin: 0; padding: 20px 0; }
        .card { background-color: #ffffff; border-radius: 20px; padding: 40px; border: 1px solid #EBE1D2; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .h1 { color: #28241E; font-size: 24px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; }
        .p { color: #554E41; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
        .info-box { background-color: #FDFBFA; border-radius: 14px; padding: 24px; border: 1px solid #F5F2EB; margin-bottom: 24px; }
        .info-header { font-size: 13px; font-weight: 700; color: #9B7850; text-transform: uppercase; margin-bottom: 16px; display: flex; align-items: center; }
        .info-item { margin-bottom: 12px; font-size: 15px; display: flex; align-items: center; color: #28241E; }
        .info-label { color: #A09081; font-weight: 500; width: 120px; flex-shrink: 0; }
        .button { display: inline-block; background-color: #9B7850; color: #ffffff !important; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 600; text-align: center; }
        .footer { text-align: center; margin-top: 40px; color: #A09081; font-size: 13px; }
        @media (max-width: 600px) {
            body { padding: 10px 0; }
            .card { border-radius: 0; padding: 32px 20px; border-left: none; border-right: none; }
            .info-item { flex-wrap: wrap; }
            .info-label { width: 100%; margin-bottom: 4px; }
        }
    </style>
</head>
<body>
    <div style="text-align: center; margin-bottom: 30px; padding: 0 20px;">
        <div style="font-size: 24px; font-weight: 800; color: #9B7850; letter-spacing: 2px;">NERD SOCIETY</div>
        <div style="font-size: 12px; color: #786E5F; letter-spacing: 4px; border-top: 1px solid #EBE1D2; display: inline-block; padding-top: 5px;">STUDY & WORK SPACE</div>
    </div>
    <div class="card">${content}</div>
    <div class="footer" style="padding: 0 20px;">
        <p>&copy; ${new Date().getFullYear()} Nerd Society. All rights reserved.</p>
        <p>Hotline: 036 848 3689</p>
    </div>
</body>
</html>
`

// Pre-built templates for each email type
const prebuiltTemplates: Record<string, { subject: string; content: string }> = {
    booking_confirmation: {
        subject: '[Nerd Society] Xác nhận đặt lịch #{{bookingCode}}',
        content: getBaseTemplateString(`
            <h1 class="h1">${PREBUILT_ICONS.check}Đặt lịch thành công!</h1>
            <p class="p">Xin chào <strong>{{customerName}}</strong>,</p>
            <p class="p">Đặt lịch của bạn đã được xác nhận. Chúng tôi rất mong chờ được đón tiếp bạn.</p>
            
            <div class="info-box">
                <div class="info-header">${PREBUILT_ICONS.info}Chi tiết đặt lịch</div>
                <div class="info-item"><span class="info-label">Mã đặt lịch</span><strong>#{{bookingCode}}</strong></div>
                <div class="info-item"><span class="info-label">Cơ sở</span><strong>{{locationName}}</strong></div>
                <div class="info-item"><span class="info-label">Dịch vụ</span><strong>{{serviceName}}</strong></div>
                <div class="info-item"><span class="info-label">Thời gian</span><strong>{{date}} | {{startTime}} - {{endTime}}</strong></div>
                <div class="info-item"><span class="info-label">Tổng tiền</span><strong style="color: #9B7850; font-size: 18px;">{{amount}}</strong></div>
            </div>

            <div style="text-align: center; margin-top: 32px;">
                <a href="{{bookingUrl}}" class="button">Quản lý lịch hẹn</a>
            </div>
        `)
    },
    booking_pending: {
        subject: '[Nerd Society] Tiếp nhận đặt lịch #{{bookingCode}}',
        content: getBaseTemplateString(`
            <h1 class="h1">Đã nhận yêu cầu đặt lịch</h1>
            <p class="p">Xin chào <strong>{{customerName}}</strong>,</p>
            <p class="p">Chúng tôi đã nhận được yêu cầu của bạn. Vui lòng hoàn tất thanh toán để giữ chỗ tốt nhất.</p>
            
            <div class="info-box">
                <div class="info-header">${PREBUILT_ICONS.info}Thông tin chờ thanh toán</div>
                <div class="info-item"><span class="info-label">Mã đặt lịch</span><strong>#{{bookingCode}}</strong></div>
                <div class="info-item"><span class="info-label">Dịch vụ</span><strong>{{serviceName}}</strong></div>
                <div class="info-item"><span class="info-label">Thời gian</span><strong>{{date}} | {{startTime}} - {{endTime}}</strong></div>
                <div class="info-item"><span class="info-label">Cần thanh toán</span><strong style="color: #9B7850; font-size: 18px;">{{amount}}</strong></div>
            </div>

            <div style="text-align: center; margin-top: 32px;">
                <a href="{{bookingUrl}}" class="button">Thanh toán ngay</a>
            </div>
        `)
    },
    password_reset: {
        subject: '[Nerd Society] Khôi phục mật khẩu',
        content: getBaseTemplateString(`
            <h1 class="h1">Đặt lại mật khẩu</h1>
            <p class="p">Chào bạn, chúng tôi nhận được yêu cầu thay đổi mật khẩu cho tài khoản của bạn.</p>
            <p class="p">Vui lòng nhấn vào nút bên dưới để tiến hành đặt mới (Link có hiệu lực trong 1 giờ):</p>
            
            <div style="text-align: center; margin: 40px 0;">
                <a href="{{resetUrl}}" class="button">Khôi phục mật khẩu</a>
            </div>

            <p class="p" style="font-size: 14px; color: #A09081; text-align: center;">Nếu bạn không yêu cầu thay đổi này, hãy bỏ qua email này.</p>
        `)
    },
    booking_cancelled: {
        subject: '[Nerd Society] Đặt lịch #{{bookingCode}} đã bị hủy',
        content: getBaseTemplateString(`
            <h1 class="h1" style="color: #dc2626;">Thông báo hủy lịch hẹn</h1>
            <p class="p">Chào <strong>{{customerName}}</strong>, đặt lịch #{{bookingCode}} của bạn đã bị hủy.</p>
            
            <div class="info-box" style="border-left: 4px solid #dc2626;">
                <div class="info-header" style="color: #dc2626;">${PREBUILT_ICONS.info}Thông tin lịch đã hủy</div>
                <div class="info-item"><span class="info-label">Dịch vụ</span><strong>{{serviceName}}</strong></div>
                <div class="info-item"><span class="info-label">Thời gian</span><strong>{{date}} | {{startTime}} - {{endTime}}</strong></div>
            </div>

            <p class="p">Nếu bạn đã thanh toán cọc, vui lòng liên hệ hotline 036 848 3689 để được hỗ trợ hoàn tiền.</p>
        `)
    },
    checkin_reminder: {
        subject: '[Nerd Society] Hẹn gặp bạn tại #{{locationName}}',
        content: getBaseTemplateString(`
            <h1 class="h1">${PREBUILT_ICONS.bell}Nhắc nhở lịch hẹn sắp tới</h1>
            <p class="p">Chào <strong>{{customerName}}</strong>, chúng tôi rất mong chờ được đón tiếp bạn hôm nay.</p>
            
            <div class="info-box" style="border-left: 4px solid #9B7850;">
                <div class="info-header">${PREBUILT_ICONS.calendar}Thông tin lịch hẹn</div>
                <div class="info-item"><span class="info-label">Cơ sở</span><strong>{{locationName}}</strong></div>
                <div class="info-item"><span class="info-label">Thời gian</span><strong>{{startTime}} - {{endTime}}</strong></div>
            </div>

            <div style="text-align: center; margin-top: 32px;">
                <a href="{{bookingUrl}}" class="button">Xem hướng dẫn chỉ đường</a>
            </div>
        `)
    },
}

const availableVariables = [
    { name: 'customerName', description: 'Tên khách hàng' },
    { name: 'bookingCode', description: 'Mã booking' },
    { name: 'serviceName', description: 'Tên dịch vụ/phòng' },
    { name: 'locationName', description: 'Tên cơ sở' },
    { name: 'date', description: 'Ngày đặt' },
    { name: 'startTime', description: 'Giờ bắt đầu' },
    { name: 'endTime', description: 'Giờ kết thúc' },
    { name: 'amount', description: 'Tổng tiền' },
    { name: 'bookingUrl', description: 'Link xem chi tiết' },
    { name: 'resetUrl', description: 'Link đặt lại mật khẩu' },
]

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [previewMode, setPreviewMode] = useState(false) // Toggle between code and preview

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        content: '',
        isActive: true,
    })

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/admin/email-templates')
            const data = await res.json()
            if (res.ok) {
                setTemplates(data.templates)
            }
        } catch (error) {
            console.error('Error fetching templates:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTemplates()
    }, [])

    const handleEdit = (template: EmailTemplate) => {
        setSelectedTemplate(template)
        setFormData({
            name: template.name,
            subject: template.subject,
            content: template.content,
            isActive: template.isActive,
        })
        setIsEditing(true)
    }

    const handleNew = () => {
        setSelectedTemplate(null)
        setFormData({
            name: '',
            subject: '',
            content: '',
            isActive: true,
        })
        setPreviewMode(false)
        setIsEditing(true)
    }

    // Handle template type selection - auto-fill with prebuilt template
    const handleTemplateTypeChange = (templateName: string) => {
        setFormData(prev => ({ ...prev, name: templateName }))

        // Auto-fill subject and content if a prebuilt template exists
        if (templateName && prebuiltTemplates[templateName]) {
            const prebuilt = prebuiltTemplates[templateName]
            setFormData(prev => ({
                ...prev,
                name: templateName,
                subject: prebuilt.subject,
                content: prebuilt.content,
            }))
        }
    }

    const handleSave = async () => {
        if (!formData.name || !formData.subject || !formData.content) {
            toast.error('Vui lòng điền đầy đủ thông tin')
            return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/admin/email-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedTemplate?.id,
                    ...formData,
                    variables: JSON.stringify(availableVariables.map(v => v.name)),
                }),
            })
            const data = await res.json()

            if (!res.ok) throw new Error(data.error)

            toast.success(selectedTemplate ? 'Đã cập nhật template' : 'Đã tạo template mới')
            setIsEditing(false)
            fetchTemplates()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa template này?')) return

        try {
            const res = await fetch(`/api/admin/email-templates?id=${id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                toast.success('Đã xóa template')
                fetchTemplates()
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra')
        }
    }

    const insertVariable = (varName: string) => {
        setFormData(prev => ({
            ...prev,
            content: prev.content + `{{${varName}}}`,
        }))
    }

    if (isEditing) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {selectedTemplate ? 'Chỉnh sửa template' : 'Tạo template mới'}
                    </h1>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                    >
                        ← Quay lại
                    </button>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Loại template
                                    </label>
                                    <select
                                        value={formData.name}
                                        onChange={(e) => handleTemplateTypeChange(e.target.value)}
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                        disabled={!!selectedTemplate}
                                    >
                                        <option value="">-- Chọn loại template --</option>
                                        {defaultTemplates.map((t) => (
                                            <option key={t.name} value={t.name}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Chọn loại sẽ tự động điền sẵn nội dung mẫu đẹp
                                    </p>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Tiêu đề email
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                                        placeholder="Xác nhận đặt lịch #{{bookingCode}}"
                                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Nội dung email
                                        </label>
                                        <div className="flex rounded-lg border border-neutral-300 dark:border-neutral-700">
                                            <button
                                                type="button"
                                                onClick={() => setPreviewMode(false)}
                                                className={`px-3 py-1 text-sm ${!previewMode ? 'bg-primary-600 text-white' : 'text-neutral-600 dark:text-neutral-400'} rounded-l-lg`}
                                            >
                                                Code
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPreviewMode(true)}
                                                className={`px-3 py-1 text-sm ${previewMode ? 'bg-primary-600 text-white' : 'text-neutral-600 dark:text-neutral-400'} rounded-r-lg`}
                                            >
                                                Xem trước
                                            </button>
                                        </div>
                                    </div>
                                    {previewMode ? (
                                        <div className="rounded-lg border border-neutral-300 bg-white p-4 dark:border-neutral-700 dark:bg-white" style={{ minHeight: '480px' }}>
                                            <iframe
                                                srcDoc={formData.content}
                                                className="h-[450px] w-full border-0"
                                                title="Email Preview"
                                            />
                                        </div>
                                    ) : (
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                            rows={20}
                                            placeholder="Chọn loại template ở trên để tự động điền nội dung mẫu..."
                                            className="w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                                        />
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                        className="rounded border-neutral-300"
                                    />
                                    <label htmlFor="isActive" className="text-sm text-neutral-700 dark:text-neutral-300">
                                        Kích hoạt template
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="flex-1 rounded-lg border border-neutral-300 px-4 py-2 font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                            >
                                {saving ? 'Đang lưu...' : 'Lưu template'}
                            </button>
                        </div>
                    </div>

                    {/* Variables sidebar */}
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                        <h3 className="mb-4 font-semibold text-neutral-900 dark:text-white">Biến có thể dùng</h3>
                        <p className="mb-4 text-sm text-neutral-500">Click để chèn vào nội dung</p>
                        <div className="space-y-2">
                            {availableVariables.map((v) => (
                                <button
                                    key={v.name}
                                    onClick={() => insertVariable(v.name)}
                                    className="flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                                >
                                    <code className="text-primary-600">{`{{${v.name}}}`}</code>
                                    <span className="text-xs text-neutral-400">{v.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    Email Templates
                </h1>
                <button
                    onClick={handleNew}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                    <PlusIcon className="size-4" />
                    Tạo template
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="size-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
                </div>
            ) : templates.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {templates.map((template) => (
                        <div
                            key={template.id}
                            className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                        <EnvelopeIcon className="size-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                            {template.subject}
                                        </p>
                                    </div>
                                </div>
                                {template.isActive ? (
                                    <span className="flex items-center gap-1 text-xs text-green-600">
                                        <CheckCircleIcon className="size-4" />
                                        Active
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                                        <XCircleIcon className="size-4" />
                                        Inactive
                                    </span>
                                )}
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => handleEdit(template)}
                                    className="flex items-center gap-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300"
                                >
                                    <PencilIcon className="size-4" />
                                    Sửa
                                </button>
                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-900/20"
                                >
                                    <TrashIcon className="size-4" />
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-700">
                    <EnvelopeIcon className="mx-auto size-12 text-neutral-300 dark:text-neutral-600" />
                    <p className="mt-4 text-neutral-500">Chưa có email template nào</p>
                    <button
                        onClick={handleNew}
                        className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    >
                        Tạo template đầu tiên
                    </button>
                </div>
            )}
        </div>
    )
}
