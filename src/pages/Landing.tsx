import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FAQ, FEATURES, QUOTES, MENTORS, TOOLS, SYLLABUS, USER } from '../data.js'
import { voiceService } from '../services/voiceService'
import { HeroIllustrationStage } from '../components/HeroIllustrationStage'

function Nav() {
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <Link to="/" className="brand">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border-[1.5px] border-[#18181b] p-0.5 shadow-xs flex items-center justify-center shrink-0">
            <img src="/logo.svg" alt="Study Stranger" className="w-full h-full object-contain" />
          </div>
          <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#18181b]">
            Study Stranger
          </span>
        </Link>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#voice-demo">Voice AI</a>
          <a href="#syllabus">Syllabus</a>
          <a href="#tools">24 Tools</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="nav-cta">
          <Link className="btn btn-ghost btn-sm hidden sm:inline-flex" to="/login">Log in</Link>
          <Link className="btn btn-dark btn-sm text-xs sm:text-sm px-3.5 sm:px-4" to="/login">Try for free</Link>
        </div>
      </div>
    </header>
  )
}

function HeroScene3D() {
  return (
    <div className="hero-stage" style={{ marginTop: 16, width: "100%" }}>
      <HeroIllustrationStage />
    </div>
  )
}

export default function Landing() {
  const [feat, setFeat] = useState(0)
  const [testVoiceSpeaking, setTestVoiceSpeaking] = useState<string | null>(null)
  const [mcqAnswered, setMcqAnswered] = useState<number | null>(null)
  const nav = useNavigate()
  const f = FEATURES[feat]

  const handleTestVoice = (characterId: string, name: string, sampleText: string) => {
    if (testVoiceSpeaking === characterId) {
      voiceService.stop()
      setTestVoiceSpeaking(null)
      return
    }
    voiceService.stop()
    setTestVoiceSpeaking(characterId)
    voiceService.speak(sampleText, {
      character: characterId as any,
      rate: 1.0,
      onStart: () => setTestVoiceSpeaking(characterId),
      onEnd: () => setTestVoiceSpeaking(null)
    })
  }

  return (
    <div>
      <Nav />

      {/* Hero Section */}
      <section className="hero wrap">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span className="badge-pill" style={{ background: 'var(--yellow)' }}>
            ✨ Official WBCHSE Class 12 Semester 3 AI Hub
          </span>
          <span className="badge-pill" style={{ background: 'var(--lime)' }}>
            🔥 8,400+ Active Students
          </span>
          <span className="badge-pill" style={{ background: '#fff' }}>
            🎓 Study Stranger
          </span>
        </div>
        
        <h1>
          Learning that <em>adapts to you.</em>
        </h1>
        <p className="lede" style={{ margin: '0 auto 28px', maxWidth: 680, fontSize: 18, color: 'var(--ink-soft)' }}>
          Master Biology, Bengali A & English B with bilingual AI mentors, live speech tutors, interactive whiteboard, KaTeX equations, and full-length board mock exams.
        </p>

        <div className="hero-actions">
          <Link className="btn btn-dark" to="/login" style={{ boxShadow: '0 8px 24px rgba(25,25,25,0.18)' }}>
            🚀 Student Login / Register
          </Link>
          <Link className="btn btn-ghost" to="/login" style={{ background: '#fff' }}>
            🔑 Continue with Google
          </Link>
          <a className="btn btn-ghost" href="#voice-demo">
            🎙️ Hear Voice AI Demo
          </a>
        </div>

        <HeroScene3D />
      </section>

      {/* Live Status & Stats Section */}
      <section className="wrap">
        <p className="kicker" style={{ textAlign: 'center' }}>The trusted AI learning platform for Higher Secondary students</p>
        <div className="stats">
          {[
            ['8,400+', 'WBCHSE learners studying on the Sem 3 track', 'var(--peach)'],
            ['92%', 'reported dramatic score improvements on chapter mocks', 'var(--lime)'],
            ['4.9/5', 'mentor rating from over 12,000 solved doubts', 'var(--pink)']
          ].map(([n, t, bg]) => (
            <article className="stat" key={n} style={{ background: bg, minHeight: 200, border: '1.5px solid var(--ink)' }}>
              <div className="stat-copy" style={{ color: 'var(--ink)', textShadow: 'none' }}>
                <strong style={{ fontSize: 52 }}>{n}</strong>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{t}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Interactive Voice AI Audition Studio */}
      <section className="section wrap" id="voice-demo">
        <div className="panel" style={{ background: 'var(--blue)', border: '1.5px solid var(--ink)', padding: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <p className="kicker">Live Audio Showcase</p>
              <h2 style={{ fontSize: 34, margin: '4px 0' }}>Listen to your WBCHSE AI Mentors</h2>
              <p className="muted" style={{ maxWidth: 600 }}>
                Click below to hear each mentor explain a concept in real-time bilingual voice before logging in.
              </p>
            </div>
            <span className="badge-pill" style={{ background: '#fff' }}>🎙️ Instant Audio Playback</span>
          </div>

          <div className="mentor-grid">
            {MENTORS.map((m) => {
              const sampleLines: Record<string, string> = {
                stranger: "Namaskar Abhijit! Ami Stranger Dada. Microsporogenesis theke shuru kore Adarini-r bhabbostu, sob ami sohoje bujhiye debo.",
                mahi: "Hello Abhijit! Ami Mahi Didi. WBCHSE Class 12-e bhalo number paoa khub easy, jodi amra protidin 15 minute revision kori.",
                anjali: "Hi! Ami Anjali Didi. ZP3 sperm receptor ar fertilization process-er steps gulo cholo ekdom diagram diye shukiye feli!",
                zoya: "Hey Abhijit! Zoya here. Ruskin Bond-er Night Train at Deoli ebong Anton Chekhov-er The Bet-er SAQ gulo rapid fire quiz kora jak!"
              }
              const isSpeaking = testVoiceSpeaking === m.id
              return (
                <article 
                  key={m.id} 
                  className="mentor" 
                  style={{ 
                    background: m.color, 
                    border: isSpeaking ? '2.5px solid var(--ink)' : '1.5px solid var(--ink)',
                    boxShadow: isSpeaking ? '0 10px 24px rgba(0,0,0,0.15)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <b style={{ fontSize: 17 }}>{m.name}</b>
                    <div className="bn" style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{m.bn}</div>
                    <p style={{ fontSize: 12, marginTop: 4, fontWeight: 500 }}>{m.role}</p>
                    <small className="muted">{m.tone}</small>
                  </div>
                  <button 
                    onClick={() => handleTestVoice(m.id, m.name, sampleLines[m.id] || "Namaskar!")}
                    className="btn btn-dark btn-sm" 
                    style={{ marginTop: 14, width: '100%', fontSize: 12 }}
                  >
                    {isSpeaking ? '⏹ Stop Voice' : `🔊 Listen to ${m.name.split(' ')[0]}`}
                  </button>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Interactive Question of the Day Widget */}
      <section className="section wrap">
        <p className="kicker">Test Your Preparation</p>
        <h2>WBCHSE Class 12 Question of the Day</h2>
        <p className="lede">Try answering right here — see instant syllabus grounding and explanations.</p>

        <div className="panel" style={{ marginTop: 24, border: '1.5px solid var(--ink)', background: 'var(--yellow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span className="badge-pill" style={{ background: '#fff' }}>Biology · Unit I Reproduction</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-soft)' }}>MCQ · 1 Mark</span>
          </div>

          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 500, margin: '8px 0 16px' }}>
            The primary sperm receptor glycoprotein located on the Zona Pellucida of the human ovum is:
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
            {['ZP1', 'ZP2', 'ZP3', 'ZP4'].map((opt, idx) => {
              const isCorrect = idx === 2
              const isSelected = mcqAnswered === idx
              return (
                <button
                  key={opt}
                  onClick={() => setMcqAnswered(idx)}
                  className="opt"
                  style={{
                    background: isSelected ? (isCorrect ? 'var(--lime)' : '#fecaca') : '#fff',
                    borderColor: isSelected ? 'var(--ink)' : 'var(--line)',
                    fontWeight: isSelected ? 700 : 500,
                    padding: '14px 18px',
                    fontSize: 15
                  }}
                >
                  {String.fromCharCode(65 + idx)}. {opt} {isSelected && (isCorrect ? '✓ (Correct)' : '✕')}
                </button>
              )
            })}
          </div>

          {mcqAnswered !== null && (
            <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: '#fff', border: '1px solid var(--ink)' }}>
              <b>💡 WBCHSE Explanation:</b>
              <p style={{ marginTop: 4, fontSize: 14, color: 'var(--ink-soft)' }}>
                <b>ZP3</b> is the primary sperm receptor. Binding of the sperm head acrosome to ZP3 triggers the acrosome reaction, allowing the sperm to penetrate the zona pellucida and fertilize the oocyte.
              </p>
              <div style={{ marginTop: 10 }}>
                <Link className="btn btn-dark btn-sm" to="/login">
                  Practice 100+ More MCQs in Studio →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Feature Tabs Section */}
      <section className="section wrap" id="features">
        <p className="kicker">Start really learning in seconds</p>
        <h2>Stop fighting your notes. <em>Understand them.</em></h2>
        <p className="lede">See how Study Stranger turns Biology, Bengali A and English B into tools you will actually study from.</p>
        
        <div className="feature-tabs">
          {FEATURES.map((item, i) => (
            <button key={item.kicker} className={i === feat ? 'active' : ''} onClick={() => setFeat(i)}>
              {item.kicker}
            </button>
          ))}
        </div>

        <div className="feature-panel" style={{ background: f.color, border: '1.5px solid var(--ink)' }}>
          <div className="feature-copy">
            <div>
              <p className="kicker">{f.kicker}</p>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
            <div className="row" style={{ marginTop: 20 }}>
              <Link className="btn btn-dark" to="/login">Open in Studio</Link>
              <Link className="btn btn-ghost" to="/login">Google Sign In</Link>
            </div>
          </div>
          <div className="feature-visual">
            <div className="mini-ui" style={{ border: '1.5px solid var(--ink)' }}>
              <div className="mini-row">
                <b>Semester 3 Path</b>
                <span className="chip" style={{ background: 'var(--yellow)', border: '1px solid var(--ink)' }}>Today's Focus</span>
              </div>
              {[
                { name: 'Human Reproduction & Fertilization', pct: 85 },
                { name: 'Adarini — 4-Point Model Answer', pct: 60 },
                { name: 'The Bet — Confinement SAQ', pct: 40 }
              ].map((x) => (
                <div key={x.name} style={{ margin: '14px 0' }}>
                  <div className="mini-row"><span>{x.name}</span><b>{x.pct}%</b></div>
                  <div className="bar" style={{ height: 10 }}><span style={{ width: `${x.pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Complete Syllabus Showcase */}
      <section className="section wrap" id="syllabus">
        <p className="kicker">Class 12 Curriculum</p>
        <h2>Built Specifically for WBCHSE Semester 3</h2>
        <p className="lede">Every chapter, verse, and story aligned with the council guidelines and marking scheme.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginTop: 24 }}>
          {SYLLABUS.map((sub) => (
            <div key={sub.subject} className="panel" style={{ background: sub.color, border: '1.5px solid var(--ink)' }}>
              <div className="mini-row">
                <h3 style={{ fontSize: 24, margin: 0 }}>{sub.subject}</h3>
                <span className="chip" style={{ background: '#fff', border: '1px solid var(--ink)' }}>
                  {sub.chapters.length} Chapters
                </span>
              </div>
              <ul style={{ marginTop: 14, listStyle: 'none', padding: 0 }}>
                {sub.chapters.map((c) => (
                  <li key={c.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.06)', fontSize: 13.5 }}>
                    <span>{c.name}</span>
                    <span className="bn muted">{c.bn}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 24 Tools Showcase */}
      <section className="section wrap" id="tools">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
          <div>
            <p className="kicker">Complete Ecosystem</p>
            <h2>All 24 AI Studio Tools Ready on Day 1</h2>
            <p className="lede">Everything you need for WBCHSE preparation under one unified platform.</p>
          </div>
          <Link className="btn btn-dark" to="/login">
            Launch All 24 Tools →
          </Link>
        </div>

        <div className="tool-grid">
          {TOOLS.slice(0, 12).map((t) => (
            <Link key={t.id} to={t.to} className="tool-card" style={{ border: '1.5px solid var(--ink)' }}>
              <div>
                <div className="ico" style={{ background: t.color, border: '1px solid var(--ink)' }}>✦</div>
                <div className="tag" style={{ marginTop: 10 }}>{t.tag}</div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Research & Proof */}
      <section className="section wrap" id="research">
        <div className="research">
          <div>
            <p className="kicker">Proven Results</p>
            <h2>Finals season put us to the test. We <em>passed</em>.</h2>
            <div className="research-stats">
              {[
                ['92%', 'of regular active users reported grade improvements on semester mocks'],
                ['85%', 'of students felt confident recalling Bengali & English quotes under exam pressure'],
                ['30%', 'reduction in average study time reported through AI diagnostic flashcards']
              ].map(([n, t]) => (
                <div className="rs" key={n}>
                  <b>{n}</b>
                  <span className="muted">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="photo-stack">
            <div className="photo-card" style={{ background: 'var(--teal)', minHeight: 180, display: 'grid', placeItems: 'center', padding: 28, border: '1.5px solid var(--ink)' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 26, textAlign: 'center' }}>
                AI workforce-ready notes and explanations for every HS classroom in West Bengal.
              </p>
            </div>
            <div className="photo-card" style={{ background: 'var(--yellow)', minHeight: 160, display: 'grid', placeItems: 'center', padding: 28, border: '1.5px solid var(--ink)' }}>
              <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22, textAlign: 'center' }}>
                The Learn Engine sequences your Sem 3 path, then drills your exact weak spots.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section wrap">
        <p className="kicker">Testimonials</p>
        <h2>Helping students achieve more.</h2>
        <div className="quotes">
          {QUOTES.map((q) => (
            <article className="quote" key={q.name} style={{ border: '1.5px solid var(--ink)' }}>
              <p>“ {q.text} ”</p>
              <small style={{ fontWeight: 600 }}>{q.name}</small>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section wrap" id="faq">
        <div className="faq">
          <div>
            <p className="kicker">Got questions?</p>
            <h2>Frequently asked questions</h2>
            <p className="lede">Every question has a good answer. Here’s what to know about Study Stranger and WBCHSE AI tutoring.</p>
          </div>
          <div>
            {FAQ.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Site Footer */}
      <footer className="site-footer">
        <div className="wrap foot-grid">
          <div className="brand"><img src="/logo.svg" alt="" /> Study Stranger Pro</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span>WBCHSE Class 12 Semester 3 AI Study Hub · Biology · Bengali A · English B</span>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, marginTop: 4 }}>
              <Link to="/privacy" style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}>Privacy Policy (গোপনীয়তা নীতি)</Link>
              <Link to="/login" style={{ color: 'var(--ink-soft)' }}>Student Login</Link>
            </div>
          </div>
          <Link className="btn btn-dark btn-sm" to="/login">
            Open Studio Tools
          </Link>
        </div>
      </footer>
    </div>
  )
}
