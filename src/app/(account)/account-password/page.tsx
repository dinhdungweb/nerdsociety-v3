'use client'

import ButtonPrimary from '@/shared/ButtonPrimary'
import { Divider } from '@/shared/divider'
import { Field, Label } from '@/shared/fieldset'
import Input from '@/shared/Input'
import T from '@/utils/getT'
import { useState } from 'react'
import toast from 'react-hot-toast'

const Page = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Đổi mật khẩu thất bại')
        return
      }

      toast.success('Đổi mật khẩu thành công!')
      // Reset form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      toast.error('Đã xảy ra lỗi khi đổi mật khẩu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {/* HEADING */}
      <h1 className="text-3xl font-semibold">{T['accountPage']['Update your password']}</h1>

      <Divider className="my-8 w-14!" />

      <form onSubmit={handleSubmitForm} className="max-w-xl space-y-6">
        <Field>
          <Label>{T['accountPage']['Current password']}</Label>
          <Input
            type="password"
            className="mt-1.5"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </Field>
        <Field>
          <Label>{T['accountPage']['New password']}</Label>
          <Input
            type="password"
            className="mt-1.5"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </Field>
        <Field>
          <Label>{T['accountPage']['Confirm password']}</Label>
          <Input
            type="password"
            className="mt-1.5"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Field>
        <div className="pt-4">
          <ButtonPrimary type="submit" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : T['accountPage']['Update password']}
          </ButtonPrimary>
        </div>
      </form>
    </div>
  )
}

export default Page

