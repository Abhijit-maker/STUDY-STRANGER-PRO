import { NavLink, Route, Routes, useNavigate, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { TOOLS, USER } from '../data.js'
import { auth, signOut } from '../firebase'
import Dashboard from './Dashboard'
import Settings from './Settings'
import * as T from './Tools'

const LINKS = [
  { to: '/app', label: 'Home', end: true },
  { to: '/app/mock', label: '🎯 Mock Test' },
  { to: '/app/mistakes', label: '🧠 Mistake Analyzer' },
  { to: '/app/flashcards', label: '🗂️ Flashcards' },
  { to: '/app/mcq', label: '📖 Question Bank' },
  { to: '/app/focus', label: '⏳ Focus Room' },
  { to: '/app/streaks', label: '🔥 Streaks & Badges' },
  { to: '/app/voice', label: '🎙️ Voice AI' },
  { to: '/app/doubt', label: 'Doubt Solver' },
  { to: '/app/settings', label: '⚙️ Settings & API Key' },
  { to: '/app/syllabus', label: 'Roadmap' }
]

export default function AppShell() {
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const currentName = localStorage.getItem('currentUserName') || USER.name

  async function logout() {
    sessionStorage.removeItem('ss-auth')
    localStorage.removeItem('ss-auth')
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('currentUserUid')
    localStorage.removeItem('currentUserEmail')
    try {
      await signOut(auth)
    } catch (e) {
      console.warn('Signout note:', e)
    }
    nav('/')
  }

  return (
    <div className="app-shell">
      {open && (
        <div 
          onClick={() => setOpen(false)} 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 45 }} 
        />
      )}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand" style={{ marginBottom: 22, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.svg" alt="" />
            Study Stranger
          </div>
          {open && (
            <button 
              onClick={() => setOpen(false)} 
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
            >
              ✕
            </button>
          )}
        </div>
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
            {l.label}
          </NavLink>
        ))}
        <div style={{ height: 12 }} />
        <p className="muted" style={{ fontSize: 12, padding: '8px 12px' }}>ALL TOOLS</p>
        {TOOLS.filter((t) => !['/app/mock', '/app/doubt', '/app/flashcards', '/app/notes', '/app/mentors', '/app/syllabus'].includes(t.to)).map((t) => (
          <NavLink key={t.id} to={t.to} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
            {t.title}
          </NavLink>
        ))}
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 18, width: '100%' }} onClick={logout}>Log out</button>
      </aside>
      <div className="app-main-wrap">
        <div className="mobile-bar" style={{ padding: '10px 14px', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(247, 246, 239, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1.5px solid var(--ink)', width: '100%', boxSizing: 'border-box', position: 'sticky', top: 0, zIndex: 35 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button 
              className="hamburger" 
              onClick={() => setOpen((v) => !v)}
              style={{
                background: '#fff',
                border: '1.5px solid var(--ink)',
                borderRadius: 12,
                padding: '6px 10px',
                fontSize: 12,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '1.5px 1.5px 0 var(--ink)',
                cursor: 'pointer'
              }}
            >
              <span>☰</span>
              <span>টুলস</span>
            </button>
            <NavLink to="/app" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', color: 'inherit' }}>
              <img src="/logo.svg" alt="Study Stranger" style={{ width: 22, height: 22 }} />
              <span style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-serif)' }}>Study Stranger</span>
            </NavLink>
          </div>

          <NavLink 
            to="/app/settings" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              textDecoration: 'none', 
              color: 'inherit',
              background: '#fff',
              border: '1.5px solid var(--ink)',
              borderRadius: 20,
              padding: '4px 10px',
              boxShadow: '1.5px 1.5px 0 var(--ink)'
            }}
          >
            <div style={{ width: 7, height: 7, borderRadius: 99, background: '#22c55e' }} />
            <span style={{ fontSize: 12, fontWeight: 700 }}>{currentName}</span>
            <span style={{ fontSize: 11 }}>⚙️</span>
          </NavLink>
        </div>
        <main className="main">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="board" element={<Navigate to="/app/voice" replace />} />
            <Route path="mock" element={<T.MockTest />} />
            <Route path="doubt" element={<T.Doubt />} />
            <Route path="voice" element={<T.Voice />} />
            <Route path="flashcards" element={<T.Flash />} />
            <Route path="notes" element={<T.Notes />} />
            <Route path="mindmap" element={<T.Mind />} />
            <Route path="mcq" element={<T.McqBank />} />
            <Route path="blitz" element={<T.Blitz />} />
            <Route path="focus" element={<T.Focus />} />
            <Route path="notices" element={<T.Notices />} />
            <Route path="scanner" element={<T.Scanner />} />
            <Route path="formulas" element={<T.Formulas />} />
            <Route path="mistakes" element={<T.Mistakes />} />
            <Route path="streaks" element={<T.Streaks />} />
            <Route path="syllabus" element={<T.Syllabus />} />
            <Route path="memory" element={<T.Memory />} />
            <Route path="lab" element={<T.Lab />} />
            <Route path="autopsy" element={<T.Autopsy />} />
            <Route path="voice-quiz" element={<T.VoiceQuiz />} />
            <Route path="duel" element={<T.Duel />} />
            <Route path="model-paper" element={<T.ModelPaper />} />
            <Route path="diary" element={<T.Diary />} />
            <Route path="telegram" element={<T.Telegram />} />
            <Route path="vigilance" element={<T.Vigilance />} />
            <Route path="mentors" element={<T.Mentors />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </main>

        {/* Floating Mobile Bottom Navigation Bar */}
        <nav className="mobile-bottom-nav">
          <NavLink to="/app" end className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}>
            <span className="tab-icon">🏠</span>
            <span className="tab-label">Home</span>
          </NavLink>
          <NavLink to="/app/mock" className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}>
            <span className="tab-icon">🎯</span>
            <span className="tab-label">Mock</span>
          </NavLink>
          <NavLink to="/app/voice" className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}>
            <span className="tab-icon">🎙️</span>
            <span className="tab-label">Voice AI</span>
          </NavLink>
          <NavLink to="/app/mistakes" className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}>
            <span className="tab-icon">🧠</span>
            <span className="tab-label">Mistakes</span>
          </NavLink>
          <NavLink to="/app/settings" className={({ isActive }) => `bottom-tab ${isActive ? 'active' : ''}`}>
            <span className="tab-icon">⚙️</span>
            <span className="tab-label">Settings</span>
          </NavLink>
          <button onClick={() => setOpen(true)} className="bottom-tab">
            <span className="tab-icon">☰</span>
            <span className="tab-label">Tools</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
