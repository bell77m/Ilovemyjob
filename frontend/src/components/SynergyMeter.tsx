import { synergyScore } from '../lib/cringe'

// F8: buzzword count as a Win95 progress bar. text null = nothing translated yet.
export function SynergyMeter({ text, words }: { text: string | null; words: string[] }) {
  const s = text === null ? null : synergyScore(text, words)
  return (
    <div className="progress-wrap" style={{ marginTop: 8 }}>
      <span className="small">
        {s ? `Synergy Meter: ${s.score}% (${s.buzzwords.join(', ') || 'none detected'})` : 'Synergy Meter: 0%'}
      </span>
      <span className="progress" aria-hidden="true"><span style={{ width: `${s?.score ?? 0}%` }} /></span>
    </div>
  )
}
