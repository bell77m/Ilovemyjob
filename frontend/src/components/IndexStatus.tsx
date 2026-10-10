import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { indexCorpus } from '../server/fns'
import { useStatus } from './StatusBar'

// Embeds the RAG corpus once per page load and reports it in the status bar.
export function IndexStatus() {
  const setStatus = useStatus()
  const q = useQuery({ queryKey: ['corpus-index'], queryFn: () => indexCorpus(), retry: 1, staleTime: Infinity })
  useEffect(() => {
    if (q.isPending) setStatus('Indexing thought leadership...')
    else if (q.isSuccess) setStatus(`Indexing thought leadership... ${q.data.count}/${q.data.count}`)
    else setStatus('Sources: vibes only')
  }, [q.isPending, q.isSuccess, q.data, setStatus])
  return null
}
