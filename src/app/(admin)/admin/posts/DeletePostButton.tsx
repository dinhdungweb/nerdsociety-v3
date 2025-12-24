'use client'

import { TrashIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface DeletePostButtonProps {
    postId: string
    postTitle: string
}

export default function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`Bạn có chắc muốn xóa bài viết "${postTitle}"?`)) {
            return
        }

        setLoading(true)
        try {
            const res = await fetch(`/api/admin/posts/${postId}`, {
                method: 'DELETE',
            })

            if (res.ok) {
                router.refresh()
            } else {
                alert('Có lỗi xảy ra khi xóa bài viết')
            }
        } catch (error) {
            console.error(error)
            alert('Có lỗi xảy ra')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="flex size-8 items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 disabled:opacity-50"
        >
            <TrashIcon className="size-4" />
        </button>
    )
}
