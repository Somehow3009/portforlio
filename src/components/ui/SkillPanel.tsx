import { useGame } from '../../store'
import { skills } from '../../data'

export function SkillPanel() {
  const activeInteraction = useGame((s) => s.activeInteraction)
  const phase = useGame((s) => s.phase)

  if (phase !== 'playing') return null
  if (!activeInteraction || activeInteraction.type !== 'skill') return null

  const skill = skills.find((s) => s.id === activeInteraction.id)
  if (!skill) return null

  return (
    <div
      data-ui
      className="absolute z-30 rounded-lg border bg-space-900/85 backdrop-blur-md p-5 w-72 shadow-[0_0_40px_rgba(0,0,0,0.6)] animate-panel-in"
      style={{ borderColor: `${skill.color}55`, top: '20%', right: '4%' }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          className="text-4xl"
          style={{ filter: `drop-shadow(0 0 10px ${skill.color})` }}
        >
          {skill.icon}
        </span>
        <div>
          <h3 className="font-display text-lg font-bold" style={{ color: skill.color }}>
            {skill.name}
          </h3>
          <p className="text-slate-400 text-xs">{skill.tagline}</p>
        </div>
      </div>

      <div className="space-y-3">
        <StatBar label="MASTERY" value={skill.mastery} color={skill.color} />
        <div className="flex justify-between font-mono text-xs text-slate-300 pt-1">
          <span>EXPERIENCE</span>
          <span style={{ color: skill.color }}>{skill.years} years</span>
        </div>
        <div className="flex justify-between font-mono text-xs text-slate-300">
          <span>TOWER STATUS</span>
          <span style={{ color: skill.color }}>● ONLINE</span>
        </div>
      </div>
    </div>
  )
}

function StatBar({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div>
      <div className="flex justify-between font-mono text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded bg-space-700/60 overflow-hidden">
        <div
          className="h-full rounded transition-all duration-700"
          style={{
            width: `${value}%`,
            background: color,
            boxShadow: `0 0 12px ${color}`,
          }}
        />
      </div>
    </div>
  )
}
