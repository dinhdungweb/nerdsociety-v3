'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Conversation } from '../types/chat' // We will need to define this common type or import it

interface AdminChatContextType {
    activeConversation: Conversation | null
    isMinimized: boolean
    isOpen: boolean
    openChat: (conversation: Conversation) => void
    minimizeChat: () => void
    closeChat: () => void
    maximizeChat: () => void
}

const AdminChatContext = createContext<AdminChatContextType | undefined>(undefined)

export function AdminChatProvider({ children }: { children: ReactNode }) {
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
    const [isMinimized, setIsMinimized] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // Load state from localStorage on mount
    useEffect(() => {
        const savedState = localStorage.getItem('admin_chat_state')
        if (savedState) {
            try {
                const { activeConversation, isMinimized, isOpen } = JSON.parse(savedState)
                if (activeConversation) setActiveConversation(activeConversation)
                setIsMinimized(isMinimized || false)
                setIsOpen(isOpen || false)
            } catch (e) {
                console.error('Failed to parse admin chat state', e)
            }
        }
    }, [])

    // Save state to localStorage whenever it changes
    useEffect(() => {
        const state = {
            activeConversation,
            isMinimized,
            isOpen
        }
        localStorage.setItem('admin_chat_state', JSON.stringify(state))
    }, [activeConversation, isMinimized, isOpen])

    const openChat = (conversation: Conversation) => {
        setActiveConversation(conversation)
        setIsOpen(true)
        setIsMinimized(false)
    }

    const minimizeChat = () => setIsMinimized(true)
    const closeChat = () => {
        setIsOpen(false)
        setActiveConversation(null)
        localStorage.removeItem('admin_chat_state') // Clear state when closed
    }
    const maximizeChat = () => setIsMinimized(false)

    return (
        <AdminChatContext.Provider value={{ activeConversation, isMinimized, isOpen, openChat, minimizeChat, closeChat, maximizeChat }}>
            {children}
            {/* We will render the AdminChatWindow component here or in the layout */}
        </AdminChatContext.Provider>
    )
}

export function useAdminChat() {
    const context = useContext(AdminChatContext)
    if (context === undefined) {
        throw new Error('useAdminChat must be used within an AdminChatProvider')
    }
    return context
}
