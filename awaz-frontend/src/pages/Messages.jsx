import { useEffect, useMemo, useState } from 'react'
import { FiSend, FiMessageCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'
import useAuthStore from '../store/useAuthStore'

export default function Messages() {
  const { user, registeredUsers } = useAuthStore()
  const [friendStatuses, setFriendStatuses] = useState({})
  const [activeFriendId, setActiveFriendId] = useState(null)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState({})

  const friends = useMemo(() => {
    if (!user) return []
    return registeredUsers
      .filter((person) => person.id !== user.id)
      .map((person) => ({
        id: person.id,
        name: person.name,
        handle: person.handle,
        avatar: person.avatar,
        status: friendStatuses[person.id] ?? 'pending',
      }))
  }, [registeredUsers, user, friendStatuses])

  useEffect(() => {
    if (!user) return
    setFriendStatuses((prev) => {
      const next = { ...prev }
      registeredUsers
        .filter((person) => person.id !== user.id)
        .forEach((person) => {
          if (!next[person.id]) next[person.id] = 'pending'
        })
      return next
    })
  }, [registeredUsers, user])

  useEffect(() => {
    if (!friends.length) {
      setActiveFriendId(null)
      return
    }
    if (!activeFriendId || !friends.some((friend) => friend.id === activeFriendId)) {
      setActiveFriendId(friends[0].id)
    }
  }, [friends, activeFriendId])

  const activeFriend = useMemo(() => friends.find((friend) => friend.id === activeFriendId) ?? null, [friends, activeFriendId])

  const acceptRequest = (friendId) => {
    setFriendStatuses((prev) => ({ ...prev, [friendId]: 'accepted' }))
    toast.success('Friend request accepted')
  }

  const handleSend = (e) => {
    e.preventDefault()
    if (!draft.trim()) return
    if (!activeFriend || activeFriend.status !== 'accepted') {
      toast.error('Accept the request first to chat')
      return
    }

    setMessages((prev) => ({
      ...prev,
      [activeFriend.id]: [...(prev[activeFriend.id] ?? []), { id: Date.now(), from: 'me', text: draft.trim() }],
    }))
    setDraft('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl">Messages</h1>
          <p className="text-sm text-accent">New accounts appear here automatically.</p>
        </div>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.24em] text-primary">
          Registered users only
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-[24px] border border-white/10 bg-base-200/70 p-3">
          <div className="mb-3 text-xs uppercase tracking-[0.25em] text-accent">Contacts</div>
          <div className="space-y-2">
            {friends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => setActiveFriendId(friend.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left ${activeFriendId === friend.id ? 'border-primary bg-primary/10' : 'border-white/10 bg-base-100/40'}`}
              >
                <div className="flex items-center gap-2">
                  <img src={friend.avatar} alt={friend.name} className="h-9 w-9 rounded-full" />
                  <div>
                    <div className="text-sm font-semibold">{friend.name}</div>
                    <div className="text-xs text-accent">{friend.handle}</div>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] uppercase ${friend.status === 'accepted' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                  {friend.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-base-200/70 p-3">
          {activeFriend ? (
            <>
              <div className="mb-3 flex items-center justify-between rounded-2xl bg-base-100/70 p-3">
                <div className="flex items-center gap-2">
                  <img src={activeFriend.avatar} alt={activeFriend.name} className="h-10 w-10 rounded-full" />
                  <div>
                    <div className="font-semibold">{activeFriend.name}</div>
                    <div className="text-xs text-accent">{activeFriend.handle}</div>
                  </div>
                </div>
                {activeFriend.status !== 'accepted' ? (
                  <button onClick={() => acceptRequest(activeFriend.id)} className="btn btn-sm btn-outline btn-primary">
                    Accept request
                  </button>
                ) : (
                  <span className="text-sm text-success">Connected</span>
                )}
              </div>

              <div className="min-h-[280px] rounded-2xl bg-base-100/50 p-3">
                {(messages[activeFriend.id] ?? []).length === 0 ? (
                  <div className="flex h-full min-h-[220px] items-center justify-center text-center text-sm text-accent">
                    <div>
                      <FiMessageCircle className="mx-auto mb-2" size={20} />
                      No messages yet. Start the conversation.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(messages[activeFriend.id] ?? []).map((message) => (
                      <div key={message.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${message.from === 'me' ? 'ml-auto bg-primary text-primary-content' : 'bg-base-200 text-base-content'}`}>
                        {message.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleSend} className="mt-3 flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="input input-bordered flex-1 bg-base-100/70"
                  placeholder="Write a message"
                />
                <button type="submit" className="btn btn-primary gap-2">
                  <FiSend size={16} /> Send
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
