import nodemailer from 'nodemailer'
import { prisma } from './prisma'

// Get SMTP setting from database with fallback to env
async function getSmtpSetting(key: string, envFallback: string | undefined): Promise<string> {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key },
        })
        if (setting?.value) return setting.value
    } catch (error) {
        // Ignore error, use fallback
    }
    return envFallback || ''
}

// Create transporter dynamically using DB settings or env fallback
async function createTransporter() {
    const host = await getSmtpSetting('smtpHost', process.env.SMTP_HOST) || 'smtp.gmail.com'
    const port = parseInt(await getSmtpSetting('smtpPort', process.env.SMTP_PORT) || '587')
    const user = await getSmtpSetting('smtpUser', process.env.SMTP_USER)
    const pass = await getSmtpSetting('smtpPass', process.env.SMTP_PASS)

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
            user,
            pass,
        },
    })
}

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string
    subject: string
    html: string
}) {
    try {
        const smtpUser = await getSmtpSetting('smtpUser', process.env.SMTP_USER)

        // Skip if SMTP is not configured
        if (!smtpUser || smtpUser.includes('your-email')) {
            console.log('⚠️ Email SMTP not configured. Skipping email:', { to, subject })
            return
        }

        const transporter = await createTransporter()
        const smtpFrom = await getSmtpSetting('smtpFrom', process.env.SMTP_FROM) || '"Nerd Society" <no-reply@nerdsociety.com.vn>'

        await transporter.sendMail({
            from: smtpFrom,
            to,
            subject,
            html,
        })
        console.log('✅ Email sent to:', to)
    } catch (error) {
        console.error('❌ Email error:', error)
    }
}

// Helper function to get email template from database
async function getEmailTemplate(name: string): Promise<{ subject: string; content: string } | null> {
    try {
        const template = await prisma.emailTemplate.findUnique({
            where: { name },
        })
        if (template && template.isActive) {
            return { subject: template.subject, content: template.content }
        }
    } catch (error) {
        console.error('Error fetching email template:', error)
    }
    return null
}

