import { createFileRoute } from '@tanstack/react-router'
import { Translator } from '../components/Translator'

export const Route = createFileRoute('/')({ component: () => <Translator reverse={false} /> })
