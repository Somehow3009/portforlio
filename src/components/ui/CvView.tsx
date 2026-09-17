import { useGame } from '../../store'
import { profile, skills, projects, experiences } from '../../data'
import { audio } from '../../audio'

export function CvView() {
  const mode = useGame((s) => s.mode)
  const setMode = useGame((s) => s.setMode)
  const phase = useGame((s) => s.phase)

  if (mode !== '2d' || phase !== 'playing') return null

  const backTo3D = () => {
    audio.uiClick()
    setMode('3d')
  }

  return (
    <div data-ui className="absolute inset-0 z-30 overflow-y-auto bg-space-950 cyber-scroll cv-print">
      {/* top bar */}
      <div className="no-print sticky top-0 z-40 bg-space-950/80 backdrop-blur border-b border-slate-800 px-5 py-3 flex items-center justify-between">
        <span className="font-display text-neon-cyan font-bold tracking-widest">2D CV</span>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded border border-neon-green/50 text-neon-green font-mono text-sm hover:bg-neon-green/10 transition"
          >
            🖨 PRINT / PDF
          </button>
          <button
            onClick={backTo3D}
            className="px-4 py-2 rounded border border-neon-cyan/50 text-neon-cyan font-mono text-sm hover:bg-neon-cyan/10 transition"
          >
            ⬒ BACK TO 3D WORLD
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* header */}
        <header className="mb-8">
          <h1 className="font-display text-4xl font-black text-white">{profile.name}</h1>
          <p className="text-neon-cyan font-mono mt-1">{profile.title}</p>
          <div className="flex flex-wrap gap-4 mt-4 font-mono text-sm text-slate-400">
            <span>📍 {profile.location}</span>
            <span>✉ {profile.email}</span>
            {profile.phone && <span>📞 {profile.phone}</span>}
            {profile.socials.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="hover:text-neon-cyan transition">
                {s.label}
              </a>
            ))}
          </div>
        </header>

        {/* bio */}
        <section className="mb-10">
          <h2 className="section-title">PROFILE</h2>
          <p className="text-slate-300 leading-relaxed">{profile.bio}</p>
        </section>

        {/* skills */}
        <section className="mb-10">
          <h2 className="section-title">SKILLS & TECH STACK</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {skills.map((s) => (
              <div key={s.id} className="rounded border border-slate-700/60 bg-space-800/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold" style={{ color: s.color }}>
                    {s.icon} {s.name}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{s.years}y</span>
                </div>
                <div className="mt-2 h-1.5 rounded bg-space-700/60 overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{ width: `${s.mastery}%`, background: s.color }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 font-mono">{s.tagline}</p>
              </div>
            ))}
          </div>
        </section>

        {/* experience */}
        <section className="mb-10">
          <h2 className="section-title">EXPERIENCE</h2>
          <div className="space-y-4">
            {experiences.map((e) => (
              <div key={e.id} className="rounded border border-slate-700/60 bg-space-800/50 p-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-lg font-bold" style={{ color: e.color }}>
                    ◈ {e.company}
                  </h3>
                  <span className="text-xs font-mono px-2 py-1 rounded" style={{ color: e.color, background: `${e.color}11`, border: `1px solid ${e.color}44` }}>
                    {e.period}
                  </span>
                </div>
                <p className="text-neon-cyan font-mono text-sm mt-1">{e.role}</p>
                <ul className="mt-3 space-y-1.5">
                  {e.bullets.map((b) => (
                    <li key={b} className="text-slate-300 text-sm flex gap-2">
                      <span style={{ color: e.color }}>▸</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 mt-3">
                  {e.tech.map((t) => (
                    <span key={t} className="text-xs font-mono px-2 py-0.5 rounded bg-space-700/50 text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* projects */}
        <section className="mb-10">
          <h2 className="section-title">PROJECTS</h2>
          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="rounded border border-slate-700/60 bg-space-800/50 p-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-display text-lg font-bold" style={{ color: p.color }}>
                    ◈ {p.title}
                  </h3>
                  <span className="text-xs font-mono px-2 py-1 rounded" style={{ color: p.color, background: `${p.color}11`, border: `1px solid ${p.color}44` }}>
                    {p.highlight}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mt-2">{p.description}</p>
                <p className="text-slate-400 text-sm mt-1"><span style={{ color: p.color }}>Problem:</span> {p.problem}</p>
                <p className="text-slate-400 text-sm"><span style={{ color: p.color }}>Solution:</span> {p.solution}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {p.tech.map((t) => (
                    <span key={t} className="text-xs font-mono px-2 py-0.5 rounded bg-space-700/50 text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 mt-3 font-mono text-sm">
                  {p.live && (
                    <a href={p.live} target="_blank" rel="noreferrer" className="text-neon-green hover:underline" onClick={() => audio.send()}>
                      ⚡ Live Demo
                    </a>
                  )}
                  <a href={p.github} target="_blank" rel="noreferrer" className="hover:underline" onClick={() => audio.uiClick()}>
                    GitHub
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center text-slate-500 text-xs font-mono pb-10">
          © {new Date().getFullYear()} {profile.name} · Built as the "Developer's Universe"
        </footer>
      </div>
    </div>
  )
}
