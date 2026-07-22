import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FiSend, FiMessageCircle, FiUserPlus, FiCheck, FiLock,
  FiUsers, FiX, FiUserCheck, FiInbox,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import useAuthStore from '../store/useAuthStore'

export default function Messages() {
  const {
    user, registeredUsers, messages,
    sendConnectRequest, acceptConnectRequest, declineConnectRequest,
    getConnectionStatus, getIncomingRequests, sendMessage,
    _connTick, // reactive trigger for connection state changes
  } = useAuthStore()

  const [tab, setTab] = useState('contacts') // 'contacts' | 'requests'
  const [activeFriendId, setActiveFriendId] = useState(null)
  const [draft, setDraft] = useState('')
  const bottomRef = useRef(null)

  // All users except the logged-in user themselves
  const contacts = useMemo(() => {
    if (!user) return []
    return registeredUsers.filter((u) => u.id !== user.id)
  }, [registeredUsers, user])

  const incomingRequests = useMemo(
    () => getIncomingRequests(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [_connTick, user, registeredUsers]
  )

  // Auto-select first contact
  useEffect(() => {
    if (contacts.length && !activeFriendId) {
      setActiveFriendId(contacts[0].id)
    }
  }, [contacts, activeFriendId])

  const activeFriend = contacts.find((c) => c.id === activeFriendId) ?? null
  const connStatus = activeFriendId ? getConnectionStatus(activeFriendId) : 'none'

  // Conversation messages
  const convoKey = user && activeFriendId
    ? [user.id, activeFriendId].sort().join('__')
    : null
  const convoMessages = convoKey ? (messages[convoKey] ?? []) : []

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [convoMessages])

  const handleSendRequest = () => {
    sendConnectRequest(activeFriendId)
    toast('Connect request sent!', { icon: '📨' })
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    if (connStatus !== 'accepted') {
      toast.error('Connect first before chatting')
      return
    }
    sendMessage(activeFriendId, draft)
    setDraft('')
  }

  const statusBadge = (userId) => {
    const s = getConnectionStatus(userId)
    if (s === 'accepted')        return <span className="h-2 w-2 rounded-full bg-success border border-base-200 shrink-0" />
    if (s === 'pending_sent')    return <span className="text-[9px] font-mono text-warning shrink-0">Sent</span>
    if (s === 'pending_received') return <span className="text-[9px] font-mono text-primary shrink-0">!Req</span>
    return null
  }

  return (
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 5rem)' }}>

      {/* Header */}
      <div className="flex items-center justify-between rounded-[24px] border border-white/10 bg-base-200/70 px-4 py-3 sm:px-5 shrink-0">
        <div>
          <h1 className="font-display text-xl tracking-tight">Messages</h1>
          <p className="text-sm text-accent">{contacts.length} reporter{contacts.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {incomingRequests.length > 0 && (
            <button
              onClick={() => setTab('requests')}
              className="relative flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-mono text-primary"
            >
              <FiInbox size={12} />
              {incomingRequests.length} request{incomingRequests.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-white/10 bg-base-200/70 p-1 shrink-0">
        {[
          { key: 'contacts', icon: FiUsers, label: 'Contacts' },
          { key: 'requests', icon: FiInbox, label: `Requests${incomingRequests.length ? ` (${incomingRequests.length})` : ''}` },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition-colors ${
              tab === key ? 'bg-base-300 text-bone' : 'text-accent hover:text-bone'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── REQUESTS TAB ───────────────────────────────────────────────── */}
      {tab === 'requests' && (
        <div className="flex-1 overflow-y-auto space-y-2">
          {incomingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-[24px] border border-dashed border-white/10 bg-base-200/40 py-16 text-center">
              <FiInbox size={28} className="text-accent opacity-40" />
              <div>
                <p className="font-display text-base">No pending requests</p>
                <p className="mt-1 text-sm text-accent">When someone sends you a connect request, it'll appear here.</p>
              </div>
            </div>
          ) : (
            incomingRequests.map((sender) => (
              <div
                key={sender.id}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-base-200/70 px-4 py-3"
              >
                <Link to={`/user/${sender.id}`}>
                  <img src={sender.avatar} alt={sender.name} className="h-11 w-11 rounded-full bg-base-300 shrink-0 hover:opacity-80 transition-opacity" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/user/${sender.id}`} className="text-sm font-semibold hover:text-primary transition-colors">
                    {sender.name}
                  </Link>
                  <p className="text-xs font-mono text-accent">{sender.handle}</p>
                  <p className="text-xs text-accent mt-0.5">Wants to connect with you</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => {
                      acceptConnectRequest(sender.id)
                      toast.success(`Connected with ${sender.name}!`)
                    }}
                    className="btn btn-xs btn-success gap-1"
                  >
                    <FiCheck size={12} /> Accept
                  </button>
                  <button
                    onClick={() => {
                      declineConnectRequest(sender.id)
                      toast('Request declined', { icon: '👋' })
                    }}
                    className="btn btn-xs btn-ghost border border-white/10 gap-1"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── CONTACTS TAB ───────────────────────────────────────────────── */}
      {tab === 'contacts' && (
        <div className="grid gap-3 flex-1 min-h-0 lg:grid-cols-[280px_1fr]">

          {/* Sidebar */}
          <div className="rounded-[24px] border border-white/10 bg-base-200/70 p-3 overflow-y-auto">
            <p className="mb-3 px-1 text-[10px] uppercase tracking-[0.25em] text-accent font-mono">All Reporters</p>
            <div className="space-y-1.5">
              {contacts.map((contact) => {
                const s = getConnectionStatus(contact.id)
                const key = [user.id, contact.id].sort().join('__')
                const lastMsg = (messages[key] ?? []).at(-1)
                return (
                  <button
                    key={contact.id}
                    onClick={() => setActiveFriendId(contact.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors ${
                      activeFriendId === contact.id
                        ? 'border-primary/40 bg-primary/10'
                        : 'border-white/10 bg-base-100/40 hover:bg-base-100/70'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img src={contact.avatar} alt={contact.name} className="h-10 w-10 rounded-full bg-base-300" />
                      {s === 'accepted' && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-success border-2 border-base-200" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-semibold truncate">{contact.name}</p>
                        {statusBadge(contact.id)}
                      </div>
                      <p className="text-xs text-accent truncate">
                        {lastMsg ? lastMsg.text : contact.handle}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Chat panel */}
          <div className="rounded-[24px] border border-white/10 bg-base-200/70 p-3 flex flex-col min-h-0">
            {activeFriend ? (
              <>
                {/* Chat header */}
                <div className="flex items-center justify-between rounded-2xl bg-base-100/70 p-3 shrink-0 mb-3">
                  <div className="flex items-center gap-3">
                    <Link to={`/user/${activeFriend.id}`}>
                      <img src={activeFriend.avatar} alt={activeFriend.name} className="h-10 w-10 rounded-full hover:opacity-80 transition-opacity" />
                    </Link>
                    <div>
                      <Link to={`/user/${activeFriend.id}`} className="font-semibold text-sm hover:text-primary transition-colors">
                        {activeFriend.name}
                      </Link>
                      <p className="text-xs text-accent font-mono">{activeFriend.handle}</p>
                    </div>
                  </div>

                  {connStatus === 'none' && (
                    <button onClick={handleSendRequest} className="btn btn-sm btn-primary gap-2">
                      <FiUserPlus size={14} /> Connect
                    </button>
                  )}
                  {connStatus === 'pending_sent' && (
                    <span className="flex items-center gap-1.5 text-sm text-warning font-mono">
                      <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                      Request sent
                    </span>
                  )}
                  {connStatus === 'pending_received' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { acceptConnectRequest(activeFriend.id); toast.success('Connected!') }}
                        className="btn btn-sm btn-success gap-1"
                      >
                        <FiCheck size={13} /> Accept
                      </button>
                      <button
                        onClick={() => declineConnectRequest(activeFriend.id)}
                        className="btn btn-sm btn-ghost border border-white/10"
                      >
                        <FiX size={13} />
                      </button>
                    </div>
                  )}
                  {connStatus === 'accepted' && (
                    <span className="flex items-center gap-1.5 text-sm text-success font-mono">
                      <FiUserCheck size={14} /> Connected
                    </span>
                  )}
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto rounded-2xl bg-base-100/50 p-3 min-h-0">
                  {connStatus !== 'accepted' ? (
                    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-3 text-center text-accent">
                      <FiLock size={24} className="opacity-40" />
                      <div>
                        <p className="text-sm font-medium">
                          {connStatus === 'none'          && 'Send a connect request to start chatting'}
                          {connStatus === 'pending_sent'  && 'Waiting for them to accept your request…'}
                          {connStatus === 'pending_received' && 'Accept their request to start chatting'}
                        </p>
                        <p className="text-xs mt-1 opacity-50">Messages unlock once both sides connect</p>
                      </div>
                    </div>
                  ) : convoMessages.length === 0 ? (
                    <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-center text-accent">
                      <FiMessageCircle size={24} className="opacity-40" />
                      <p className="text-sm">Connected! Say hello 👋</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {convoMessages.map((msg) => {
                        const isMe = msg.from === user.id
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                              isMe
                                ? 'bg-primary text-primary-content rounded-br-sm'
                                : 'bg-base-200 text-base-content rounded-bl-sm'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        )
                      })}
                      <div ref={bottomRef} />
                    </div>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="flex gap-2 mt-3 shrink-0">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={connStatus !== 'accepted'}
                    className="input input-bordered flex-1 bg-base-100/70 disabled:opacity-40"
                    placeholder={connStatus === 'accepted' ? 'Write a message…' : 'Connect first to chat'}
                  />
                  <button
                    type="submit"
                    disabled={connStatus !== 'accepted' || !draft.trim()}
                    className="btn btn-primary gap-2 disabled:opacity-40"
                  >
                    <FiSend size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-accent text-sm">
                Select a contact
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
