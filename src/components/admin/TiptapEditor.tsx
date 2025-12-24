'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import Youtube from '@tiptap/extension-youtube'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import { useState, useCallback, useEffect } from 'react'
import MediaPickerModal from './MediaPickerModal'
import {
    PhotoIcon,
    LinkIcon,
    CodeBracketIcon,
    ArrowUturnLeftIcon,
    ArrowUturnRightIcon,
    TableCellsIcon,
    MinusIcon,
    XMarkIcon,
    PlayCircleIcon,
} from '@heroicons/react/24/outline'

interface TiptapEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

// Toolbar Button Component
const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title,
}: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title?: string
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-2 rounded-lg transition-colors ${isActive
            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {children}
    </button>
)

// Toolbar Divider
const ToolbarDivider = () => (
    <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1" />
)

// Color Picker Button
const ColorPicker = ({
    value,
    onChange,
    title,
}: {
    value: string
    onChange: (color: string) => void
    title: string
}) => (
    <div className="relative">
        <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            title={title}
            className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-600 cursor-pointer"
        />
    </div>
)

// Icons
const BoldIcon = () => (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
)

const ItalicIcon = () => (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="19" y1="4" x2="10" y2="4" />
        <line x1="14" y1="20" x2="5" y2="20" />
        <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
)

const UnderlineIcon = () => (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 4v6a6 6 0 0 0 12 0V4" />
        <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
)

const StrikeIcon = () => (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 3.6 3.9h.2m8.2 3.7c.3.4.4.8.4 1.3 0 2.9-2.7 3.6-6.2 3.6-2.3 0-4.4-.3-6.2-.9" />
        <line x1="4" y1="12" x2="20" y2="12" />
    </svg>
)

const ListIcon = () => (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
)

const OrderedListIcon = () => (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="10" y1="6" x2="21" y2="6" />
        <line x1="10" y1="12" x2="21" y2="12" />
        <line x1="10" y1="18" x2="21" y2="18" />
        <path d="M4 6h1v4" />
        <path d="M4 10h2" />
        <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
    </svg>
)

const QuoteIcon = () => (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z" />
    </svg>
)

const SubscriptIcon = () => (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 5l8 8" />
        <path d="M12 5L4 13" />
        <path d="M20 19h-4c0-1.5.44-2 1.5-2.5S20 15.33 20 14.5a1.5 1.5 0 00-3 0" />
    </svg>
)

const SuperscriptIcon = () => (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19l8-8" />
        <path d="M12 19L4 11" />
        <path d="M20 9h-4c0-1.5.44-2 1.5-2.5S20 5.33 20 4.5a1.5 1.5 0 00-3 0" />
    </svg>
)

const HighlightIcon = () => (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11l-6 6v3h9l3-3" />
        <path d="M22 12l-4.6 4.6a2 2 0 01-2.8 0l-5.2-5.2a2 2 0 010-2.8L14 4" />
    </svg>
)

const ClearFormatIcon = () => (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7V4h16v3" />
        <path d="M9 20h6" />
        <path d="M12 4v16" />
        <path d="M2 2l20 20" />
    </svg>
)

