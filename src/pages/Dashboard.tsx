import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SYLLABUS, TOOLS, USER } from '../data.js'
import { TiltContainer } from '../components/TiltContainer'
import { StudyStreakTracker } from '../components/StudyStreakTracker'
import { db, auth, doc, getDoc } from '../firebase'

export default function Dashboard() {
  const userName = localStorage.getItem('currentUserName') || USER.name
  const done = SYLLABUS.flatMap((s) => s.chapters).filter((c) => c.done).length
  const total = SYLLABUS.flatMap((s) => s.chapters).length
  const pct = Math.round((done / total) * 100)

  const [streak, setStreak] = useState<string>(() => localStorage.getItem('ss_study_streak') || '0')
  const [xp, setXp] = useState<number>(() => {
    return parseInt(localStorage.getItem('ss_student_xp') || localStorage.getItem('user_points') || '0', 10)
  })

  useEffect(() => {
    if (auth.currentUser?.uid) {
      const userRef = doc(db, 'users', auth.currentUser.uid)
      getDoc(userRef).then((snap) => {
        if (snap.exists()) {
          const d = snap.data()
          if (typeof d.points === 'number') setXp(d.points)
          if (typeof d.streak === 'number') setStreak(d.streak.toString())
        }
      }).catch(() => {})
    }
  }, [])

  const quickTools = [
    { to: '/app/mock', label: '🎯 Mock Test AI', bg: 'var(--yellow)' },
    { to: '/app/mistakes', label: '🧠 Mistake Analyzer', bg: '#fed7aa' },
    { to: '/app/flashcards', label: '🗂️ Chapter Flashcards', bg: '#fef08a' },
    { to: '/app/mcq', label: '📖 Question Bank', bg: '#e0e7ff' },
    { to: '/app/focus', label: '⏳ Focus Room', bg: '#dcfce7' },
    { to: '/app/streaks', label: '🔥 Streaks & Badges', bg: 'var(--peach)' },
    { to: '/app/doubt', label: '💬 AI Doubt Solver', bg: 'var(--teal)' },
    { to: '/app/voice', label: '🎙️ Voice Tutor', bg: 'var(--lime)' },
    { to: '/app/settings', label: '⚙️ Settings & API Key', bg: '#f3e8ff' },
  ]

  return (
    <div>
      {/* Top Header & Status Badges */}
      <div className="top-row">
        <div className="greet">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <span className="badge-pill" style={{ background: 'var(--yellow)', fontSize: 11, padding: '4px 8px' }}>
              🔥 {streak}-Day Streak
            </span>
            <span className="badge-pill" style={{ background: 'var(--lime)', fontSize: 11, padding: '4px 8px' }}>
              ⚡ {xp} Pts
            </span>
            <span className="badge-pill" style={{ fontSize: 11, padding: '4px 8px' }}>
              📅 WBCHSE Sem 3
            </span>
            <Link to="/app/settings" className="badge-pill" style={{ fontSize: 11, padding: '4px 8px', textDecoration: 'none', background: '#e0e7ff' }}>
              ⚙️ Settings & Keys
            </Link>
          </div>
          <h1>Welcome back, {userName}.</h1>
          <p>{USER.classLabel} · All original AI tools integrated with new studio design</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: '100%', maxWidth: 360 }}>
          <Link className="btn btn-dark" to="/app/mock" style={{ flex: 1, minWidth: 120, justifyContent: 'center' }}>Start Mock Test</Link>
          <Link className="btn btn-ghost" to="/app/voice" style={{ flex: 1, minWidth: 120, justifyContent: 'center', background: 'var(--lime)', color: 'var(--ink)', borderColor: 'var(--ink)' }}>🎙️ Live Voice Call</Link>
        </div>
      </div>

      {/* Quick Launch Pills Bar */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 18 }}>
        {quickTools.map((q) => (
          <Link 
            key={q.to} 
            to={q.to} 
            className="btn btn-sm" 
            style={{ 
              background: q.bg, 
              border: '1.5px solid var(--ink)', 
              color: 'var(--ink)', 
              fontWeight: 600, 
              whiteSpace: 'nowrap' 
            }}
          >
            {q.label}
          </Link>
        ))}
      </div>

      {/* Primary Study Plan Hero Panel */}
      <div className="panel" style={{ marginBottom: 22, background: 'var(--yellow)', border: '1.5px solid var(--ink)' }}>
        <div className="mini-row">
          <div>
            <p className="kicker">Study Plan & Sem 3 Syllabus</p>
            <h2 style={{ marginBottom: 4 }}>Know exactly what comes next</h2>
            <p className="muted">Human Reproduction review, then Adarini long answers & The Bet SAQ tonight.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <b style={{ fontFamily: 'var(--font-serif)', fontSize: 44 }}>{pct}%</b>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>COMPLETED</div>
          </div>
        </div>
        <div className="progress-ring" style={{ marginTop: 14, height: 12, border: '1px solid var(--ink)' }}>
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Daily Study Streak & Level Progression Banner */}
      <div style={{ marginBottom: 24 }}>
        <StudyStreakTracker userName={userName} onExplore={() => {}} />
      </div>

      {/* Featured AI Mentors & Live Board Highlights */}
      <div className="featured-grid" style={{ marginBottom: 24 }}>
        {/* Voice AI Tutor Featured Banner */}
        <TiltContainer className="w-full">
          <div className="panel" style={{ height: "100%", background: '#fff', border: '2px solid var(--ink)', boxShadow: '4px 4px 0px var(--ink)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--pink)', display: 'grid', placeItems: 'center', fontSize: 20, border: '1.5px solid var(--ink)' }}>
                    🎙️
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-serif)' }}>Voice AI Tutor Studio</h3>
                    <small className="muted">Anjali 3D Model, Mahi Didi & Stranger</small>
                  </div>
                </div>
                <span className="badge-pill" style={{ background: 'var(--lime)', fontSize: 11 }}>Live Voice</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, margin: '8px 0 16px' }}>
                Speak aloud in Bengali or English. Direct live voice conversation without text intermediaries, animated sound waveforms, and synced whiteboard notes.
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                <span className="chip" style={{ background: 'var(--pink)', border: '1px solid var(--ink)', fontSize: 11 }}>💃 3D Anime Avatar</span>
                <span className="chip" style={{ background: 'var(--yellow)', border: '1px solid var(--ink)', fontSize: 11 }}>🗣️ Bengali Voice STT/TTS</span>
                <span className="chip" style={{ background: 'var(--teal)', border: '1px solid var(--ink)', fontSize: 11 }}>⚡ Gemini Live</span>
              </div>
            </div>
            <Link to="/app/voice" className="btn btn-dark" style={{ width: '100%', justifyContent: 'center' }}>
              Open Voice Tutor Studio →
            </Link>
          </div>
        </TiltContainer>

        {/* Live Board inside Voice AI Featured Banner */}
        <TiltContainer className="w-full">
          <div className="panel" style={{ height: "100%", background: '#fff', border: '2px solid var(--ink)', boxShadow: '4px 4px 0px var(--ink)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--teal)', display: 'grid', placeItems: 'center', fontSize: 20, border: '1.5px solid var(--ink)' }}>
                    📋
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontFamily: 'var(--font-serif)' }}>Voice AI Live Whiteboard</h3>
                    <small className="muted">Synced with Voice Mentors & Diagrams</small>
                  </div>
                </div>
                <span className="badge-pill" style={{ background: 'var(--yellow)', fontSize: 11 }}>In Voice AI</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5, margin: '8px 0 16px' }}>
                Integrated inside Voice AI Studio: As mentors speak, formulas & high-yield diagrams appear directly on the whiteboard without needing a disconnected tab.
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                <span className="chip" style={{ background: 'var(--lime)', border: '1px solid var(--ink)', fontSize: 11 }}>📐 KaTeX Formulas</span>
                <span className="chip" style={{ background: 'var(--peach)', border: '1px solid var(--ink)', fontSize: 11 }}>🧬 3D Biology Figures</span>
                <span className="chip" style={{ background: 'var(--blue)', border: '1px solid var(--ink)', fontSize: 11 }}>🎙️ Synced With Mentors</span>
              </div>
            </div>
            <Link to="/app/voice" className="btn btn-dark" style={{ width: '100%', justifyContent: 'center' }}>
              Launch Voice AI with Live Board →
            </Link>
          </div>
        </TiltContainer>
      </div>

      {/* Chapter Breakdown by Subject */}
      <div className="chapter-grid" style={{ marginBottom: 28 }}>
        {SYLLABUS.map((sub) => {
          const subDone = sub.chapters.filter((c) => c.done).length
          const subPct = Math.round((subDone / sub.chapters.length) * 100)
          return (
            <div 
              key={sub.subject} 
              className="panel" 
              style={{ background: sub.color, border: '1.5px solid var(--ink)', padding: 18 }}
            >
              <div className="mini-row">
                <b>{sub.subject}</b>
                <span className="chip" style={{ background: '#fff', border: '1px solid var(--ink)' }}>
                  {subDone}/{sub.chapters.length} Done
                </span>
              </div>
              <div className="bar" style={{ margin: '10px 0 12px', height: 8 }}>
                <span style={{ width: `${subPct}%` }} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                {sub.chapters.slice(0, 2).map((c) => (
                  <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span>{c.done ? '✓' : '○'}</span>
                    <span style={{ textDecoration: c.done ? 'line-through' : 'none' }}>{c.name}</span>
                  </div>
                ))}
              </div>
              <Link 
                to="/app/syllabus" 
                style={{ display: 'inline-block', marginTop: 12, fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}
              >
                Open Full Roadmap →
              </Link>
            </div>
          )
        })}
      </div>

      {/* All 24 Studio Tools Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, fontWeight: 500, margin: 0 }}>
            Personalized tutoring, totally redefined
          </h3>
          <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>
            24 complete AI & interactive tools built for WBCHSE Class 12 Sem 3
          </p>
        </div>
        <span className="badge-pill">24 Studio Tools</span>
      </div>

      {/* Tool Grid */}
      <div className="tool-grid">
        {TOOLS.map((t) => (
          <Link key={t.id} to={t.to} className="tool-card">
            <div>
              <div className="ico" style={{ background: t.color, border: '1.5px solid var(--ink)' }}>✦</div>
              <div className="tag" style={{ marginTop: 12 }}>{t.tag}</div>
              <h3>{t.title}</h3>
              <p>{t.desc}</p>
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>Launch Tool →</span>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--lime)' }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
