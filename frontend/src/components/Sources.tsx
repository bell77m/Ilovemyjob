import type { Pair } from '../lib/cringe'

const NAMES = ['Chad Synergy, Chief Vibes Officer', 'Brenda Leverage, VP of Gratitude', 'Kyle Disrupt, Serial Thought Leader']

// "Citations" for the RAG examples. null = nothing translated yet.
export function Sources({ examples, reverse }: { examples: Pair[] | null; reverse: boolean }) {
  const heading = examples === null || examples.length ? `Sources: ${examples?.length || 3} thought leaders` : 'Sources: vibes only'
  return (
    <section aria-labelledby="sources-heading">
      <h3 id="sources-heading">{heading}</h3>
      <ol className="sources">
        {examples?.map((ex, i) => (
          <li key={i}><b>{NAMES[i]}: </b>{reverse ? ex.human : ex.linkedin}</li>
        ))}
      </ol>
    </section>
  )
}