export default function TiptapEditor({ value, onChange, placeholder }: TiptapEditorProps) {
    const [showMediaPicker, setShowMediaPicker] = useState(false)
    const [showLinkInput, setShowLinkInput] = useState(false)
    const [showYoutubeInput, setShowYoutubeInput] = useState(false)
    const [showTableMenu, setShowTableMenu] = useState(false)
    const [linkUrl, setLinkUrl] = useState('')
    const [youtubeUrl, setYoutubeUrl] = useState('')
    const [textColor, setTextColor] = useState('#000000')
    const [highlightColor, setHighlightColor] = useState('#ffff00')

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4],
                },
                horizontalRule: false,
            }),
            HorizontalRule,
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg my-4',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary-600 hover:text-primary-700 underline',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Underline,
            Placeholder.configure({
                placeholder: placeholder || 'Bắt đầu viết nội dung...',
            }),
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            Subscript,
            Superscript,
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full',
                },
            }),
            TableRow,
            TableHeader,
            TableCell,
            Youtube.configure({
                width: 640,
                height: 360,
                HTMLAttributes: {
                    class: 'rounded-lg my-4',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
    })

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value)
        }
    }, [value, editor])

    const handleImageSelect = useCallback((urls: string[]) => {
        if (editor && urls.length > 0) {
            urls.forEach((url) => {
                editor.chain().focus().setImage({ src: url }).run()
            })
        }
    }, [editor])

    const handleLink = useCallback(() => {
        if (!editor) return
        const previousUrl = editor.getAttributes('link').href
        setLinkUrl(previousUrl || '')
        setShowLinkInput(true)
    }, [editor])

    const applyLink = useCallback(() => {
        if (!editor) return
        if (linkUrl === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
        }
        setShowLinkInput(false)
        setLinkUrl('')
    }, [editor, linkUrl])

    const insertYoutube = useCallback(() => {
        if (!editor || !youtubeUrl) return
        editor.commands.setYoutubeVideo({ src: youtubeUrl })
        setShowYoutubeInput(false)
        setYoutubeUrl('')
    }, [editor, youtubeUrl])

    const insertTable = useCallback(() => {
        if (!editor) return
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        setShowTableMenu(false)
    }, [editor])

    if (!editor) {
        return (
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                <div className="h-12 bg-neutral-50 dark:bg-neutral-800 animate-pulse" />
                <div className="h-[300px] bg-white dark:bg-neutral-900 animate-pulse" />
            </div>
        )
    }

    return (
        <div className="border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-white dark:bg-neutral-900">
            {/* Toolbar Row 1 */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                {/* Undo/Redo */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Hoàn tác (Ctrl+Z)"
                >
                    <ArrowUturnLeftIcon className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Làm lại (Ctrl+Y)"
                >
                    <ArrowUturnRightIcon className="size-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Headings */}
                <select
                    onChange={(e) => {
                        const level = parseInt(e.target.value)
                        if (level === 0) {
                            editor.chain().focus().setParagraph().run()
                        } else {
                            editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 }).run()
                        }
                    }}
                    value={
                        editor.isActive('heading', { level: 1 }) ? 1 :
                            editor.isActive('heading', { level: 2 }) ? 2 :
                                editor.isActive('heading', { level: 3 }) ? 3 :
                                    editor.isActive('heading', { level: 4 }) ? 4 : 0
                    }
                    className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-sm bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 cursor-pointer bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns%3d%22http%3a%2f%2fwww.w3.org%2f2000%2fsvg%22%20viewBox%3d%220%200%2020%2020%22%20fill%3d%22%236b7280%22%3e%3cpath%20fill-rule%3d%22evenodd%22%20d%3d%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%20clip-rule%3d%22evenodd%22%2f%3e%3c%2fsvg%3e')] bg-[length:1.25rem] bg-[right_0.25rem_center] bg-no-repeat"
                >
                    <option value={0}>Văn bản</option>
                    <option value={1}>Tiêu đề 1</option>
                    <option value={2}>Tiêu đề 2</option>
                    <option value={3}>Tiêu đề 3</option>
                    <option value={4}>Tiêu đề 4</option>
                </select>

                <ToolbarDivider />

                {/* Text Formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="In đậm (Ctrl+B)"
                >
                    <BoldIcon />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="In nghiêng (Ctrl+I)"
                >
                    <ItalicIcon />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    title="Gạch chân (Ctrl+U)"
                >
                    <UnderlineIcon />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Gạch ngang"
                >
                    <StrikeIcon />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                    isActive={editor.isActive('subscript')}
                    title="Chỉ số dưới"
                >
                    <SubscriptIcon />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    isActive={editor.isActive('superscript')}
                    title="Chỉ số trên"
                >
                    <SuperscriptIcon />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Colors */}
                <div className="flex items-center gap-1">
                    <ColorPicker
                        value={textColor}
                        onChange={(color) => {
                            setTextColor(color)
                            editor.chain().focus().setColor(color).run()
                        }}
                        title="Màu chữ"
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHighlight({ color: highlightColor }).run()}
                        isActive={editor.isActive('highlight')}
                        title="Tô nền"
                    >
                        <HighlightIcon />
                    </ToolbarButton>
                    <input
                        type="color"
                        value={highlightColor}
                        onChange={(e) => setHighlightColor(e.target.value)}
                        title="Màu tô nền"
                        className="w-5 h-5 rounded cursor-pointer"
                    />
                </div>

                <ToolbarDivider />

                {/* Clear Formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    title="Xóa định dạng"
                >
                    <ClearFormatIcon />
                </ToolbarButton>
            </div>

            {/* Toolbar Row 2 */}
            <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                {/* Text Align */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    title="Căn trái"
                >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />
                    </svg>
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    title="Căn giữa"
                >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" />
                    </svg>
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    title="Căn phải"
                >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />
                    </svg>
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    isActive={editor.isActive({ textAlign: 'justify' })}
                    title="Căn đều"
                >
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </ToolbarButton>

                <ToolbarDivider />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Danh sách"
                >
                    <ListIcon />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Danh sách số"
                >
                    <OrderedListIcon />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Block Elements */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive('blockquote')}
                    title="Trích dẫn"
                >
                    <QuoteIcon />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive('codeBlock')}
                    title="Code block"
                >
                    <CodeBracketIcon className="size-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    title="Đường kẻ ngang"
                >
                    <MinusIcon className="size-4" />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Table */}
                <div className="relative">
                    <ToolbarButton
                        onClick={() => setShowTableMenu(!showTableMenu)}
                        isActive={editor.isActive('table')}
                        title="Bảng"
                    >
                        <TableCellsIcon className="size-4" />
                    </ToolbarButton>
                    {showTableMenu && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 p-2 z-50 min-w-[180px]">
                            <button
                                type="button"
                                onClick={insertTable}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm text-neutral-700 dark:text-neutral-300"
                            >
                                Chèn bảng 3x3
                            </button>
                            {editor.isActive('table') && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableMenu(false) }}
                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm text-neutral-700 dark:text-neutral-300"
                                    >
                                        Thêm cột sau
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableMenu(false) }}
                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm text-neutral-700 dark:text-neutral-300"
                                    >
                                        Thêm hàng sau
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableMenu(false) }}
                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm text-red-500"
                                    >
                                        Xóa cột
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableMenu(false) }}
                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm text-red-500"
                                    >
                                        Xóa hàng
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false) }}
                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 text-sm text-red-500"
                                    >
                                        Xóa bảng
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <ToolbarDivider />

                {/* Media */}
                <ToolbarButton
                    onClick={() => setShowMediaPicker(true)}
                    title="Chèn hình ảnh"
                >
                    <PhotoIcon className="size-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={handleLink}
                    isActive={editor.isActive('link')}
                    title="Chèn liên kết"
                >
                    <LinkIcon className="size-4" />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => setShowYoutubeInput(true)}
                    title="Chèn video YouTube"
                >
                    <PlayCircleIcon className="size-4" />
                </ToolbarButton>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />

            {/* Media Picker Modal */}
            <MediaPickerModal
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={handleImageSelect}
                multiple
            />

            {/* Link Input Modal */}
            {showLinkInput && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Chèn liên kết</h3>
                            <button onClick={() => setShowLinkInput(false)} className="text-neutral-400 hover:text-neutral-600">
                                <XMarkIcon className="size-5" />
                            </button>
                        </div>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white mb-4"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') applyLink()
                                if (e.key === 'Escape') setShowLinkInput(false)
                            }}
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowLinkInput(false)} className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300">
                                Hủy
                            </button>
                            <button type="button" onClick={applyLink} className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                                Áp dụng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* YouTube Input Modal */}
            {showYoutubeInput && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Chèn video YouTube</h3>
                            <button onClick={() => setShowYoutubeInput(false)} className="text-neutral-400 hover:text-neutral-600">
                                <XMarkIcon className="size-5" />
                            </button>
                        </div>
                        <input
                            type="url"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white mb-4"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') insertYoutube()
                                if (e.key === 'Escape') setShowYoutubeInput(false)
                            }}
                        />
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowYoutubeInput(false)} className="px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300">
                                Hủy
                            </button>
                            <button type="button" onClick={insertYoutube} className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
                                Chèn
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .tiptap {
                    outline: none;
                }
                .tiptap p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #9ca3af;
                    pointer-events: none;
                    height: 0;
                }
                .tiptap img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 1rem 0;
                }
                .tiptap blockquote {
                    border-left: 4px solid #e5e7eb;
                    padding-left: 1rem;
                    margin: 1rem 0;
                    color: #6b7280;
                    font-style: italic;
                }
                .dark .tiptap blockquote {
                    border-color: #404040;
                    color: #9ca3af;
                }
                .tiptap pre {
                    background: #1f2937;
                    color: #e5e7eb;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    overflow-x: auto;
                }
                .tiptap code {
                    background: #f3f4f6;
                    padding: 0.125rem 0.25rem;
                    border-radius: 0.25rem;
                    font-size: 0.875rem;
                }
                .dark .tiptap code {
                    background: #374151;
                }
                .tiptap ul, .tiptap ol {
                    padding-left: 1.5rem;
                }
                .tiptap ul {
                    list-style-type: disc;
                }
                .tiptap ol {
                    list-style-type: decimal;
                }
                .tiptap h1 { font-size: 2rem; font-weight: 700; margin: 1rem 0; }
                .tiptap h2 { font-size: 1.5rem; font-weight: 600; margin: 0.875rem 0; }
                .tiptap h3 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0; }
                .tiptap h4 { font-size: 1.125rem; font-weight: 500; margin: 0.625rem 0; }
                .tiptap hr {
                    border: none;
                    border-top: 2px solid #e5e7eb;
                    margin: 2rem 0;
                }
                .dark .tiptap hr {
                    border-color: #404040;
                }
                .tiptap table {
                    border-collapse: collapse;
                    table-layout: fixed;
                    width: 100%;
                    margin: 1rem 0;
                    overflow: hidden;
                }
                .tiptap th,
                .tiptap td {
                    border: 1px solid #e5e7eb;
                    padding: 0.5rem;
                    min-width: 100px;
                    position: relative;
                }
                .dark .tiptap th,
                .dark .tiptap td {
                    border-color: #404040;
                }
                .tiptap th {
                    background-color: #f9fafb;
                    font-weight: 600;
                }
                .dark .tiptap th {
                    background-color: #262626;
                }
                .tiptap iframe {
                    border-radius: 0.5rem;
                    margin: 1rem 0;
                }
            `}</style>
        </div>
    )
}