// Helper function to replace variables in template
function replaceVariables(content: string, variables: Record<string, string>): string {
    let result = content
    for (const [key, value] of Object.entries(variables)) {
        // Support both $variable and {{variable}} formats
        result = result.replace(new RegExp(`\\$${key}`, 'g'), value)
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
    return result
}

// Check if email type is enabled in settings
async function isEmailEnabled(settingKey: string): Promise<boolean> {
    try {
        const setting = await prisma.setting.findUnique({
            where: { key: settingKey },
        })
        // Default to enabled if setting doesn't exist
        if (!setting) return true
        return setting.value === 'true'
    } catch (error) {
        console.error('Error checking email setting:', error)
        return true // Default to enabled on error
    }
}

// SVG Icons for Emails
const ICONS = {
    calendar: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
    clock: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    mapPin: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9B7850" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 8px;"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    bell: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>'
}

// Base Email Template Component (Modern & Professional)
function getBaseTemplate(content: string, title?: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title || 'Nerd Society'}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #FAF5EB;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 40px 20px;
            }
            .header {
                text-align: center;
                margin-bottom: 32px;
            }
            .logo-text {
                font-size: 24px;
                font-weight: 800;
                color: #9B7850;
                letter-spacing: 2px;
                text-transform: uppercase;
                margin: 0;
            }
            .logo-sub {
                font-size: 12px;
                color: #786E5F;
                letter-spacing: 4px;
                margin-top: 4px;
            }
            .card {
                background-color: #ffffff;
                border-radius: 20px;
                padding: 40px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                border: 1px solid #EBE1D2;
            }
            .h1 {
                color: #28241E;
                font-size: 24px;
                font-weight: 700;
                margin-top: 0;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
            }
            .p {
                color: #554E41;
                font-size: 16px;
                line-height: 1.6;
                margin-top: 0;
                margin-bottom: 24px;
            }
            .info-box {
                background-color: #FDFBFA;
                border-radius: 14px;
                padding: 24px;
                border: 1px solid #F5F2EB;
                margin-bottom: 24px;
            }
            .info-header {
                font-size: 13px;
                font-weight: 700;
                color: #9B7850;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 16px;
                display: flex;
                align-items: center;
            }
            .info-item {
                margin-bottom: 12px;
                font-size: 15px;
                display: flex;
                align-items: center;
                color: #28241E;
            }
            .info-label {
                color: #A09081;
                font-weight: 500;
                width: 120px;
                flex-shrink: 0;
            }
            .info-value {
                font-weight: 600;
            }
            .button {
                display: inline-block;
                background-color: #9B7850;
                color: #ffffff !important;
                padding: 16px 32px;
                border-radius: 14px;
                text-decoration: none;
                font-weight: 600;
                font-size: 16px;
                text-align: center;
                box-shadow: 0 4px 14px 0 rgba(155, 120, 80, 0.3);
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                color: #A09081;
                font-size: 13px;
                line-height: 1.6;
            }
            .footer-links {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #EBE1D2;
            }
            .footer-link {
                color: #9B7850;
                text-decoration: none;
                font-weight: 500;
                margin: 0 10px;
            }
            @media (max-width: 600px) {
                .container { padding: 20px 0; } /* Remove side padding on container */
                .card { padding: 32px 20px; border-radius: 0; border-left: none; border-right: none; } /* Edge-to-edge on mobile */
                .info-box { padding: 20px 16px; }
                .info-item { flex-wrap: wrap; }
                .info-label { width: 100%; margin-bottom: 4px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-text">NERD SOCIETY</div>
                <div class="logo-sub">STUDY & WORK SPACE</div>
            </div>
            <div class="card">
                ${content}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Nerd Society. All rights reserved.</p>
                <div class="footer-links">
                    <a href="${process.env.NEXTAUTH_URL}" class="footer-link">Trang chủ</a>
                    <span style="color: #EBE1D2">•</span>
                    <a href="${process.env.NEXTAUTH_URL}/profile/bookings" class="footer-link">Lịch hẹn của tôi</a>
                </div>
                <p style="margin-top: 16px;">
                    Hotline: <strong>036 848 3689</strong>
                </p>
            </div>
        </div>
    </body>
    </html>
    `
}

export async function sendBookingEmail(booking: any) {
    const isConfirmed = booking.status === 'CONFIRMED'
    const settingKey = isConfirmed ? 'emailBookingConfirmation' : 'emailBookingPending'

    const enabled = await isEmailEnabled(settingKey)
    if (!enabled) return

    const recipientEmail = booking.user?.email || booking.customerEmail
    if (!recipientEmail) return

    const customerName = booking.user?.name || booking.customerName || 'Quý khách'
    const serviceName = booking.room?.name || booking.combo?.name || 'Dịch vụ'
    const amount = booking.estimatedAmount || booking.totalAmount || 0
    const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

    const templateName = isConfirmed ? 'booking_confirmation' : 'booking_pending'

    const variables: Record<string, string> = {
        customerName,
        bookingCode: booking.bookingCode,
        locationName: booking.location?.name || 'N/A',
        serviceName,
        date: new Date(booking.date).toLocaleDateString('vi-VN'),
        startTime: booking.startTime,
        endTime: booking.endTime,
        amount: formattedAmount,
        bookingUrl: `${process.env.NEXTAUTH_URL}/profile/bookings/${booking.id}`,
    }

    const dbTemplate = await getEmailTemplate(templateName)

    let subject: string
    let html: string

    if (dbTemplate) {
        subject = replaceVariables(dbTemplate.subject, variables)
        html = replaceVariables(dbTemplate.content, variables)
    } else {
        const isCash = booking.payment?.method === 'CASH'

        subject = isConfirmed
            ? `[Nerd Society] Xác nhận đặt lịch #${booking.bookingCode}`
            : `[Nerd Society] Tiếp nhận đặt lịch #${booking.bookingCode}`

        const h1 = isConfirmed ? 'Đặt lịch thành công!' : 'Đã nhận yêu cầu đặt lịch'
        const description = isConfirmed
            ? (isCash ? 'Đặt lịch của bạn đã được xác nhận. Vui lòng thanh toán tại quầy khi đến.' : 'Cảm ơn bạn đã thanh toán. Đặt lịch của bạn đã được xác nhận.')
            : 'Chúng tôi đã nhận được yêu cầu của bạn. Vui lòng thanh toán để hoàn tất việc giữ chỗ.'

        const content = `
            <h1 class="h1">${isConfirmed ? ICONS.check : ''}${h1}</h1>
            <p class="p">Xin chào <strong>${customerName}</strong>,</p>
            <p class="p">${description}</p>
            
            <div class="info-box">
                <div class="info-header">${ICONS.info}Chi tiết đặt lịch</div>
                <div class="info-item"><span class="info-label">Mã đặt lịch</span><span class="info-value">#${booking.bookingCode}</span></div>
                <div class="info-item"><span class="info-label">Cơ sở</span><span class="info-value">${booking.location?.name || 'N/A'}</span></div>
                <div class="info-item"><span class="info-label">Dịch vụ</span><span class="info-value">${serviceName}</span></div>
                <div class="info-item"><span class="info-label">Thời gian</span><span class="info-value">${ICONS.calendar}${variables.date} | ${ICONS.clock}${booking.startTime} - ${booking.endTime}</span></div>
                <div class="info-item"><span class="info-label">Tổng tiền</span><span class="info-value" style="color: #9B7850; font-size: 18px;">${formattedAmount}</span></div>
            </div>

            <div style="text-align: center; margin-top: 40px;">
                <a href="${variables.bookingUrl}" class="button">Quản lý lịch hẹn</a>
            </div>
        `
        html = getBaseTemplate(content, subject)
    }

    await sendEmail({ to: recipientEmail, subject, html })
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const enabled = await isEmailEnabled('emailPasswordReset')
    if (!enabled) return

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`
    const dbTemplate = await getEmailTemplate('password_reset')

    let subject: string
    let html: string

    const variables: Record<string, string> = { resetUrl, email }

    if (dbTemplate) {
        subject = replaceVariables(dbTemplate.subject, variables)
        html = replaceVariables(dbTemplate.content, variables)
    } else {
        subject = '[Nerd Society] Khôi phục mật khẩu'
        const content = `
            <h1 class="h1">Đặt lại mật khẩu</h1>
            <p class="p">Chúng tôi nhận được yêu cầu thay đổi mật khẩu cho tài khoản <strong>${email}</strong>.</p>
            <p class="p">Vui lòng nhấn vào nút bên dưới để tiến hành đặt mới (Đường dẫn có hiệu lực trong 1 giờ):</p>
            
            <div style="text-align: center; margin: 48px 0;">
                <a href="${resetUrl}" class="button">Khôi phục mật khẩu</a>
            </div>

            <p class="p" style="font-size: 14px; color: #A09081; text-align: center;">Nếu bạn không yêu cầu thay đổi này, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
        `
        html = getBaseTemplate(content, subject)
    }

    await sendEmail({ to: email, subject, html })
}

export async function sendBookingCancelledEmail(booking: any) {
    const enabled = await isEmailEnabled('emailBookingCancelled')
    if (!enabled) return

    const recipientEmail = booking.user?.email || booking.customerEmail
    if (!recipientEmail) return

    const customerName = booking.user?.name || booking.customerName || 'Quý khách'
    const serviceName = booking.room?.name || booking.combo?.name || 'Dịch vụ'
    const amount = booking.estimatedAmount || booking.totalAmount || 0
    const formattedAmount = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

    const variables: Record<string, string> = {
        customerName,
        bookingCode: booking.bookingCode,
        locationName: booking.location?.name || 'N/A',
        serviceName,
        date: new Date(booking.date).toLocaleDateString('vi-VN'),
        startTime: booking.startTime,
        endTime: booking.endTime,
        amount: formattedAmount,
    }

    const dbTemplate = await getEmailTemplate('booking_cancelled')

    let subject: string
    let html: string

    if (dbTemplate) {
        subject = replaceVariables(dbTemplate.subject, variables)
        html = replaceVariables(dbTemplate.content, variables)
    } else {
        subject = `[Nerd Society] Đặt lịch #${booking.bookingCode} đã bị hủy`
        const content = `
            <h1 class="h1" style="color: #dc2626;">Thông báo hủy lịch hẹn</h1>
            <p class="p">Chào <strong>${customerName}</strong>, chúng tôi rất tiếc phải thông báo rằng đặt lịch của bạn đã bị hủy.</p>
            
            <div class="info-box" style="border-left: 4px solid #dc2626; background-color: #FFF5F5;">
                <div class="info-header" style="color: #dc2626;">${ICONS.info}Thông tin lịch đã hủy</div>
                <div class="info-item"><span class="info-label">Mã đặt lịch</span><span class="info-value">#${booking.bookingCode}</span></div>
                <div class="info-item"><span class="info-label">Cơ sở</span><span class="info-value">${booking.location?.name || 'N/A'}</span></div>
                <div class="info-item"><span class="info-label">Thời gian</span><span class="info-value">${ICONS.calendar}${variables.date} | ${ICONS.clock}${booking.startTime} - ${booking.endTime}</span></div>
            </div>

            <p class="p">Nếu bạn đã chuyển khoản cọc, vui lòng phản hồi email này hoặc gọi hotline để chúng tôi tiến hành hoàn trả.</p>
        `
        html = getBaseTemplate(content, subject)
    }

    await sendEmail({ to: recipientEmail, subject, html })
}

