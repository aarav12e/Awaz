import { useState, useMemo, useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiSend, FiMessageCircle, FiUsers, FiSearch, FiArrowLeft } from 'react-icons/fi'
import toast from 'react-hot-toast'
import useAuthStore from '../store/useAuthStore'
import api from '../lib/axios'

export default function Messages() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const targetUserIdParam = searchParams.get('user')

  const [allUsers, setAllUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [activeContact, setActiveContact] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [hasSetInitial, setHasSetInitial] = useState(false)
  const bottomRef = useRef(null)

  // 1. Fetch all users for discovery
  useEffect(() => {
    api.get('/users')
      .then((res) => {
        if (res.data.success) {
          setAllUsers(res.data.users || [])
        }
      })
      .catch((err) => console.error('Failed to load users:', err))
  }, [])

  // 2. Fetch active conversations
  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations')
      if (data.success) {
        setConversations(data.conversations || [])
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
    }
  }

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 3000)
    return () => clearInterval(interval)
  }, [])

  // 3. Handle query param targeting a specific user (only once when params/allUsers load)
  useEffect(() => {
    if (targetUserIdParam && allUsers.length) {
      const found = allUsers.find((u) => u._id === targetUserIdParam || u.handle === targetUserIdParam)
      if (found) {
        setActiveContact(found)
        setHasSetInitial(true)
      }
    }
  }, [targetUserIdParam, allUsers])

  // Select initial contact on load if none selected yet
  useEffect(() => {
    if (!activeContact && !hasSetInitial) {
      if (conversations.length) {
        setActiveContact(conversations[0].user)
        setHasSetInitial(true)
      } else if (allUsers.length) {
        const other = allUsers.find((u) => u._id !== user?.id && u._id !== user?._id)
        if (other) {
          setActiveContact(other)
          setHasSetInitial(true)
        }
      }
    }
  }, [allUsers, conversations, activeContact, user, hasSetInitial])

  // 4. Fetch message history with activeContact
  const fetchMessages = async (recipientId) => {
    if (!recipientId) return
    try {
      const { data } = await api.get(`/messages/${recipientId}`)
      if (data.success) {
        setMessages(data.messages || [])
        // Refresh conversations to clear unread counts for active contact
        fetchConversations()
      }
    } catch (err) {
      console.error('Failed to load messages:', err)
    }
  }

  useEffect(() => {
    if (!activeContact?._id) return
    setLoadingMessages(true)
    fetchMessages(activeContact._id).finally(() => setLoadingMessages(false))

    const interval = setInterval(() => {
      fetchMessages(activeContact._id)
    }, 3000)

    return () => clearInterval(interval)
  }, [activeContact])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Filter & sort contacts by recent conversation timestamp (latest on TOP)
  const filteredUsers = useMemo(() => {
    const meId = user?.id || user?._id
    const users = allUsers.filter((u) => {
      if (u._id === meId) return false
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q)
    })

    // Sort contacts by latest conversation message timestamp
    return users.sort((a, b) => {
      const convA = conversations.find((c) => c.user._id === a._id)
      const convB = conversations.find((c) => c.user._id === b._id)

      const timeA = convA?.lastMessage ? new Date(convA.lastMessage.createdAt).getTime() : 0
      const timeB = convB?.lastMessage ? new Date(convB.lastMessage.createdAt).getTime() : 0

      return timeB - timeA // Descending order (latest at TOP)
    })
  }, [allUsers, searchQuery, user, conversations])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!draft.trim() || !activeContact?._id) return
    const textToSend = draft.trim()
    setDraft('')

    try {
      const { data } = await api.post('/messages', {
        recipientId: activeContact._id,
        text: textToSend,
      })

      if (data.success) {
        setMessages((prev) => [...prev, data.message])
        fetchConversations()
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      toast.error('Failed to send message')
    }
  }

  return (
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 5rem)' }}>
      {/* Header */}
      <div className="flex items-center justify-between rounded-[24px] border border-base-content/10 bg-base-200/70 px-4 py-3 sm:px-5 shrink-0">
        <div>
          <h1 className="font-display text-xl tracking-tight text-base-content">Direct Messages</h1>
          <p className="text-xs text-accent font-mono">Chat directly with any member</p>
        </div>
      </div>

      <div className="grid gap-3 flex-1 min-h-0 lg:grid-cols-[300px_1fr]">
        {/* Sidebar Contacts list */}
        <div className={`rounded-[24px] border border-base-content/10 bg-base-200/70 p-3 flex flex-col min-h-0 ${activeContact ? 'hidden lg:flex' : 'flex'}`}>
          <div className="relative mb-3 shrink-0">
            <FiSearch className="absolute left-3 top-3 text-accent" size={16} />
            <input
              type="text"
              placeholder="Search members…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-base-100/70 pl-9 pr-3 py-2 text-sm border border-base-content/10 text-base-content focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0 pr-1">
            {filteredUsers.length === 0 ? (
              <div className="py-8 text-center text-accent text-xs">No members found</div>
            ) : (
              filteredUsers.map((contact) => {
                const isActive = activeContact?._id === contact._id
                const conv = conversations.find((c) => c.user._id === contact._id)
                const lastMsg = conv?.lastMessage?.text
                const unreadCount = conv?.unreadCount || 0

                return (
                  <button
                    key={contact._id}
                    onClick={() => setActiveContact(contact)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? 'border-primary/40 bg-primary/10 text-base-content'
                        : 'border-base-content/5 bg-base-100/40 hover:bg-base-100/70 text-base-content'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={contact.avatar || 'https://api.dicebear.com/9.x/notionists/svg?seed=User'}
                        alt={contact.name}
                        className="h-10 w-10 rounded-full bg-base-300 object-cover"
                      />
                      {unreadCount > 0 && !isActive && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-mono font-bold text-white shadow-sm">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-sm truncate ${unreadCount > 0 ? 'font-bold' : 'font-semibold'}`}>
                          {contact.name}
                        </p>
                        {unreadCount > 0 && !isActive && (
                          <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className={`text-xs truncate ${unreadCount > 0 ? 'font-medium' : 'text-accent'}`}>
                        {lastMsg || contact.handle}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat main area */}
        <div className={`rounded-[24px] border border-base-content/10 bg-base-200/70 p-3 flex flex-col min-h-0 ${!activeContact ? 'hidden lg:flex' : 'flex'}`}>
          {activeContact ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-3 rounded-2xl bg-base-100/70 p-3 shrink-0 mb-3 border border-base-content/5">
                {/* Back button on mobile */}
                <button
                  onClick={() => setActiveContact(null)}
                  className="btn btn-sm btn-ghost lg:hidden p-1 min-h-0 h-auto"
                >
                  <FiArrowLeft size={20} className="text-base-content" />
                </button>
                <div className="flex items-center gap-3">
                  <Link to={`/user/${activeContact.handle}`}>
                    <img
                      src={activeContact.avatar}
                      alt={activeContact.name}
                      className="h-10 w-10 rounded-full hover:opacity-80 transition-opacity object-cover"
                    />
                  </Link>
                  <div>
                    <Link
                      to={`/user/${activeContact.handle}`}
                      className="font-semibold text-sm text-base-content hover:text-primary transition-colors"
                    >
                      {activeContact.name}
                    </Link>
                    <p className="text-xs text-accent font-mono">{activeContact.handle}</p>
                  </div>
                </div>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto rounded-2xl bg-base-100/50 p-4 min-h-0 space-y-3">
                {loadingMessages && messages.length === 0 ? (
                  <div className="py-12 text-center text-accent text-sm">Loading chat history...</div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-center text-accent">
                    <FiMessageCircle size={28} className="opacity-40" />
                    <p className="text-sm font-medium">Send a direct message to {activeContact.name}</p>
                    <p className="text-xs opacity-50">Direct messages are private between you two</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender
                    const meId = user?.id || user?._id
                    const isMe = senderId === meId

                    return (
                      <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                            isMe
                              ? 'bg-primary text-primary-content rounded-br-xs'
                              : 'bg-base-200 text-base-content border border-base-content/10 rounded-bl-xs'
                          }`}
                        >
                          <p className="break-words">{msg.text}</p>
                          <p
                            className={`text-[9px] font-mono mt-1 ${
                              isMe ? 'text-primary-content/75 text-right' : 'text-accent'
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSend} className="flex gap-2 mt-3 shrink-0">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="input input-bordered flex-1 bg-base-100/70 text-base-content focus:outline-none focus:border-primary"
                  placeholder={`Message ${activeContact.name}…`}
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="btn btn-primary px-5 gap-2 disabled:opacity-40"
                >
                  <FiSend size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-accent text-sm gap-2">
              <FiUsers size={32} className="opacity-40" />
              <p>Select a member to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
