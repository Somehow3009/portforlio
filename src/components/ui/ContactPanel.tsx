import { useState, useRef, useEffect } from 'react'
import { useGame } from '../../store'
import { audio } from '../../audio'

interface Msg {
  role: 'bot' | 'user'
  text: string
}

const initialBot: Msg = {
  role: 'bot',
  text: "> AI COMPANION ONLINE. Ask me about the developer — e.g. 'remote work', 'WebGPU', 'experience'.",
}

const FAQ: { keys: RegExp; answer: string }[] = [
  {
    keys: /remote|work from|location|where/,
    answer:
      '> Yes — fully remote friendly. Based in Ho Chi Minh City (GMT+7), comfortable working across time zones.',
  },
  {
    keys: /webgpu|gpu|graphics|three/,
    answer:
      '> I build GPU-accelerated web experiences with WebGPU + Three.js / React Three Fiber, fielding compute shaders for real-time visuals.',
  },
  {
    keys: /experience|years|how long/,
    answer:
      '> ~6 years in full-stack development across React, Node.js, Python, and increasingly Rust & WebGPU.',
  },
  {
    keys: /hire|contract|freelance|available/,
    answer:
      '> Open to full-time and contract AI / full-stack / WebGPU roles. Send a message via this terminal to reach me directly.',
  },
  {
    keys: /skills|stack|technologies|tech/,
    answer:
      '> React, Rust, WebGPU, Python, Wasm, Node.js — explore The Skill Forge island in 3D mode for details.',
  },
  {
    keys: /projects|portfolio|work/,
    answer:
      '> Check The Project Galaxy island. Highlight: Warp Engine (WebGPU physics) and Neural Forge (ML studio).',
  },
  {
    keys: /hello|hi|hey|good/,
    answer: '> Hello, traveler. I am the developer\'s AI companion. How may I assist?',
  },
  {
    keys: /contact|email|reach/,
    answer:
      '> Use the message form below and it will be sent to the developer\'s inbox. Or email directly at the address shown.',
  },
]

export function ContactPanel() {
  const contactOpen = useGame((s) => s.contactOpen)
  const setContactOpen = useGame((s) => s.setContactOpen)
  const [msgs, setMsgs] = useState<Msg[]>([initialBot])
  const [chatInput, setChatInput] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [msgs, chatInput])

  if (!contactOpen) return null

  const close = () => {
    setContactOpen(false)
    setSent(false)
  }

  const askBot = (q: string) => {
    const userMsg: Msg = { role: 'user', text: q }
    setMsgs((m) => [...m, userMsg])
    audio.activate()
    setTimeout(() => {
      const match = FAQ.find((f) => f.keys.test(q.toLowerCase()))
      const answer = match?.answer ?? '> I am not sure about that. Try asking about WebGPU, projects, remote work, or how to contact me.'
      setMsgs((m) => [...m, { role: 'bot', text: answer }])
      audio.uiClick()
    }, 500)
  }

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return
    askBot(chatInput)
    setChatInput('')
  }

  const sendContact = (e: React.FormEvent) => {
    e.preventDefault()
    audio.send()
    setSent(true)
    setMessage('')
    setEmail('')
  }

  return (
    <div data-ui className="absolute inset-0 z-30 flex items-center justify-center bg-space-950/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-xl border border-neon-cyan/40 bg-space-900/95 p-6 shadow-[0_0_80px_rgba(0,240,255,0.15)]">
        <button
          onClick={close}
          className="absolute top-4 right-4 w-9 h-9 rounded-full border border-slate-600 text-slate-400 hover:text-white hover:border-neon-cyan transition-colors font-mono"
          aria-label="Close terminal"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="w-3 h-3 rounded-full animate-glowpulse" style={{ background: '#39ff88', boxShadow: '0 0 12px #39ff88' }} />
          <h2 className="font-display text-xl font-bold text-neon-cyan">CONTACT TERMINAL</h2>
        </div>

        {/* Chat log */}
        <div
          ref={logRef}
          className="h-40 overflow-y-auto cyber-scroll rounded border border-neon-cyan/20 bg-space-950/60 p-3 mb-3 space-y-2"
        >
          {msgs.map((m, i) => (
            <p
              key={i}
              className={`font-mono text-xs leading-relaxed ${
                m.role === 'bot' ? 'text-neon-cyan' : 'text-slate-300'
              }`}
            >
              {m.role === 'user' ? '> you: ' : ''}
              {m.text}
            </p>
          ))}
        </div>

        {/* AI chat input */}
        <form onSubmit={sendChat} className="flex gap-2 mb-5">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask the AI companion..."
            className="flex-1 px-3 py-2 rounded border border-neon-cyan/30 bg-space-950/60 text-sm font-mono text-slate-200 focus:outline-none focus:border-neon-cyan"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded font-mono text-sm font-bold bg-neon-cyan text-black hover:brightness-110 transition"
          >
            SEND
          </button>
        </form>

        <div className="border-t border-slate-700/60 pt-4">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-neon-green text-lg font-mono animate-glowpulse">
                ⬢ MESSAGE TRANSMITTED
              </p>
              <p className="text-slate-400 text-sm mt-1 font-mono">
                Signals received. Talk soon.
              </p>
            </div>
          ) : (
            <div>
              <p className="font-mono text-xs text-slate-400 mb-2">DIRECT MESSAGE PORT</p>
              <form onSubmit={sendContact} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-3 py-2 rounded border border-slate-600 bg-space-950/60 text-sm font-mono text-slate-200 focus:outline-none focus:border-neon-cyan"
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={3}
                  required
                  className="w-full px-3 py-2 rounded border border-slate-600 bg-space-950/60 text-sm font-mono text-slate-200 focus:outline-none focus:border-neon-cyan resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded font-mono font-bold bg-neon-cyan text-black hover:brightness-110 transition"
                >
                  ▲ TRANSMIT
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