export async function sendCheckinReminderEmail(booking: any) {
    const enabled = await isEmailEnabled('emailCheckinReminder')
    if (!enabled) return

    const recipientEmail = booking.user?.email || booking.customerEmail
    if (!recipientEmail) return

    const customerName = booking.user?.name || booking.customerName || 'Quý khách'
    const serviceName = booking.room?.name || booking.combo?.name || 'Dịch vụ'

    const variables: Record<string, string> = {
        customerName,
        bookingCode: booking.bookingCode,
        locationName: booking.location?.name || 'N/A',
        serviceName,
        date: new Date(booking.date).toLocaleDateString('vi-VN'),
        startTime: booking.startTime,
        endTime: booking.endTime,
        bookingUrl: `${process.env.NEXTAUTH_URL}/profile/bookings/${booking.id}`,
    }

    const dbTemplate = await getEmailTemplate('checkin_reminder')

    let subject: string
    let html: string

    if (dbTemplate) {
        subject = replaceVariables(dbTemplate.subject, variables)
        html = replaceVariables(dbTemplate.content, variables)
    } else {
        subject = `[Nerd Society] Hẹn sớm gặp bạn tại #${booking.bookingCode}`
        const content = `
            <h1 class="h1">${ICONS.bell}Đừng quên lịch hẹn bạn nhé!</h1>
            <p class="p">Chào <strong>${customerName}</strong>, chúng tôi rất mong chờ được đón tiếp bạn vào ngày hôm nay.</p>
            
            <div class="info-box" style="border-left: 4px solid #9B7850;">
                <div class="info-header">${ICONS.calendar}Thông tin lịch hẹn</div>
                <div class="info-item"><span class="info-label">Mã đặt lịch</span><span class="info-value">#${booking.bookingCode}</span></div>
                <div class="info-item"><span class="info-label">Cơ sở</span><span class="info-value">${booking.location?.name}</span></div>
                <div class="info-item"><span class="info-label">Thời gian</span><span class="info-value">${ICONS.calendar}${variables.date} | ${ICONS.clock}${booking.startTime} - ${booking.endTime}</span></div>
                <div class="info-item" style="margin-top: 12px; font-size: 14px; color: #786E5F;">
                    ${ICONS.mapPin}<strong>Địa chỉ:</strong> ${booking.location?.address}
                </div>
            </div>

            <div style="text-align: center; margin-top: 40px;">
                <a href="${variables.bookingUrl}" class="button">Xem hướng dẫn chỉ đường</a>
            </div>
            
            <p class="p" style="margin-top: 24px; font-size: 14px; text-align: center; color: #A09081;">Vui lòng có mặt trước 10 phút để nhận chỗ tốt nhất.</p>
        `
        html = getBaseTemplate(content, subject)
    }

    await sendEmail({ to: recipientEmail, subject, html })
}

